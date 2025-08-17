// 用户配额配置
export interface QuotaConfig {
  chat: { daily: number };
  trending: { monthly: number };
  ads: { monthly: number };
  products: { total: number };
  stores: { total: number };
}

// 用户配额配置
export const QUOTA_CONFIG: Record<string, QuotaConfig> = {
  // 匿名用户 - 未注册访客
  anonymous: { 
    chat: { daily: 5 }, 
    trending: { monthly: 0 }, 
    ads: { monthly: 0 }, 
    products: { total: 0 }, 
    stores: { total: 0 } 
  },
  
  // 免费用户 - 注册但未订阅
  free: { 
    chat: { daily: 20 }, 
    trending: { monthly: 10 }, 
    ads: { monthly: 2 }, 
    products: { total: 0 }, 
    stores: { total: 0 } 
  },
  
  // 普通付费用户 - 基础订阅
  customer: { 
    chat: { daily: 100 }, 
    trending: { monthly: 50 }, 
    ads: { monthly: 10 }, 
    products: { total: 0 }, 
    stores: { total: 0 } 
  },
  
  // 高级用户 - 高级订阅
  premium: { 
    chat: { daily: 500 }, 
    trending: { monthly: 200 }, 
    ads: { monthly: 50 }, 
    products: { total: 0 }, 
    stores: { total: 0 } 
  },

  // 免费商家 - 小规模商家
  free_business: { 
    chat: { daily: 20 }, 
    trending: { monthly: 10 }, 
    ads: { monthly: 2 }, 
    products: { total: 20 }, 
    stores: { total: 2 } 
  },
  
  // 专业商家 - 中等规模商家
  professional_business: { 
    chat: { daily: 100 }, 
    trending: { monthly: 50 }, 
    ads: { monthly: 10 }, 
    products: { total: 50 }, 
    stores: { total: 3 } 
  },
  
  // 企业商家 - 大规模企业
  enterprise_business: { 
    chat: { daily: 500 }, 
    trending: { monthly: 200 }, 
    ads: { monthly: 50 }, 
    products: { total: 200 }, 
    stores: { total: 10 } 
  }
};

// 匿名用户配额
export const ANONYMOUS_QUOTA = { chat: { daily: 5 } };

// 获取用户配额
export const getUserQuota = (userType: string): QuotaConfig => {
  return QUOTA_CONFIG[userType] || QUOTA_CONFIG.anonymous;
};

// 获取特定功能的配额
export const getFeatureQuota = (userType: string, feature: keyof QuotaConfig): number => {
  const quota = getUserQuota(userType);
  const featureQuota = quota[feature];
  
  if (feature === 'chat') {
    return (featureQuota as { daily: number }).daily;
  } else if (feature === 'trending' || feature === 'ads') {
    return (featureQuota as { monthly: number }).monthly;
  } else {
    return (featureQuota as { total: number }).total;
  }
};

// 判断是否为无限制用户
export const isUnlimitedUser = (userId: string): boolean => {
  return userId === 'demo-user' || userId === 'admin';
};

// 配额比例关系
export const QUOTA_RATIOS = {
  anonymous_to_free: 5 / 20,        // 匿名:免费 = 1:4
  free_to_customer: 20 / 100,       // 免费:普通 = 1:5
  customer_to_premium: 100 / 500,   // 普通:高级 = 1:5
  free_business_to_professional: 20 / 100,  // 免费商家:专业商家 = 1:5
  professional_to_enterprise: 100 / 500     // 专业商家:企业商家 = 1:5
};

// 配额描述
export const QUOTA_DESCRIPTIONS = {
  anonymous: '匿名用户每日5次AI对话',
  free: '免费用户每日20次AI对话',
  customer: '普通用户每日100次AI对话',
  premium: '高级用户每日500次AI对话',
  free_business: '免费商家每日20次AI对话',
  professional_business: '专业商家每日100次AI对话',
  enterprise_business: '企业商家每日500次AI对话'
};
