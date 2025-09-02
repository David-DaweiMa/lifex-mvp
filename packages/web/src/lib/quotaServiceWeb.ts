import { typedSupabase } from './supabase';
import { BaseQuotaService, QuotaType, QuotaResult, UserQuotaConfig, SubscriptionLevel } from '@lifex/shared';

/**
 * Web端的配额服务实现
 * 继承自共享包的BaseQuotaService，提供具体的web实现
 */
export class WebQuotaService extends BaseQuotaService {
  
  /**
   * 检查用户配额
   */
  async checkUserQuota(userId: string, quotaType: QuotaType): Promise<QuotaResult> {
    try {
      // 获取用户信息
      const { data: user, error: userError } = await typedSupabase
        .from('user_profiles')
        .select('subscription_level')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return this.handleQuotaError(userError, '用户查询');
      }

      // 获取配额配置
      const { data: quota, error: quotaError } = await typedSupabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', userId)
        .eq('quota_type', quotaType)
        .single();

      if (quotaError && quotaError.code !== 'PGRST116') {
        return this.handleQuotaError(quotaError, '配额查询');
      }

      // 如果配额不存在，创建默认配额
      if (!quota) {
        const defaultQuota = await this.createDefaultQuota(userId, user.subscription_level, quotaType);
        if (!defaultQuota) {
          return this.handleQuotaError(null, '配额初始化');
        }
        return defaultQuota;
      }

      // 检查是否需要重置配额
      if (this.shouldResetQuota(quota)) {
        return await this.resetQuota(quota, quotaType);
      }

      const canUse = quota.current_usage < quota.max_limit;
      return this.createQuotaResult(
        canUse,
        quota.current_usage,
        quota.max_limit,
        quota.reset_date
      );

    } catch (error) {
      return this.handleQuotaError(error, '配额检查');
    }
  }

  /**
   * 更新用户配额使用量
   */
  async updateUserQuota(userId: string, quotaType: QuotaType, increment: number = 1): Promise<boolean> {
    try {
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
   * 获取用户所有配额状态
   */
  async getUserQuotas(userId: string): Promise<Record<QuotaType, QuotaResult>> {
    const quotaTypes: QuotaType[] = ['chat', 'trending', 'products', 'ads', 'stores'];
    const results: Record<QuotaType, QuotaResult> = {} as Record<QuotaType, QuotaResult>;

    for (const quotaType of quotaTypes) {
      results[quotaType] = await this.checkUserQuota(userId, quotaType);
    }

    return results;
  }

  /**
   * 检查用户是否可以执行特定操作
   */
  async canUserPerformAction(userId: string, action: QuotaType): Promise<{ allowed: boolean; quota?: QuotaResult }> {
    const quota = await this.checkUserQuota(userId, action);
    
    return {
      allowed: quota.canUse,
      quota
    };
  }

  /**
   * 记录使用统计
   */
  async recordUsage(userId: string, featureType: 'chat' | 'trending' | 'products' | 'ads', count: number = 1): Promise<boolean> {
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

  // 实现抽象方法：执行配额重置
  protected async performQuotaReset(quota: UserQuotaConfig, nextResetDate: string): Promise<boolean> {
    try {
      const { error } = await typedSupabase
        .from('user_quotas')
        .update({
          current_usage: 0,
          reset_date: nextResetDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', quota.id || 'unknown');

      return !error;
    } catch (error) {
      console.error('执行配额重置失败:', error);
      return false;
    }
  }

  // 实现抽象方法：创建配额
  protected async performCreateQuota(
    userId: string, 
    quotaType: QuotaType, 
    maxLimit: number, 
    resetDate: string
  ): Promise<boolean> {
    try {
      const { error } = await typedSupabase
        .from('user_quotas')
        .insert({
          user_id: userId,
          quota_type: quotaType,
          current_usage: 0,
          max_limit: maxLimit,
          reset_date: resetDate,
          reset_period: quotaType === 'chat' ? 'daily' : 'monthly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('创建配额失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const webQuotaService = new WebQuotaService();

// 为了向后兼容，也导出原来的函数
export const {
  checkUserQuota,
  updateUserQuota,
  getUserQuotas,
  canUserPerformAction,
  recordUsage
} = webQuotaService;
