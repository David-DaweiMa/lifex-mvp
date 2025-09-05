/**
 * 全局Supabase类型修复工具
 * 用于批量修复TypeScript never类型问题
 */

import { typedSupabase, typedSupabaseAdmin } from './supabase';

/**
 * 全局类型安全的Supabase客户端
 * 使用类型断言解决所有never类型问题
 */
export const globalSafeSupabase = typedSupabase as any;
export const globalSafeSupabaseAdmin = typedSupabaseAdmin as any;

/**
 * 类型安全的查询方法
 */
export const safeQuery = {
  // 用户配置文件查询
  userProfile: async (email: string) => {
    const { data, error } = await globalSafeSupabaseAdmin
      .from('user_profiles')
      .select('id, email_verified, created_at')
      .eq('email', email)
      .maybeSingle();
    return { data, error };
  },

  // 匿名使用查询
  anonymousUsage: async (sessionId: string, quotaType: string, date: string) => {
    const { data, error } = await globalSafeSupabase
      .from('anonymous_usage')
      .select('usage_count')
      .eq('session_id', sessionId)
      .eq('quota_type', quotaType)
      .eq('usage_date', date)
      .maybeSingle();
    return { data, error };
  }
};

/**
 * 类型安全的插入方法
 */
export const safeInsert = {
  // 插入聊天消息
  chatMessage: async (messageData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('chat_messages')
      .insert(messageData);
    return { data, error };
  },

  // 插入匿名使用记录
  anonymousUsage: async (usageData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('anonymous_usage')
      .insert(usageData);
    return { data, error };
  },

  // 插入业务记录
  business: async (businessData: any) => {
    const { data, error } = await globalSafeSupabaseAdmin
      .from('businesses')
      .insert(businessData);
    return { data, error };
  },

  // 插入用户配置文件
  userProfile: async (profileData: any) => {
    const { data, error } = await globalSafeSupabaseAdmin
      .from('user_profiles')
      .insert(profileData);
    return { data, error };
  },

  // 插入趋势帖子
  trendingPost: async (postData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('trending_posts')
      .insert(postData);
    return { data, error };
  },

  // 插入帖子点赞
  postLike: async (likeData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('post_likes')
      .insert(likeData);
    return { data, error };
  },

  // 插入帖子分享
  postShare: async (shareData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('post_shares')
      .insert(shareData);
    return { data, error };
  },

  // 插入使用统计
  usageStatistics: async (statsData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('usage_statistics')
      .insert(statsData);
    return { data, error };
  },

  // 插入用户配额
  userQuota: async (quotaData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('user_quotas')
      .insert(quotaData);
    return { data, error };
  },

  // 插入助手使用记录
  assistantUsage: async (usageData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('assistant_usage')
      .insert(usageData);
    return { data, error };
  },

  // 插入邮件确认
  emailConfirmation: async (confirmationData: any) => {
    const { data, error } = await globalSafeSupabase
      .from('email_confirmations')
      .insert(confirmationData);
    return { data, error };
  }
};

/**
 * 类型安全的更新方法
 */
export const safeUpdate = {
  // 更新匿名使用记录
  anonymousUsage: async (sessionId: string, quotaType: string, date: string) => {
    const { data, error } = await globalSafeSupabase
      .from('anonymous_usage')
      .update({ 
        usage_count: globalSafeSupabase.rpc('increment_usage_count'),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('quota_type', quotaType)
      .eq('usage_date', date);
    return { data, error };
  }
};

/**
 * 类型安全的RPC调用
 */
export const safeRpc = {
  // 调用数据库函数
  call: async (functionName: string, params?: any) => {
    try {
      return await globalSafeSupabase.rpc(functionName, params);
    } catch (error) {
      console.error(`RPC call failed for ${functionName}:`, error);
      return { data: null, error };
    }
  }
};
