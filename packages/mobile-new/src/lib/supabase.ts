import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 环境变量配置
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 检查环境变量是否存在
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Some features may not work properly.');
}

// 创建Supabase客户端，使用AsyncStorage作为持久化存储
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 数据库类型定义（从web端复制）
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location: any | null;
          bio: string | null;
          website: string | null;
          social_links: any | null;
          subscription_level: 'free' | 'essential' | 'premium';
          email_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: any | null;
          bio?: string | null;
          website?: string | null;
          social_links?: any | null;
          user_type?: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
          email_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: any | null;
          bio?: string | null;
          website?: string | null;
          social_links?: any | null;
          user_type?: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
          email_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          category: string;
          subcategories: string[] | null;
          contact_info: any | null;
          address: any | null;
          business_hours: any | null;
          is_verified: boolean;
          is_active: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          category: string;
          subcategories?: string[] | null;
          contact_info?: any | null;
          address?: any | null;
          business_hours?: any | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          category?: string;
          subcategories?: string[] | null;
          contact_info?: any | null;
          address?: any | null;
          business_hours?: any | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          metadata: any | null;
          is_ad_integrated: boolean;
          ad_info: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          metadata?: any | null;
          is_ad_integrated?: boolean;
          ad_info?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          message_type?: 'user' | 'ai' | 'system';
          content?: string;
          metadata?: any | null;
          is_ad_integrated?: boolean;
          ad_info?: any | null;
          created_at?: string;
        };
      };
    };
  };
}

// 类型化的客户端
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 导出类型
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Business = Database['public']['Tables']['businesses']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
