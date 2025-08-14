import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano';

// 系统提示词
const SYSTEM_PROMPT = `你是一个友好的新西兰本地生活助手，专门帮助用户发现和推荐新西兰的餐厅、咖啡店、景点和活动。

你的特点：
1. 友好、热情，使用新西兰英语口音
2. 提供准确、实用的本地推荐
3. 了解新西兰的文化和生活方式
4. 能够进行自然对话，不仅仅是推荐

请用中文回复，保持友好和专业的语调。`;

// 业务上下文
const BUSINESS_CONTEXT = `

可用的商家类型：
- 餐厅 (restaurants)
- 咖啡店 (cafes)
- 酒吧 (bars)
- 景点 (attractions)
- 活动 (activities)
- 购物 (shopping)

请根据用户的需求提供最相关的推荐。`;

export interface AIRecommendationRequest {
  query: string;
  userLocation?: any;
  userPreferences?: string[];
}

export interface AIRecommendationResponse {
  recommendations: any[];
  explanation: string;
  confidence: number;
  suggestedQueries: string[];
}

export interface AIConversationContext {
  userType?: string;
  userLocation?: any;
  userPreferences?: string[];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIConversationResponse {
  message: string;
  followUpQuestions?: string[];
}

/**
 * 获取 AI 推荐
 */
export async function getAIRecommendations(
  request: AIRecommendationRequest,
  availableBusinesses: any[] | null
): Promise<AIRecommendationResponse> {
  // Check if OpenAI client is available
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback recommendations');
    return {
      recommendations: availableBusinesses ? availableBusinesses.slice(0, 3) : [],
      explanation: "由于AI服务暂时不可用，我为您推荐了一些热门商家。请尝试更具体的查询，比如'推荐奥克兰的咖啡店'或'寻找惠灵顿的餐厅'。",
      confidence: 0.5,
      suggestedQueries: ["推荐咖啡店", "寻找餐厅", "附近景点"]
    };
  }

  try {
    const userPrompt = `
用户查询: "${request.query}"
${request.userLocation ? `用户位置: ${JSON.stringify(request.userLocation)}` : ''}
${request.userPreferences ? `用户偏好: ${request.userPreferences.join(', ')}` : ''}

请提供推荐，格式如下：
{
  "recommendations": ["business_id_1", "business_id_2", "business_id_3"],
  "explanation": "推荐理由",
  "confidence": 0.85,
  "suggestedQueries": ["相关查询1", "相关查询2", "相关查询3"]
}

如果无法提供具体推荐，请返回空数组但提供有用的解释。`;

    // 使用 GPT-5 Nano (Responses API)
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SYSTEM_PROMPT + BUSINESS_CONTEXT,
      input: userPrompt
    });

    console.log(`使用模型: ${AI_MODEL}`);

    const responseText = response.output_text;

    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Parse JSON response
    const parsedResponse = JSON.parse(responseText);

    // Map business IDs to actual business objects
    const recommendedBusinesses = availableBusinesses ? 
      availableBusinesses.filter(business =>
        parsedResponse.recommendations.includes(business.id)
      ) : [];

    return {
      recommendations: recommendedBusinesses,
      explanation: parsedResponse.explanation,
      confidence: parsedResponse.confidence,
      suggestedQueries: parsedResponse.suggestedQueries
    };

  } catch (error) {
    console.error('AI recommendation error:', error);
    
    // 返回默认推荐
    return {
      recommendations: availableBusinesses ? availableBusinesses.slice(0, 3) : [],
      explanation: "抱歉，我现在无法提供具体推荐。请尝试更具体的查询，比如'推荐奥克兰的咖啡店'或'寻找惠灵顿的餐厅'。",
      confidence: 0.5,
      suggestedQueries: ["推荐咖啡店", "寻找餐厅", "附近景点"]
    };
  }
}

/**
 * 生成对话回复
 */
export async function generateConversationalResponse(
  userMessage: string,
  context?: AIConversationContext
): Promise<AIConversationResponse> {
  // Check if OpenAI client is available
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback response');
    return {
      message: "G'day! I'm here to help you discover amazing places in New Zealand! What are you looking for today?",
      followUpQuestions: generateFollowUpQuestions(userMessage)
    };
  }

  try {
    // 构建上下文提示
    const contextPrompt = context?.userLocation ? 
      `\n用户位置信息: ${JSON.stringify(context.userLocation)}` : '';
    
    const userTypePrompt = context?.userType ? 
      `\n用户类型: ${context.userType}` : '';

    // 构建偏好提示
    const preferencesPrompt = context?.userPreferences ? 
      `\n用户偏好: ${context.userPreferences.join(', ')}` : '';

    // 使用 GPT-5 Nano (Responses API)
    let response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: `User message: "${userMessage}"${contextPrompt}${preferencesPrompt}`,
      reasoning: { effort: 'low' }
    });

    console.log(`使用模型: ${AI_MODEL}`);

    // 确保 response 有值
    if (!response) {
      console.log('⚠️  AI 模型返回空响应，使用回退消息');
      return {
        message: "I'm here to help you discover amazing places in New Zealand! What are you looking for today?",
        followUpQuestions: generateFollowUpQuestions(userMessage)
      };
    }

    return {
      message: typeof response === 'string' ? response : response.output_text || 'No response from AI',
      followUpQuestions: generateFollowUpQuestions(userMessage)
    };

  } catch (error) {
    console.error('AI conversation error:', error);
    
    // 返回友好的回退消息
    return {
      message: "G'day! I'm here to help you discover amazing places in New Zealand! What are you looking for today?",
      followUpQuestions: ['推荐一些餐厅', '今天天气如何？', '有什么活动推荐？']
    };
  }
}

/**
 * 生成后续问题
 */
function generateFollowUpQuestions(userMessage: string): string[] {
  const messageLower = userMessage.toLowerCase();
  
  if (messageLower.includes('餐厅') || messageLower.includes('food') || messageLower.includes('eat')) {
    return [
      '想要什么类型的餐厅？',
      '有预算限制吗？',
      '需要预订吗？'
    ];
  }
  
  if (messageLower.includes('咖啡') || messageLower.includes('coffee') || messageLower.includes('cafe')) {
    return [
      '喜欢什么风格的咖啡？',
      '需要工作空间吗？',
      '有甜点偏好吗？'
    ];
  }
  
  if (messageLower.includes('活动') || messageLower.includes('activity') || messageLower.includes('event')) {
    return [
      '喜欢室内还是户外活动？',
      '有特定兴趣吗？',
      '需要预订吗？'
    ];
  }
  
  if (messageLower.includes('天气') || messageLower.includes('weather')) {
    return [
      '需要具体城市的天气吗？',
      '计划什么户外活动？',
      '需要一周天气预报吗？'
    ];
  }
  
  // 默认问题
  return [
    '推荐一些餐厅',
    '今天天气如何？',
    '有什么活动推荐？'
  ];
}

/**
 * 生成商家推理
 */
export async function generateBusinessReasoning(
  business: any,
  userQuery: string,
  userPreferences?: string[]
): Promise<string> {
  // Check if OpenAI client is available
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback reasoning');
    return business.aiReason || '这个商家看起来不错，值得一试！';
  }

  try {
    const prompt = `
商家信息: ${JSON.stringify(business)}
用户查询: "${userQuery}"
用户偏好: ${userPreferences ? userPreferences.join(', ') : '无特定偏好'}

请分析为什么这个商家适合用户的需求，提供详细的推理过程。`;

    // 使用 GPT-5 Nano (Responses API)
    const gpt5Response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: prompt,
      reasoning: { effort: 'low' }
    });

    const response = gpt5Response.output_text;

    console.log(`使用模型: ${AI_MODEL}`);

    return response || business.aiReason;

  } catch (error) {
    console.error('AI reasoning error:', error);
    return business.aiReason || '这个商家看起来不错，值得一试！';
  }
}

/**
 * 提取用户偏好
 */
export async function extractUserPreferences(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string[]> {
  // Check if OpenAI client is available
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback preferences');
    return [];
  }

  try {
    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `
基于以下对话历史，提取用户的偏好和兴趣：

${conversationText}

请返回一个 JSON 数组，包含用户偏好：
["偏好1", "偏好2", "偏好3"]

例如：["咖啡", "户外活动", "预算友好"]`;

    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: prompt,
      reasoning: { effort: 'low' }
    });

    if (!response.output_text) {
      return [];
    }

    try {
      const preferences = JSON.parse(response.output_text);
      return Array.isArray(preferences) ? preferences : [];
    } catch {
      return [];
    }

  } catch (error) {
    console.error('提取用户偏好失败:', error);
    return [];
  }
}

/**
 * 检查 AI 服务状态
 */
export async function checkAIStatus(): Promise<{
  isAvailable: boolean;
  model: string;
  error?: string;
}> {
  // Check if OpenAI client is available
  if (!openai) {
    return {
      isAvailable: false,
      model: AI_MODEL,
      error: 'OpenAI API key not configured'
    };
  }

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      input: 'Hello',
      reasoning: { effort: 'low' }
    });

    return {
      isAvailable: true,
      model: AI_MODEL
    };

  } catch (error) {
    console.error('AI 服务检查失败:', error);
    return {
      isAvailable: false,
      model: AI_MODEL,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
