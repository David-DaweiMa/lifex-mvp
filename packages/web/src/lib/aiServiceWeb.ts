import OpenAI from 'openai';
import { BaseAIService, AIRecommendationRequest, AIRecommendationResponse, AIConversationContext, AIConversationResponse, AIBusinessReasoningRequest, AIStatusResponse } from '@lifex/shared';

/**
 * Web端的AI服务实现
 * 继承自共享包的BaseAIService，提供具体的web实现
 */
export class WebAIService extends BaseAIService {
  protected openai: OpenAI | null;
  protected aiModel: string;
  protected systemPrompt: string;
  protected businessContext: string;

  constructor() {
    super();
    
    // Initialize OpenAI client only if API key is available
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });
    }

    this.aiModel = process.env.OPENAI_MODEL || 'gpt-5-nano';

    // System prompt
    this.systemPrompt = `You are a friendly New Zealand local life assistant, specializing in helping users discover and recommend restaurants, cafes, attractions, and activities in New Zealand.

Your characteristics:
1. Friendly and enthusiastic, using New Zealand English accent
2. Provide accurate and practical local recommendations
3. Understand New Zealand culture and lifestyle
4. Able to engage in natural conversation, not just recommendations

Please respond in English, maintaining a friendly and professional tone.`;

    // Business context
    this.businessContext = `

Available business types:
- Restaurants (restaurants)
- Cafes (cafes)
- Bars (bars)
- Attractions (attractions)
- Activities (activities)
- Shopping (shopping)

Please provide the most relevant recommendations based on user needs.`;
  }

  /**
   * 获取 AI 推荐
   */
  async getAIRecommendations(
    request: AIRecommendationRequest,
    availableBusinesses: any[] | null
  ): Promise<AIRecommendationResponse> {
    // Check if OpenAI client is available
    if (!this.openai) {
      console.warn('OpenAI API key not configured, using fallback recommendations');
      return this.generateFallbackRecommendations(availableBusinesses, 'en');
    }

    try {
      const userPrompt = `
User query: "${request.query}"
${request.userLocation ? `User location: ${JSON.stringify(request.userLocation)}` : ''}
${request.userPreferences ? `User preferences: ${request.userPreferences.join(', ')}` : ''}

Please provide recommendations in the following format:
{
  "recommendations": ["business_id_1", "business_id_2", "business_id_3"],
  "explanation": "Reason for recommendation",
  "confidence": 0.85,
  "suggestedQueries": ["related query 1", "related query 2", "related query 3"]
}

If unable to provide specific recommendations, please return an empty array but provide useful explanation.`;

      // Use GPT-5 Nano (Responses API)
      const response = await this.openai.responses.create({
        model: this.aiModel,
        instructions: this.systemPrompt + this.businessContext,
        input: userPrompt
      });

      console.log(`Using model: ${this.aiModel}`);

      const responseText = this.parseAIResponseText(response);

      if (!responseText) {
        throw new Error('No response from AI model');
      }

      // Parse JSON response
      const parsedResponse = JSON.parse(responseText);

      // Map business IDs to actual business objects
      const recommendedBusinesses = availableBusinesses ? 
        availableBusinesses.filter(business =>
          parsedResponse.recommendations.includes((business as any).id)
        ) : [];

      return {
        recommendations: recommendedBusinesses,
        explanation: parsedResponse.explanation,
        confidence: parsedResponse.confidence,
        suggestedQueries: parsedResponse.suggestedQueries
      };

    } catch (error) {
      return this.handleAIError(error, 'recommendation', this.generateFallbackRecommendations(availableBusinesses, 'en'));
    }
  }

  /**
   * 生成对话回复
   */
  async generateConversationalResponse(
    userMessage: string,
    context?: AIConversationContext
  ): Promise<AIConversationResponse> {
    // Check if OpenAI client is available
    if (!this.openai) {
      console.warn('OpenAI API key not configured, using fallback response');
      return this.generateFallbackConversationResponse('en');
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
      let response = await this.openai.responses.create({
        model: this.aiModel,
        instructions: this.systemPrompt,
        input: `User message: "${userMessage}"${contextPrompt}${preferencesPrompt}`,
        reasoning: { effort: 'low' }
      });

      console.log(`使用模型: ${this.aiModel}`);

      // 确保 response 有值
      if (!response) {
        console.log('⚠️  AI 模型返回空响应，使用回退消息');
        return this.generateFallbackConversationResponse('en');
      }

      return {
        message: this.parseAIResponseText(response) || 'No response from AI',
        followUpQuestions: this.generateFollowUpQuestions(userMessage)
      };

    } catch (error) {
      return this.handleAIError(error, 'conversation', this.generateFallbackConversationResponse('en'));
    }
  }

  /**
   * 生成商家推荐理由
   */
  async generateBusinessReasoning(
    request: AIBusinessReasoningRequest
  ): Promise<string> {
    const { business, userQuery, userContext } = request;

    // Check if OpenAI client is available
    if (!this.openai) {
      console.warn('OpenAI API key not configured, using fallback reasoning');
      return (business as any).aiReason || '这个商家看起来不错，值得一试！';
    }

    try {
      const prompt = `
基于以下商家信息，生成一个吸引人的推荐理由：

商家信息：
- 名称: ${(business as any).name}
- 类型: ${(business as any).type}
- 描述: ${(business as any).description || '无描述'}
- 位置: ${(business as any).location || '未知位置'}
${userQuery ? `用户查询: ${userQuery}` : ''}
${userContext ? `用户上下文: ${JSON.stringify(userContext)}` : ''}

请生成一个简短、吸引人的推荐理由，突出商家的特色和优势。`;

      const response = await this.openai.responses.create({
        model: this.aiModel,
        instructions: this.systemPrompt,
        input: prompt,
        reasoning: { effort: 'low' }
      });

      console.log(`使用模型: ${this.aiModel}`);

      return this.parseAIResponseText(response) || (business as any).aiReason || '这个商家看起来不错，值得一试！';

    } catch (error) {
      return this.handleAIError(error, 'reasoning', (business as any).aiReason || '这个商家看起来不错，值得一试！');
    }
  }

  /**
   * 提取用户偏好
   */
  async extractUserPreferences(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string[]> {
    // Check if OpenAI client is available
    if (!this.openai) {
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

      const response = await this.openai.responses.create({
        model: this.aiModel,
        instructions: this.systemPrompt,
        input: prompt,
        reasoning: { effort: 'low' }
      });

      const responseText = this.parseAIResponseText(response);
      if (!responseText) {
        return [];
      }

      try {
        const preferences = JSON.parse(responseText);
        return Array.isArray(preferences) ? preferences : [];
      } catch {
        return [];
      }

    } catch (error) {
      return this.handleAIError(error, 'preferences extraction', []);
    }
  }

  /**
   * 检查 AI 服务状态
   */
  async checkAIStatus(): Promise<AIStatusResponse> {
    // Check if OpenAI client is available
    if (!this.openai) {
      return {
        isAvailable: false,
        model: this.aiModel,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      const response = await this.openai.responses.create({
        model: this.aiModel,
        input: 'Hello',
        reasoning: { effort: 'low' }
      });

      return {
        isAvailable: true,
        model: this.aiModel
      };

    } catch (error) {
      console.error('AI 服务检查失败:', error);
      return {
        isAvailable: false,
        model: this.aiModel,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// 导出单例实例
export const webAIService = new WebAIService();

// 为了向后兼容，也导出原来的函数
export const {
  getAIRecommendations,
  generateConversationalResponse,
  generateBusinessReasoning,
  extractUserPreferences,
  checkAIStatus
} = webAIService;
