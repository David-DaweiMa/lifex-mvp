import { Message, BusinessExtended as Business } from '@lifex/shared';
import { extractUserPreferences } from './ai';

export interface ChatServiceResponse {
  message: string;
  recommendations?: Business[];
  followUpQuestions?: string[];
}

export class ChatService {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userPreferences: string[] = [];
  private anonymousSessionId: string | null = null;

  constructor() {
    // Initialize with welcome message
    this.conversationHistory.push({
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    });
    
    // 初始化匿名用户会话ID
    this.initializeAnonymousSession();
  }

  private initializeAnonymousSession() {
    if (typeof window !== 'undefined') {
      // 1. 首先尝试从localStorage获取现有会话ID
      let existingSessionId = localStorage.getItem('lifex_anonymous_session');
      
      // 2. 如果没有localStorage会话，尝试从sessionStorage获取
      if (!existingSessionId) {
        existingSessionId = sessionStorage.getItem('lifex_anonymous_session');
      }
      
      // 3. 如果还是没有，尝试从cookie获取
      if (!existingSessionId) {
        existingSessionId = this.getCookie('lifex_anonymous_session');
      }
      
      if (existingSessionId) {
        this.anonymousSessionId = existingSessionId;
        // 同步到所有存储方式
        this.syncSessionToAllStorages(existingSessionId);
      } else {
        // 生成新的匿名会话ID，基于设备指纹
        this.anonymousSessionId = this.generateDeviceBasedSessionId();
        // 存储到所有位置
        this.syncSessionToAllStorages(this.anonymousSessionId);
      }
    }
  }

  private generateDeviceBasedSessionId(): string {
    // 生成基于设备特征的会话ID
    const deviceFingerprint = this.generateDeviceFingerprint();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    return `anon_${timestamp}_${deviceFingerprint}_${random}`;
  }

  private generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        const canvasFingerprint = canvas.toDataURL();
        
        // 组合多个设备特征
        const features = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          canvasFingerprint.substring(0, 20), // 只取前20个字符
          window.devicePixelRatio || 1
        ];
        
        // 生成简单的哈希
        const combined = features.join('|');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 转换为32位整数
        }
        
        return Math.abs(hash).toString(36);
      }
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
    }
    
    return 'fallback_' + Math.random().toString(36).substr(2, 6);
  }

  private syncSessionToAllStorages(sessionId: string): void {
    try {
      // 存储到localStorage
      localStorage.setItem('lifex_anonymous_session', sessionId);
      
      // 存储到sessionStorage
      sessionStorage.setItem('lifex_anonymous_session', sessionId);
      
      // 存储到cookie（30天过期）
      this.setCookie('lifex_anonymous_session', sessionId, 30);
    } catch (error) {
      console.warn('Failed to sync session to all storages:', error);
    }
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  async sendMessage(userMessage: string, userId?: string): Promise<ChatServiceResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Extract user preferences from conversation
      this.userPreferences = await extractUserPreferences(this.conversationHistory);

      // Generate session ID for anonymous users
      const sessionId = userId ? `user-${userId}` : (this.anonymousSessionId || `anon-${Date.now()}`);
      const requestUserId = userId || 'anonymous';

      // Call AI API
      const response = await fetch('/api/ai', {
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

      // Add AI response to history
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
      
      // Fallback response
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

  async getRecommendations(query: string, userId?: string): Promise<Business[]> {
    try {
      const sessionId = userId ? `user-${userId}` : (this.anonymousSessionId || `anon-${Date.now()}`);
      const requestUserId = userId || 'anonymous';

      const response = await fetch('/api/ai', {
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

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  getUserPreferences(): string[] {
    return [...this.userPreferences];
  }

  clearHistory(): void {
    this.conversationHistory = [{
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    }];
    this.userPreferences = [];
  }

  // 清除匿名会话（当用户注册时调用）
  clearAnonymousSession(): void {
    if (typeof window !== 'undefined') {
      // 清除所有存储方式
      localStorage.removeItem('lifex_anonymous_session');
      sessionStorage.removeItem('lifex_anonymous_session');
      this.deleteCookie('lifex_anonymous_session');
      this.anonymousSessionId = null;
    }
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // 获取当前匿名会话ID
  getAnonymousSessionId(): string | null {
    return this.anonymousSessionId;
  }
}

// Create a singleton instance
export const chatService = new ChatService();
