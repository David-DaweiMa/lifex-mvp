// 注意：这是共享包的AI服务，需要根据具体平台进行调整

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

export interface AIBusinessReasoningRequest {
  business: any;
  userQuery?: string;
  userContext?: any;
}

export interface AIStatusResponse {
  isAvailable: boolean;
  model: string;
  error?: string;
}

export interface AIService {
  // 获取AI推荐
  getAIRecommendations(
    request: AIRecommendationRequest,
    availableBusinesses: any[] | null
  ): Promise<AIRecommendationResponse>;

  // 生成对话回复
  generateConversationalResponse(
    userMessage: string,
    context?: AIConversationContext
  ): Promise<AIConversationResponse>;

  // 生成商家推荐理由
  generateBusinessReasoning(
    request: AIBusinessReasoningRequest
  ): Promise<string>;

  // 提取用户偏好
  extractUserPreferences(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string[]>;

  // 检查AI服务状态
  checkAIStatus(): Promise<AIStatusResponse>;
}

// 抽象基类，提供通用的AI逻辑
export abstract class BaseAIService implements AIService {
  protected abstract openai: any;
  protected abstract aiModel: string;
  protected abstract systemPrompt: string;
  protected abstract businessContext: string;

  abstract getAIRecommendations(
    request: AIRecommendationRequest,
    availableBusinesses: any[] | null
  ): Promise<AIRecommendationResponse>;

  abstract generateConversationalResponse(
    userMessage: string,
    context?: AIConversationContext
  ): Promise<AIConversationResponse>;

  abstract generateBusinessReasoning(
    request: AIBusinessReasoningRequest
  ): Promise<string>;

  abstract extractUserPreferences(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string[]>;

  abstract checkAIStatus(): Promise<AIStatusResponse>;

  // 通用的错误处理
  protected handleAIError(error: any, context: string, fallbackResponse: any): any {
    console.error(`AI ${context} 失败:`, error);
    return fallbackResponse;
  }

  // 通用的回退推荐生成
  protected generateFallbackRecommendations(
    availableBusinesses: any[] | null,
    language: 'en' | 'zh' = 'en'
  ): AIRecommendationResponse {
    const messages = {
      en: {
        explanation: "Since AI service is temporarily unavailable, I've recommended some popular businesses for you. Please try more specific queries like 'recommend cafes in Auckland' or 'find restaurants in Wellington'.",
        suggestedQueries: ["recommend cafes", "find restaurants", "nearby attractions"]
      },
      zh: {
        explanation: "抱歉，我现在无法提供具体推荐。请尝试更具体的查询，比如'推荐奥克兰的咖啡店'或'寻找惠灵顿的餐厅'。",
        suggestedQueries: ["推荐咖啡店", "寻找餐厅", "附近景点"]
      }
    };

    return {
      recommendations: availableBusinesses ? availableBusinesses.slice(0, 3) : [],
      explanation: messages[language].explanation,
      confidence: 0.5,
      suggestedQueries: messages[language].suggestedQueries
    };
  }

  // 通用的回退对话回复
  protected generateFallbackConversationResponse(
    language: 'en' | 'zh' = 'en'
  ): AIConversationResponse {
    const messages = {
      en: {
        message: "G'day! I'm here to help you discover amazing places in New Zealand! What are you looking for today?",
        followUpQuestions: ['Recommend some restaurants', 'How\'s the weather today?', 'Any activity recommendations?']
      },
      zh: {
        message: "你好！我是你的新西兰生活助手，帮助发现精彩的地方！今天你想找什么？",
        followUpQuestions: ['推荐一些餐厅', '今天天气如何？', '有什么活动推荐？']
      }
    };

    return {
      message: messages[language].message,
      followUpQuestions: messages[language].followUpQuestions
    };
  }

  // 生成后续问题的辅助方法
  protected generateFollowUpQuestions(userMessage: string): string[] {
    const questions = [
      '你想了解哪个地区的更多信息？',
      '有什么特定的偏好或要求吗？',
      '需要我帮你规划行程吗？'
    ];
    
    // 根据用户消息内容调整问题
    if (userMessage.toLowerCase().includes('restaurant') || userMessage.includes('餐厅')) {
      questions.unshift('你想尝试什么类型的菜系？');
    } else if (userMessage.toLowerCase().includes('cafe') || userMessage.includes('咖啡')) {
      questions.unshift('你更喜欢室内还是户外的咖啡店？');
    }
    
    return questions.slice(0, 3);
  }

  // 验证AI响应格式
  protected validateAIResponse(response: any): boolean {
    return response && 
           typeof response === 'object' && 
           'output_text' in response;
  }

  // 解析AI响应文本
  protected parseAIResponseText(response: any): string {
    if (typeof response === 'string') {
      return response;
    }
    
    if (this.validateAIResponse(response)) {
      return response.output_text || '';
    }
    
    return '';
  }
}
