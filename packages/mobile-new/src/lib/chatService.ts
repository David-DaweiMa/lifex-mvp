import AsyncStorage from '@react-native-async-storage/async-storage';
import { Business } from './supabase';

export interface ChatServiceResponse {
  message: string;
  recommendations?: Business[];
  followUpQuestions?: string[];
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: Business[];
  followUpQuestions?: string[];
}

class ChatService {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userPreferences: string[] = [];
  private anonymousSessionId: string | null = null;
  private baseUrl: string;

  constructor() {
    // 初始化欢迎消息
    this.conversationHistory.push({
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    });
    
    // 设置API基础URL
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // 初始化匿名用户会话ID
    this.initializeAnonymousSession();
  }

  private async initializeAnonymousSession() {
    try {
      // 1. 首先尝试从AsyncStorage获取现有会话ID
      let existingSessionId = await AsyncStorage.getItem('lifex_anonymous_session');
      
      if (existingSessionId) {
        this.anonymousSessionId = existingSessionId;
      } else {
        // 生成新的匿名会话ID，基于设备特征
        this.anonymousSessionId = this.generateDeviceBasedSessionId();
        // 存储到AsyncStorage
        await AsyncStorage.setItem('lifex_anonymous_session', this.anonymousSessionId);
      }
    } catch (error) {
      console.warn('Failed to initialize anonymous session:', error);
      this.anonymousSessionId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  private generateDeviceBasedSessionId(): string {
    // 生成基于设备特征的会话ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    return `anon_${timestamp}_${random}`;
  }

  // 发送消息
  async sendMessage(userMessage: string, userId?: string): Promise<ChatServiceResponse> {
    try {
      // 添加用户消息到历史记录
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // 生成会话ID
      const sessionId = userId ? `user-${userId}` : (this.anonymousSessionId || `anon-${Date.now()}`);
      const requestUserId = userId || 'anonymous';

      // 调用AI API
      const response = await fetch(`${this.baseUrl}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: requestUserId,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI response');
      }

      const aiResponse = result.data;

      // 添加AI响应到历史记录
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse.message
      });

      return {
        message: aiResponse.message,
        recommendations: aiResponse.recommendations,
        followUpQuestions: aiResponse.followUpQuestions
      };

    } catch (error) {
      console.error('Chat service error:', error);
      
      // 回退响应
      const fallbackMessage = "I'm here to help you discover amazing places in New Zealand! What are you looking for today?";
      
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackMessage
      });

      return {
        message: fallbackMessage,
        followUpQuestions: [
          "Best coffee shops for remote work?",
          "Family-friendly restaurants?",
          "Weekend activities in Auckland?"
        ]
      };
    }
  }

  // 获取推荐
  async getRecommendations(query: string, userId?: string): Promise<Business[]> {
    try {
      const sessionId = userId ? `user-${userId}` : (this.anonymousSessionId || `anon-${Date.now()}`);
      const requestUserId = userId || 'anonymous';

      const response = await fetch(`${this.baseUrl}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          userId: requestUserId,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get recommendations');
      }

      return result.data.recommendations || [];

    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }

  // 获取对话历史
  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  // 获取用户偏好
  getUserPreferences(): string[] {
    return [...this.userPreferences];
  }

  // 清除历史记录
  clearHistory(): void {
    this.conversationHistory = [{
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    }];
    this.userPreferences = [];
  }

  // 清除匿名会话（当用户注册时调用）
  async clearAnonymousSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('lifex_anonymous_session');
      this.anonymousSessionId = null;
    } catch (error) {
      console.warn('Failed to clear anonymous session:', error);
    }
  }

  // 获取当前匿名会话ID
  getAnonymousSessionId(): string | null {
    return this.anonymousSessionId;
  }

  // 保存对话历史到本地存储
  async saveConversationHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem('conversation_history', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Failed to save conversation history:', error);
    }
  }

  // 从本地存储加载对话历史
  async loadConversationHistory(): Promise<void> {
    try {
      const savedHistory = await AsyncStorage.getItem('conversation_history');
      if (savedHistory) {
        this.conversationHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.warn('Failed to load conversation history:', error);
    }
  }
}

// 创建单例实例
export const chatService = new ChatService();
