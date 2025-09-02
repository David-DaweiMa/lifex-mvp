// src/lib/productQuota.ts
import { supabase } from './supabase';
import { detectLanguage } from './languageDetection';
import { getAssistantPersonality } from './assistantPersonality';

export interface ProductQuota {
  current: number;
  limit: number;
  remaining: number;
  resetTime?: string;
  period: 'daily' | 'monthly' | 'total';
}

export interface ProductQuotaCheck {
  canPublish: boolean;
  quota: ProductQuota;
  message?: string;
  warning?: string;
}

/**
 * Check if user can publish a product based on their subscription level
 */
export async function checkProductQuota(
  userId: string,
  subscriptionLevel: 'free' | 'essential' | 'premium'
): Promise<ProductQuotaCheck> {
  try {
    // Get current date for daily/monthly calculations
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get limits based on subscription level
    const limits = getProductLimits(subscriptionLevel);
    
    // Count products published today
    const { count: dailyCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    // Count products published this month
    const { count: monthlyCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Count total products
    const { count: totalCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Handle null counts
    const dailyCountSafe = dailyCount || 0;
    const monthlyCountSafe = monthlyCount || 0;
    const totalCountSafe = totalCount || 0;

    // Determine which limit applies and current usage
    let current: number;
    let limit: number;
    let period: 'daily' | 'monthly' | 'total';

    if (limits.daily && dailyCountSafe >= limits.daily) {
      current = dailyCountSafe;
      limit = limits.daily;
      period = 'daily';
    } else if (limits.monthly && monthlyCountSafe >= limits.monthly) {
      current = monthlyCountSafe;
      limit = limits.monthly;
      period = 'monthly';
    } else if (limits.total && totalCountSafe >= limits.total) {
      current = totalCountSafe;
      limit = limits.total;
      period = 'total';
    } else {
      // Use the most restrictive limit that hasn't been reached
      if (limits.daily && dailyCountSafe >= limits.daily * 0.8) {
        current = dailyCountSafe;
        limit = limits.daily;
        period = 'daily';
      } else if (limits.monthly && monthlyCountSafe >= limits.monthly * 0.8) {
        current = monthlyCountSafe;
        limit = limits.monthly;
        period = 'monthly';
      } else if (limits.total && totalCountSafe >= limits.total * 0.8) {
        current = totalCountSafe;
        limit = limits.total;
        period = 'total';
      } else {
        current = Math.max(dailyCountSafe, monthlyCountSafe, totalCountSafe);
        limit = limits.total || limits.monthly || limits.daily || 100;
        period = 'total';
      }
    }

    const remaining = Math.max(0, limit - current);
    const canPublish = remaining > 0;

    // Calculate reset time
    let resetTime: string | undefined;
    if (period === 'daily') {
      const tomorrow = new Date(startOfDay);
      tomorrow.setDate(tomorrow.getDate() + 1);
      resetTime = tomorrow.toISOString();
    } else if (period === 'monthly') {
      const nextMonth = new Date(startOfMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      resetTime = nextMonth.toISOString();
    }

    const quota: ProductQuota = {
      current,
      limit,
      remaining,
      resetTime,
      period
    };

    // Generate appropriate messages
    let message: string | undefined;
    let warning: string | undefined;

    if (!canPublish) {
      const language = 'en'; // Default to English for now
      const personality = getAssistantPersonality('coly', language as any);
      
      if (period === 'daily') {
        message = personality.limit_warning.replace('{feature}', 'product publishing').replace('{period}', 'today');
      } else if (period === 'monthly') {
        message = personality.limit_warning.replace('{feature}', 'product publishing').replace('{period}', 'this month');
      } else {
        message = personality.limit_warning.replace('{feature}', 'product publishing').replace('{period}', 'total');
      }
    } else if (remaining <= limit * 0.2) {
      // Warning when approaching limit
      warning = `You're approaching your ${period} product limit. Only ${remaining} products remaining.`;
    }

    return {
      canPublish,
      quota,
      message,
      warning
    };

  } catch (error) {
    console.error('Error checking product quota:', error);
    
    // Fallback to basic check
    return {
      canPublish: false,
      quota: {
        current: 0,
        limit: 100,
        remaining: 0,
        period: 'total'
      },
      message: 'Unable to check product limits. Please try again later.'
    };
  }
}

/**
 * Record a product publication
 */
export async function recordProductPublication(userId: string): Promise<boolean> {
  try {
    // This would typically be called after successfully creating a product
    // For now, we just return true as the actual recording happens in the business creation
    return true;
  } catch (error) {
    console.error('Error recording product publication:', error);
    return false;
  }
}

/**
 * Get product limits for different subscription levels
 */
function getProductLimits(subscriptionLevel: 'free' | 'essential' | 'premium') {
  switch (subscriptionLevel) {
    case 'free':
      return {
        daily: 5,
        monthly: 50,
        total: 100
      };
    case 'essential':
      return {
        daily: 10,
        monthly: 100,
        total: 100
      };
    case 'premium':
      return {
        daily: 50,
        monthly: 500,
        total: 1000
      };
    default:
      return {
        daily: 5,
        monthly: 50,
        total: 100
      };
  }
}

/**
 * Get product quota display information
 */
export function getProductQuotaDisplay(quota: ProductQuota): {
  text: string;
  percentage: number;
  color: string;
} {
  const percentage = (quota.current / quota.limit) * 100;
  
  let color = '#10b981'; // Green
  if (percentage >= 80) {
    color = '#f59e0b'; // Yellow
  }
  if (percentage >= 95) {
    color = '#ef4444'; // Red
  }

  const periodText = quota.period === 'daily' ? 'today' : 
                    quota.period === 'monthly' ? 'this month' : 'total';

  const text = `${quota.current}/${quota.limit} products ${periodText}`;

  return {
    text,
    percentage,
    color
  };
}

/**
 * Get upgrade message for product limits
 */
export function getProductUpgradeMessage(
  currentLevel: 'free' | 'essential' | 'premium',
  language: string = 'en'
): string {
  const messages = {
    en: {
      free: 'Upgrade to Essential or Premium to publish more products',
      essential: 'Upgrade to Premium for unlimited product publishing',
      premium: 'You have maximum product publishing limits'
    },
    zh: {
      free: '升级到Essential或Premium以发布更多产品',
      essential: '升级到Premium获得无限产品发布',
      premium: '您拥有最大产品发布限制'
    },
    ja: {
      free: 'EssentialまたはPremiumにアップグレードしてより多くの商品を公開',
      essential: 'Premiumにアップグレードして無制限の商品公開',
      premium: '最大の商品公開制限があります'
    }
  };

  return messages[language as keyof typeof messages]?.[currentLevel] || messages.en[currentLevel];
}
