import { typedSupabase } from './supabase';

export type QuotaType = 'chat' | 'trending' | 'products' | 'ads' | 'stores';
export type UserType = 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';

// 用户类型配额配置
const USER_QUOTA_CONFIG = {
  guest: {
    chat: { daily: 3 },
    trending: { monthly: 0 },
    ads: { monthly: 0 },
    products: { total: 0 },
    stores: { total: 0 }
  },
  customer: {
    chat: { daily: 10 },
    trending: { monthly: 5 },
    ads: { monthly: 1 },
    products: { total: 0 },
    stores: { total: 0 }
  },
  premium: {
    chat: { daily: 50 },
    trending: { monthly: 20 },
    ads: { monthly: 5 },
    products: { total: 0 },
    stores: { total: 0 }
  },
  free_business: {
    chat: { daily: 10 },
    trending: { monthly: 5 },
    ads: { monthly: 1 },
    products: { total: 10 },
    stores: { total: 1 }
  },
  professional_business: {
    chat: { daily: 100 },
    trending: { monthly: 50 },
    ads: { monthly: 20 },
    products: { total: 50 },
    stores: { total: 3 }
  },
  enterprise_business: {
    chat: { daily: 200 },
    trending: { monthly: 100 },
    ads: { monthly: 50 },
    products: { total: 200 },
    stores: { total: 10 }
  }
} as const;

export interface QuotaResult {
  canUse: boolean;
  remaining: number;
  current: number;
  max: number;
  resetDate: string;
  error?: string;
}

export interface QuotaConfig {
  current_usage: number;
  max_limit: number;
  reset_period: 'daily' | 'monthly' | 'yearly';
  reset_date: string;
}

/**
 * 检查用户配额
 */
export async function checkUserQuota(
  userId: string, 
  quotaType: QuotaType
): Promise<QuotaResult> {
  try {
    // 获取用户信息
    const { data: user, error: userError } = await typedSupabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        canUse: false,
        remaining: 0,
        current: 0,
        max: 0,
        resetDate: '',
        error: '用户不存在'
      };
    }

    // 获取配额配置
    const { data: quota, error: quotaError } = await typedSupabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .eq('quota_type', quotaType)
      .single();

    if (quotaError && quotaError.code !== 'PGRST116') {
      return {
        canUse: false,
        remaining: 0,
        current: 0,
        max: 0,
        resetDate: '',
        error: '配额查询失败'
      };
    }

    // 如果配额不存在，创建默认配额
    if (!quota) {
      const defaultQuota = await createDefaultQuota(userId, user.user_type, quotaType);
      if (!defaultQuota) {
        return {
          canUse: false,
          remaining: 0,
          current: 0,
          max: 0,
          resetDate: '',
          error: '配额初始化失败'
        };
      }
      return defaultQuota;
    }

    // 检查是否需要重置配额
    const resetQuota = await checkAndResetQuota(quota);
    if (resetQuota) {
      return resetQuota;
    }

    const canUse = quota.current_usage < quota.max_limit;
    const remaining = Math.max(0, quota.max_limit - quota.current_usage);

    return {
      canUse,
      remaining,
      current: quota.current_usage,
      max: quota.max_limit,
      resetDate: quota.reset_date
    };

  } catch (error) {
    console.error('检查配额失败:', error);
    return {
      canUse: false,
      remaining: 0,
      current: 0,
      max: 0,
      resetDate: '',
      error: '配额检查失败'
    };
  }
}

/**
 * 更新用户配额使用量
 */
export async function updateUserQuota(
  userId: string, 
  quotaType: QuotaType, 
  increment: number = 1
): Promise<boolean> {
  try {
    // 暂时注释掉，因为需要数据库函数支持
    // const { error } = await typedSupabase
    //   .from('user_quotas')
    //   .update({
    //     current_usage: typedSupabase.sql`current_usage + ${increment}`,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('user_id', userId)
    //   .eq('quota_type', quotaType);

    // 临时解决方案：先获取当前配额，然后更新
    const { data: currentQuota } = await typedSupabase
      .from('user_quotas')
      .select('current_usage')
      .eq('user_id', userId)
      .eq('quota_type', quotaType)
      .single();

    if (!currentQuota) {
      return false;
    }

    const { error } = await typedSupabase
      .from('user_quotas')
      .update({
        current_usage: currentQuota.current_usage + increment,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('quota_type', quotaType);

    if (error) {
      console.error('更新配额失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('更新配额异常:', error);
    return false;
  }
}

/**
 * 创建默认配额
 */
async function createDefaultQuota(
  userId: string, 
  userType: UserType, 
  quotaType: QuotaType
): Promise<QuotaResult | null> {
  try {
    const userConfig = USER_QUOTA_CONFIG[userType];
    if (!userConfig || !userConfig[quotaType]) {
      return null;
    }

    const quotaConfig = userConfig[quotaType];
    const resetDate = getNextResetDate(quotaType);

    const { data: quota, error } = await typedSupabase
      .from('user_quotas')
      .insert({
        user_id: userId,
        quota_type: quotaType,
        current_usage: 0,
        max_limit: (quotaConfig as any).total || (quotaConfig as any).daily || (quotaConfig as any).monthly || 0,
        reset_period: quotaType === 'chat' ? 'daily' : 'monthly',
        reset_date: resetDate
      })
      .select()
      .single();

    if (error || !quota) {
      console.error('创建默认配额失败:', error);
      return null;
    }

    return {
      canUse: true,
      remaining: quota.max_limit,
      current: 0,
      max: quota.max_limit,
      resetDate: quota.reset_date
    };

  } catch (error) {
    console.error('创建默认配额异常:', error);
    return null;
  }
}

/**
 * 检查并重置配额
 */
async function checkAndResetQuota(quota: any): Promise<QuotaResult | null> {
  const today = new Date();
  const resetDate = new Date(quota.reset_date);

  if (today > resetDate) {
    // 需要重置配额
    const newResetDate = getNextResetDate(quota.quota_type);

    const { data: updatedQuota, error } = await typedSupabase
      .from('user_quotas')
      .update({
        current_usage: 0,
        reset_date: newResetDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', quota.id)
      .select()
      .single();

    if (error || !updatedQuota) {
      console.error('重置配额失败:', error);
      return null;
    }

    return {
      canUse: true,
      remaining: updatedQuota.max_limit,
      current: 0,
      max: updatedQuota.max_limit,
      resetDate: updatedQuota.reset_date
    };
  }

  return null;
}

/**
 * 获取下次重置日期
 */
function getNextResetDate(quotaType: QuotaType): string {
  const today = new Date();
  
  if (quotaType === 'chat') {
    // 每日重置
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().split('T')[0];
  } else {
    // 每月重置
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.toISOString().split('T')[0];
  }
}

/**
 * 获取用户所有配额状态
 */
export async function getUserQuotas(userId: string): Promise<Record<QuotaType, QuotaResult>> {
  const quotaTypes: QuotaType[] = ['chat', 'trending', 'products', 'ads', 'stores'];
  const results: Record<QuotaType, QuotaResult> = {} as Record<QuotaType, QuotaResult>;

  for (const quotaType of quotaTypes) {
    results[quotaType] = await checkUserQuota(userId, quotaType);
  }

  return results;
}

/**
 * 检查用户是否可以执行特定操作
 */
export async function canUserPerformAction(
  userId: string, 
  action: QuotaType
): Promise<{ allowed: boolean; quota?: QuotaResult }> {
  const quota = await checkUserQuota(userId, action);
  
  return {
    allowed: quota.canUse,
    quota
  };
}

/**
 * 记录使用统计
 */
export async function recordUsage(
  userId: string, 
  featureType: 'chat' | 'trending' | 'products' | 'ads',
  count: number = 1
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 检查是否已有今日记录
    const { data: existingRecord } = await typedSupabase
      .from('usage_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_type', featureType)
      .eq('date', today)
      .single();

    if (existingRecord) {
      // 更新现有记录
      const { error } = await typedSupabase
        .from('usage_statistics')
        .update({
          usage_count: existingRecord.usage_count + count
        })
        .eq('id', existingRecord.id);

      return !error;
    } else {
      // 创建新记录
      const { error } = await typedSupabase
        .from('usage_statistics')
        .insert({
          user_id: userId,
          feature_type: featureType,
          usage_count: count,
          date: today
        });

      return !error;
    }
  } catch (error) {
    console.error('记录使用统计失败:', error);
    return false;
  }
}
