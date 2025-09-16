import { supabase, Business } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BusinessSearchParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'rating' | 'distance' | 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface NearbyBusinessParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
  limit?: number;
  transportMode?: 'walking' | 'driving' | 'transit';
}

class BusinessService {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // 获取商家列表
  async getBusinesses(params: BusinessSearchParams = {}): Promise<Business[]> {
    try {
      const cacheKey = `businesses_${JSON.stringify(params)}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 构建查询
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      // 应用筛选条件
      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      // 应用排序
      if (params.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('rating', { ascending: false });
      }

      // 应用分页
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get businesses error:', error);
        return [];
      }

      // 缓存结果
      this.cache.set(cacheKey, data || []);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return data || [];
    } catch (error) {
      console.error('Get businesses error:', error);
      return [];
    }
  }

  // 获取单个商家详情
  async getBusinessById(id: string): Promise<Business | null> {
    try {
      const cacheKey = `business_${id}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Get business by ID error:', error);
        return null;
      }

      // 缓存结果
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return data;
    } catch (error) {
      console.error('Get business by ID error:', error);
      return null;
    }
  }

  // 获取附近商家
  async getNearbyBusinesses(params: NearbyBusinessParams): Promise<Business[]> {
    try {
      const cacheKey = `nearby_${JSON.stringify(params)}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 调用web端API
      const response = await fetch(`${this.baseUrl}/api/location/nearby-businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Nearby businesses API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get nearby businesses');
      }

      // 缓存结果
      this.cache.set(cacheKey, result.data || []);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return result.data || [];
    } catch (error) {
      console.error('Get nearby businesses error:', error);
      return [];
    }
  }

  // 获取热门商家
  async getTrendingBusinesses(limit: number = 10): Promise<Business[]> {
    try {
      const cacheKey = `trending_${limit}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get trending businesses error:', error);
        return [];
      }

      // 缓存结果
      this.cache.set(cacheKey, data || []);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return data || [];
    } catch (error) {
      console.error('Get trending businesses error:', error);
      return [];
    }
  }

  // 搜索商家
  async searchBusinesses(query: string, limit: number = 20): Promise<Business[]> {
    try {
      const cacheKey = `search_${query}_${limit}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Search businesses error:', error);
        return [];
      }

      // 缓存结果
      this.cache.set(cacheKey, data || []);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return data || [];
    } catch (error) {
      console.error('Search businesses error:', error);
      return [];
    }
  }

  // 获取商家分类
  async getBusinessCategories(): Promise<string[]> {
    try {
      const cacheKey = 'business_categories';
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('category')
        .eq('is_active', true);

      if (error) {
        console.error('Get business categories error:', error);
        return [];
      }

      // 提取唯一分类
      const categories = [...new Set(data?.map(item => item.category) || [])];
      
      // 缓存结果
      this.cache.set(cacheKey, categories);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return categories;
    } catch (error) {
      console.error('Get business categories error:', error);
      return [];
    }
  }

  // 保存商家到收藏
  async saveBusinessToFavorites(businessId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          business_id: businessId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Save business to favorites error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Save business to favorites error:', error);
      return false;
    }
  }

  // 从收藏中移除商家
  async removeBusinessFromFavorites(businessId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('business_id', businessId);

      if (error) {
        console.error('Remove business from favorites error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Remove business from favorites error:', error);
      return false;
    }
  }

  // 获取用户收藏的商家
  async getUserFavoriteBusinesses(userId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          business_id,
          businesses (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Get user favorite businesses error:', error);
        return [];
      }

      return data?.map(item => item.businesses).filter(Boolean) || [];
    } catch (error) {
      console.error('Get user favorite businesses error:', error);
      return [];
    }
  }

  // 检查缓存是否有效
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // 清除特定缓存
  clearCacheByKey(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
}

// 创建单例实例
export const businessService = new BusinessService();
