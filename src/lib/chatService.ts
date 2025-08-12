import { Message, Business } from './types';
import { extractUserPreferences } from './ai';

export interface ChatServiceResponse {
  message: string;
  recommendations?: Business[];
  followUpQuestions?: string[];
}

export class ChatService {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userPreferences: string[] = [];

  constructor() {
    // Initialize with welcome message
    this.conversationHistory.push({
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    });
  }

  async sendMessage(userMessage: string): Promise<ChatServiceResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Extract user preferences from conversation
      this.userPreferences = extractUserPreferences(this.conversationHistory);

      // Call AI API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'conversation',
          data: {
            message: userMessage,
            conversationHistory: this.conversationHistory,
            context: {
              userPreferences: this.userPreferences
            }
          }
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

  async getRecommendations(query: string): Promise<Business[]> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'recommendations',
          data: {
            query,
            userPreferences: this.userPreferences
          }
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
}

// Create a singleton instance
export const chatService = new ChatService();
