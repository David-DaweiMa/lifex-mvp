import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
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
          user_type: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
          is_verified: boolean;
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
          is_verified?: boolean;
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
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_quotas: {
        Row: {
          id: string;
          user_id: string;
          quota_type: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage: number;
          max_limit: number;
          reset_period: 'daily' | 'monthly' | 'yearly';
          reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quota_type: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage?: number;
          max_limit: number;
          reset_period?: 'daily' | 'monthly' | 'yearly';
          reset_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quota_type?: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage?: number;
          max_limit?: number;
          reset_period?: 'daily' | 'monthly' | 'yearly';
          reset_date?: string;
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
      trending_posts: {
        Row: {
          id: string;
          author_id: string;
          business_id: string | null;
          content: string;
          images: string[] | null;
          videos: string[] | null;
          hashtags: string[] | null;
          location: any | null;
          is_sponsored: boolean;
          sponsor_info: any | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          share_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          business_id?: string | null;
          content: string;
          images?: string[] | null;
          videos?: string[] | null;
          hashtags?: string[] | null;
          location?: any | null;
          is_sponsored?: boolean;
          sponsor_info?: any | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          business_id?: string | null;
          content?: string;
          images?: string[] | null;
          videos?: string[] | null;
          hashtags?: string[] | null;
          location?: any | null;
          is_sponsored?: boolean;
          sponsor_info?: any | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
          is_active?: boolean;
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
      advertisements: {
        Row: {
          id: string;
          advertiser_id: string;
          business_id: string | null;
          title: string;
          description: string | null;
          content: string;
          ad_type: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience: any | null;
          budget: number;
          daily_budget: number | null;
          total_spent: number;
          bid_amount: number | null;
          bid_type: 'cpc' | 'cpm' | 'cpv' | null;
          start_date: string;
          end_date: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions: number;
          clicks: number;
          conversions: number;
          ctr: number;
          cpc: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advertiser_id: string;
          business_id?: string | null;
          title: string;
          description?: string | null;
          content: string;
          ad_type: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience?: any | null;
          budget: number;
          daily_budget?: number | null;
          total_spent?: number;
          bid_amount?: number | null;
          bid_type?: 'cpc' | 'cpm' | 'cpv' | null;
          start_date: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions?: number;
          clicks?: number;
          conversions?: number;
          ctr?: number;
          cpc?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advertiser_id?: string;
          business_id?: string | null;
          title?: string;
          description?: string | null;
          content?: string;
          ad_type?: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type?: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience?: any | null;
          budget?: number;
          daily_budget?: number | null;
          total_spent?: number;
          bid_amount?: number | null;
          bid_type?: 'cpc' | 'cpm' | 'cpv' | null;
          start_date?: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions?: number;
          clicks?: number;
          conversions?: number;
          ctr?: number;
          cpc?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// 类型化的 Supabase 客户端
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey);