// 注意：这是共享包的配额服务，需要根据具体平台进行调整

export type QuotaType = 'chat' | 'trending' | 'products' | 'ads' | 'stores';
export type SubscriptionLevel = 'free' | 'essential' | 'premium';

// 订阅级别配额配置
export const SUBSCRIPTION_QUOTA_CONFIG = {
  free: {
    chat: { hourly: 0, daily: 20, monthly: 200 },
    trending: { monthly: 10 },
    ads: { monthly: 2 },
    products: { total: 100 },
    stores: { total: 2 }
  },
  essential: {
    chat: { hourly: 50, daily: 100, monthly: 1000 },
    trending: { monthly: 50 },
    ads: { monthly: 10 },
    products: { total: 100 },
    stores: { total: 3 }
  },
  premium: {
    chat: { hourly: 100, daily: 500, monthly: 5000 },
    trending: { monthly: 200 },
    ads: { monthly: 50 },
    products: { total: 1000 },
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

export interface UserQuotaConfig {
  id?: string;
  current_usage: number;
  max_limit: number;
  reset_period: 'daily' | 'monthly' | 'yearly';
  reset_date: string;
}

export interface QuotaService {
  // 检查用户配额
  checkUserQuota(userId: string, quotaType: QuotaType): Promise<QuotaResult>;

  // 更新用户配额使用量
  updateUserQuota(userId: string, quotaType: QuotaType, increment?: number): Promise<boolean>;

  // 获取用户所有配额状态
  getUserQuotas(userId: string): Promise<Record<QuotaType, QuotaResult>>;

  // 检查用户是否可以执行特定操作
  canUserPerformAction(userId: string, action: QuotaType): Promise<{ allowed: boolean; quota?: QuotaResult }>;

  // 记录使用统计
  recordUsage(userId: string, featureType: 'chat' | 'trending' | 'products' | 'ads', count?: number): Promise<boolean>;
}

// 抽象基类，提供通用的配额逻辑
export abstract class BaseQuotaService implements QuotaService {
  abstract checkUserQuota(userId: string, quotaType: QuotaType): Promise<QuotaResult>;
  abstract updateUserQuota(userId: string, quotaType: QuotaType, increment?: number): Promise<boolean>;
  abstract getUserQuotas(userId: string): Promise<Record<QuotaType, QuotaResult>>;
  abstract canUserPerformAction(userId: string, action: QuotaType): Promise<{ allowed: boolean; quota?: QuotaResult }>;
  abstract recordUsage(userId: string, featureType: 'chat' | 'trending' | 'products' | 'ads', count?: number): Promise<boolean>;

  // 通用的配额配置获取
  protected getQuotaConfig(subscriptionLevel: SubscriptionLevel, quotaType: QuotaType): any {
    const userConfig = SUBSCRIPTION_QUOTA_CONFIG[subscriptionLevel];
    if (!userConfig || !userConfig[quotaType]) {
      return null;
    }
    return userConfig[quotaType];
  }

  // 通用的配额验证
  protected validateQuota(quota: any): quota is UserQuotaConfig {
    return quota && 
           typeof quota.current_usage === 'number' && 
           typeof quota.max_limit === 'number' &&
           typeof quota.reset_date === 'string';
  }

  // 通用的配额重置检查
  protected shouldResetQuota(quota: UserQuotaConfig): boolean {
    const today = new Date().toISOString().split('T')[0];
    return today > quota.reset_date;
  }

  // 获取下次重置日期
  protected getNextResetDate(quotaType: QuotaType): string {
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

  // 通用的错误处理
  protected handleQuotaError(error: any, context: string): QuotaResult {
    console.error(`配额${context}失败:`, error);
    return {
      canUse: false,
      remaining: 0,
      current: 0,
      max: 0,
      resetDate: '',
      error: `配额${context}失败`
    };
  }

  // 通用的配额结果创建
  protected createQuotaResult(
    canUse: boolean,
    current: number,
    max: number,
    resetDate: string,
    error?: string
  ): QuotaResult {
    return {
      canUse,
      remaining: Math.max(0, max - current),
      current,
      max,
      resetDate,
      error
    };
  }

  // 通用的配额重置逻辑
  protected async resetQuota(quota: UserQuotaConfig, quotaType: QuotaType): Promise<QuotaResult> {
    const nextResetDate = this.getNextResetDate(quotaType);
    
    // 这里需要具体的数据库操作，由子类实现
    const resetSuccess = await this.performQuotaReset(quota, nextResetDate);
    
    if (resetSuccess) {
      return this.createQuotaResult(true, 0, quota.max_limit, nextResetDate);
    } else {
      return this.createQuotaResult(false, quota.current_usage, quota.max_limit, quota.reset_date, '配额重置失败');
    }
  }

  // 抽象方法：执行配额重置
  protected abstract performQuotaReset(quota: UserQuotaConfig, nextResetDate: string): Promise<boolean>;

  // 通用的配额创建逻辑
  protected async createDefaultQuota(
    userId: string, 
    subscriptionLevel: SubscriptionLevel, 
    quotaType: QuotaType
  ): Promise<QuotaResult | null> {
    try {
      const userConfig = this.getQuotaConfig(subscriptionLevel, quotaType);
      if (!userConfig) {
        return null;
      }

      const maxLimit = this.calculateMaxLimit(userConfig, quotaType);
      const resetDate = this.getNextResetDate(quotaType);

      // 这里需要具体的数据库操作，由子类实现
      const quotaCreated = await this.performCreateQuota(userId, quotaType, maxLimit, resetDate);
      
      if (quotaCreated) {
        return this.createQuotaResult(true, 0, maxLimit, resetDate);
      } else {
        return null;
      }
    } catch (error) {
      console.error('创建默认配额失败:', error);
      return null;
    }
  }

  // 抽象方法：创建配额
  protected abstract performCreateQuota(
    userId: string, 
    quotaType: QuotaType, 
    maxLimit: number, 
    resetDate: string
  ): Promise<boolean>;

  // 计算最大限制
  private calculateMaxLimit(userConfig: any, quotaType: QuotaType): number {
    if (quotaType === 'chat') {
      return userConfig.daily || 0;
    } else if (quotaType === 'trending' || quotaType === 'ads') {
      return userConfig.monthly || 0;
    } else {
      return userConfig.total || 0;
    }
  }
}
