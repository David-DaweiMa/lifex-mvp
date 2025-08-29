// Quota configuration for the simplified subscription system
export interface QuotaConfig {
  // AI Assistant usage limits (per hour)
  coly: { hourly: number };
  max: { hourly: number };
  
  // Product publishing limits
  products: { total: number };
  
  // Trending content limits
  trending: { monthly: number };
  
  // Business features access
  business_features: boolean;
}

// Subscription level quota configuration
export const QUOTA_CONFIG: Record<string, QuotaConfig> = {
  // Free tier - basic access
  free: {
    coly: { hourly: 0 },           // No Coly access
    max: { hourly: 0 },            // No Max access
    products: { total: 100 },      // 100 products max
    trending: { monthly: 10 },     // 10 trending posts per month
    business_features: true        // Can open business features
  },
  
  // Essential tier - enhanced features
  essential: {
    coly: { hourly: 50 },          // 50 Coly calls per hour
    max: { hourly: 0 },            // No Max access
    products: { total: 100 },      // 100 products max
    trending: { monthly: 50 },     // 50 trending posts per month
    business_features: true        // Can open business features
  },
  
  // Premium tier - full access
  premium: {
    coly: { hourly: 50 },          // 50 Coly calls per hour
    max: { hourly: 50 },           // 50 Max calls per hour
    products: { total: 1000 },     // 1000 products max
    trending: { monthly: 200 },    // 200 trending posts per month
    business_features: true        // Can open business features
  }
};

// Anonymous user quota (for unregistered visitors)
export const ANONYMOUS_QUOTA: QuotaConfig = {
  coly: { hourly: 0 },
  max: { hourly: 0 },
  products: { total: 0 },
  trending: { monthly: 0 },
  business_features: false
};

// Get user quota based on subscription level
export const getUserQuota = (subscriptionLevel: string): QuotaConfig => {
  return QUOTA_CONFIG[subscriptionLevel] || QUOTA_CONFIG.free;
};

// Get specific feature quota
export const getFeatureQuota = (subscriptionLevel: string, feature: keyof QuotaConfig): any => {
  const quota = getUserQuota(subscriptionLevel);
  return quota[feature];
};

// Check if user can access Coly assistant
export const canUseColy = (subscriptionLevel: string): boolean => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.coly.hourly > 0;
};

// Check if user can access Max assistant
export const canUseMax = (subscriptionLevel: string): boolean => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.max.hourly > 0;
};

// Check if user can access business features
export const canAccessBusinessFeatures = (subscriptionLevel: string): boolean => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.business_features;
};

// Get Coly hourly limit
export const getColyHourlyLimit = (subscriptionLevel: string): number => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.coly.hourly;
};

// Get Max hourly limit
export const getMaxHourlyLimit = (subscriptionLevel: string): number => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.max.hourly;
};

// Get product limit
export const getProductLimit = (subscriptionLevel: string): number => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.products.total;
};

// Get trending limit
export const getTrendingLimit = (subscriptionLevel: string): number => {
  const quota = getUserQuota(subscriptionLevel);
  return quota.trending.monthly;
};

// Quota descriptions for UI display
export const QUOTA_DESCRIPTIONS = {
  free: {
    coly: 'No Coly access',
    max: 'No Max access',
    products: '100 products max',
    trending: '10 trending posts/month',
    business_features: 'Business features available'
  },
  essential: {
    coly: '50 Coly calls/hour',
    max: 'No Max access',
    products: '100 products max',
    trending: '50 trending posts/month',
    business_features: 'Business features available'
  },
  premium: {
    coly: '50 Coly calls/hour',
    max: '50 Max calls/hour',
    products: '1000 products max',
    trending: '200 trending posts/month',
    business_features: 'Business features available'
  }
};

// Subscription level comparison
export const SUBSCRIPTION_COMPARISON = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'month',
    features: [
      'Basic platform access',
      '100 products max',
      '10 trending posts/month',
      'Business features available'
    ],
    limitations: [
      'No AI assistant access',
      'Limited product listings'
    ]
  },
  essential: {
    name: 'Essential',
    price: '$4.99',
    period: 'month',
    features: [
      'Coly personal assistant (50 calls/hour)',
      '100 products max',
      '50 trending posts/month',
      'Business features available',
      'Priority support'
    ],
    limitations: [
      'No Max business assistant',
      'Limited product listings'
    ]
  },
  premium: {
    name: 'Premium',
    price: '$9.99',
    period: 'month',
    features: [
      'Coly personal assistant (50 calls/hour)',
      'Max business assistant (50 calls/hour)',
      '1000 products max',
      '200 trending posts/month',
      'Business features available',
      'Advanced business tools',
      'Priority support'
    ],
    limitations: [
      'Hourly limits on AI assistants'
    ]
  }
};
