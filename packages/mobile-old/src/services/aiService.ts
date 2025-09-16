import { BaseAIService, AIRecommendationRequest, AIRecommendationResponse, AIConversationContext, AIConversationResponse, AIBusinessReasoningRequest, AIStatusResponse } from '@lifex/shared';
import { supabase } from '../lib/supabase';
import locationService from './locationService';
import notificationService from './notificationService';

export class MobileAIService extends BaseAIService {
  private apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'; // Web端的API地址
  
  // 实现抽象属性
  protected openai: any = null;
  protected aiModel: string = 'gpt-4';
  protected systemPrompt: string = '你是一个智能助手，帮助用户找到最适合的业务和服务。';
  protected businessContext: string = 'general';

  async getAIRecommendations(
    request: AIRecommendationRequest,
    availableBusinesses: any[] | null
  ): Promise<AIRecommendationResponse> {
    try {
      // 调用Web端的AI API
      const response = await fetch(`${this.apiBaseUrl}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request, availableBusinesses }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as AIRecommendationResponse;
    } catch (error: any) {
      console.error('获取AI推荐失败:', error);
      return this.generateFallbackRecommendations();
    }
  }

  async generateConversationalResponse(
    userMessage: string,
    context?: AIConversationContext
  ): Promise<AIConversationResponse> {
    try {
      // 调用Web端的AI对话API
      const response = await fetch(`${this.apiBaseUrl}/ai/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as AIConversationResponse;
    } catch (error: any) {
      console.error('生成对话响应失败:', error);
      return this.generateFallbackConversationResponse();
    }
  }

  async generateBusinessReasoning(
    request: AIBusinessReasoningRequest
  ): Promise<string> {
    try {
      // 调用Web端的AI商业推理API
      const response = await fetch(`${this.apiBaseUrl}/ai/business-reasoning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.reasoning || '基于分析，这是一个值得考虑的选择。';
    } catch (error: any) {
      console.error('生成商业推理失败:', error);
      return '基于分析，这是一个值得考虑的选择。';
    }
  }

  async extractUserPreferences(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string[]> {
    try {
      // 调用Web端的用户偏好提取API
      const response = await fetch(`${this.apiBaseUrl}/ai/extract-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationHistory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.preferences || [];
    } catch (error: any) {
      console.error('提取用户偏好失败:', error);
      return [];
    }
  }

  async checkAIStatus(): Promise<AIStatusResponse> {
    try {
      // 检查Web端AI服务状态
      const response = await fetch(`${this.apiBaseUrl}/ai/status`);
      
      if (!response.ok) {
        return {
          isAvailable: false,
          model: 'unknown',
          error: 'AI服务不可用',
        };
      }

      const data = await response.json() as any;
      return {
        isAvailable: true,
        model: data.model || 'gpt-4',
        error: undefined,
      };
    } catch (error: any) {
      console.error('检查AI状态失败:', error);
      return {
        isAvailable: false,
        model: 'unknown',
        error: '无法连接到AI服务',
      };
    }
  }

  // 移动端特定的AI功能
  async getPersonalizedRecommendations(userId: string): Promise<AIRecommendationResponse> {
    try {
      // 获取用户历史偏好
      const { data: userPreferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const request: AIRecommendationRequest = {
        query: '个性化推荐',
        userPreferences: userPreferences?.preferences || [],
        userLocation: null,
      };

      return this.getAIRecommendations(request, null);
    } catch (error: any) {
      console.error('获取个性化推荐失败:', error);
      return this.generateFallbackRecommendations();
    }
  }

  async saveUserPreference(userId: string, preference: string[]): Promise<void> {
    try {
      // 保存用户偏好到Supabase
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: preference,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('保存用户偏好失败:', error);
    }
  }

  async getNearbyRecommendations(radiusKm: number = 5): Promise<AIRecommendationResponse> {
    try {
      // 获取用户当前位置
      const userLocation = await locationService.getCurrentLocation();
      
      const request: AIRecommendationRequest = {
        query: '附近推荐',
        userLocation: { 
          latitude: userLocation.latitude, 
          longitude: userLocation.longitude, 
          radius: radiusKm * 1000 
        },
        userPreferences: [],
      };

      const result = await this.getAIRecommendations(request, null);
      
      return result;
    } catch (error: any) {
      console.error('获取附近推荐失败:', error);
      return this.generateFallbackRecommendations();
    }
  }

  // 移动端离线AI功能
  async getOfflineRecommendations(): Promise<AIRecommendationResponse> {
    try {
      // 从本地存储获取缓存的推荐
      const cachedRecommendations = await this.getCachedRecommendations();
      
      if (cachedRecommendations) {
        return {
          recommendations: cachedRecommendations,
          explanation: '基于缓存的离线推荐',
          confidence: 0.8,
          suggestedQueries: ['刷新推荐', '查看更多'],
        };
      }

      // 如果没有缓存，返回默认推荐
      return this.generateFallbackRecommendations();
    } catch (error: any) {
      console.error('获取离线推荐失败:', error);
      return this.generateFallbackRecommendations();
    }
  }

  // 私有辅助方法
  private async getCachedRecommendations(): Promise<any[] | null> {
    try {
      // 这里可以实现本地缓存逻辑
      // 例如使用AsyncStorage存储最近的推荐结果
      return null;
    } catch {
      return null;
    }
  }

  protected generateFallbackRecommendations(): AIRecommendationResponse {
    return {
      recommendations: [
        {
          id: '1',
          title: '附近的中餐厅',
          description: '基于你的位置，推荐5家评分最高的中餐厅',
          type: 'restaurant',
          confidence: 0.95,
        },
        {
          id: '2',
          title: '今日热门活动',
          description: '发现你所在城市的精彩活动和演出',
          type: 'event',
          confidence: 0.88,
        },
        {
          id: '3',
          title: '个性化购物建议',
          description: '根据你的偏好，推荐最适合的商品和服务',
          type: 'shopping',
          confidence: 0.92,
        },
      ],
      explanation: '基于默认设置的推荐',
      confidence: 0.85,
      suggestedQueries: ['刷新推荐', '调整偏好'],
    };
  }

  protected generateFallbackConversationResponse(): AIConversationResponse {
    return {
      message: '抱歉，AI服务暂时不可用。请稍后重试或检查网络连接。',
      followUpQuestions: ['重试', '使用离线模式', '联系客服'],
    };
  }
}

// 导出单例实例
export const mobileAIService = new MobileAIService();

// 导出兼容性函数
export const getAIRecommendations = mobileAIService.getAIRecommendations.bind(mobileAIService);
export const generateConversationalResponse = mobileAIService.generateConversationalResponse.bind(mobileAIService);
export const generateBusinessReasoning = mobileAIService.generateBusinessReasoning.bind(mobileAIService);
export const extractUserPreferences = mobileAIService.extractUserPreferences.bind(mobileAIService);
export const checkAIStatus = mobileAIService.checkAIStatus.bind(mobileAIService);
export const getPersonalizedRecommendations = mobileAIService.getPersonalizedRecommendations.bind(mobileAIService);
export const saveUserPreference = mobileAIService.saveUserPreference.bind(mobileAIService);
export const getNearbyRecommendations = mobileAIService.getNearbyRecommendations.bind(mobileAIService);
export const getOfflineRecommendations = mobileAIService.getOfflineRecommendations.bind(mobileAIService);
