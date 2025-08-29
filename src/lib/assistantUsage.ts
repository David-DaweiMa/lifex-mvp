// AI Assistant Usage Tracking and Limits
import { typedSupabase } from './supabase';
import { detectLanguage } from './languageDetection';
import { getPersonalityResponse } from './assistantPersonality';
import { canUseColy, canUseMax, getColyHourlyLimit, getMaxHourlyLimit } from './quotaConfig';

export type AssistantType = 'coly' | 'max';

export interface UsageCheckResult {
  canUse: boolean;
  message?: string;
  resetTime?: string;
  currentUsage: number;
  limit: number;
  remaining: number;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  assistant_type: AssistantType;
  created_at: string;
}

/**
 * Check if user can use the specified assistant
 * @param userId - User ID
 * @param assistantType - Type of assistant (coly or max)
 * @param subscriptionLevel - User's subscription level
 * @param userMessage - User's message for language detection
 * @returns Usage check result
 */
export const checkAssistantLimit = async (
  userId: string,
  assistantType: AssistantType,
  subscriptionLevel: string,
  userMessage: string
): Promise<UsageCheckResult> => {
  try {
    // Check if user has permission to use this assistant
    if (assistantType === 'coly' && !canUseColy(subscriptionLevel)) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse('coly', 'tired', language);
      return {
        canUse: false,
        message,
        currentUsage: 0,
        limit: 0,
        remaining: 0
      };
    }

    if (assistantType === 'max' && !canUseMax(subscriptionLevel)) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse('max', 'tired', language);
      return {
        canUse: false,
        message,
        currentUsage: 0,
        limit: 0,
        remaining: 0
      };
    }

    // Get the hourly limit for this assistant and subscription
    const limit = assistantType === 'coly' 
      ? getColyHourlyLimit(subscriptionLevel)
      : getMaxHourlyLimit(subscriptionLevel);

    if (limit === 0) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse(assistantType, 'tired', language);
      return {
        canUse: false,
        message,
        currentUsage: 0,
        limit: 0,
        remaining: 0
      };
    }

    // Calculate the start of the current hour
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const nextHour = new Date(hourStart.getTime() + 60 * 60 * 1000);

    // Count current usage for this hour
    const { data: usageData, error: usageError } = await typedSupabase
      .from('assistant_usage')
      .select('id')
      .eq('user_id', userId)
      .eq('assistant_type', assistantType)
      .gte('created_at', hourStart.toISOString())
      .lt('created_at', nextHour.toISOString());

    if (usageError) {
      console.error('Error checking assistant usage:', usageError);
      // Allow usage if we can't check (fail open)
      return {
        canUse: true,
        currentUsage: 0,
        limit,
        remaining: limit
      };
    }

    const currentUsage = usageData?.length || 0;
    const remaining = Math.max(0, limit - currentUsage);
    const canUse = currentUsage < limit;

    if (!canUse) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse(assistantType, 'tired', language);
      return {
        canUse: false,
        message,
        resetTime: nextHour.toISOString(),
        currentUsage,
        limit,
        remaining
      };
    }

    // Check if approaching limit (80% of limit)
    const warningThreshold = Math.floor(limit * 0.8);
    if (currentUsage >= warningThreshold) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse(assistantType, 'limit_warning', language);
      return {
        canUse: true,
        message,
        resetTime: nextHour.toISOString(),
        currentUsage,
        limit,
        remaining
      };
    }

    return {
      canUse: true,
      currentUsage,
      limit,
      remaining
    };

  } catch (error) {
    console.error('Error in checkAssistantLimit:', error);
    // Allow usage if there's an error (fail open)
    return {
      canUse: true,
      currentUsage: 0,
      limit: 50,
      remaining: 50
    };
  }
};

/**
 * Record assistant usage
 * @param userId - User ID
 * @param assistantType - Type of assistant
 * @returns Success status
 */
export const recordAssistantUsage = async (
  userId: string,
  assistantType: AssistantType
): Promise<boolean> => {
  try {
    const { error } = await typedSupabase
      .from('assistant_usage')
      .insert({
        user_id: userId,
        assistant_type: assistantType,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording assistant usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordAssistantUsage:', error);
    return false;
  }
};

/**
 * Get user's current usage statistics
 * @param userId - User ID
 * @param assistantType - Type of assistant
 * @returns Usage statistics
 */
export const getUserUsageStats = async (
  userId: string,
  assistantType: AssistantType
): Promise<{
  today: number;
  thisHour: number;
  thisWeek: number;
  thisMonth: number;
}> => {
  try {
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Get usage for different time periods
    const [hourlyUsage, dailyUsage, weeklyUsage, monthlyUsage] = await Promise.all([
      typedSupabase
        .from('assistant_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('assistant_type', assistantType)
        .gte('created_at', hourStart.toISOString())
        .lt('created_at', now.toISOString()),
      
      typedSupabase
        .from('assistant_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('assistant_type', assistantType)
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', now.toISOString()),
      
      typedSupabase
        .from('assistant_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('assistant_type', assistantType)
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', now.toISOString()),
      
      typedSupabase
        .from('assistant_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('assistant_type', assistantType)
        .gte('created_at', monthStart.toISOString())
        .lt('created_at', now.toISOString())
    ]);

    return {
      today: dailyUsage.data?.length || 0,
      thisHour: hourlyUsage.data?.length || 0,
      thisWeek: weeklyUsage.data?.length || 0,
      thisMonth: monthlyUsage.data?.length || 0
    };

  } catch (error) {
    console.error('Error getting user usage stats:', error);
    return {
      today: 0,
      thisHour: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
};

/**
 * Get next reset time for the current hour
 * @returns ISO string of next hour start
 */
export const getNextResetTime = (): string => {
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
  return nextHour.toISOString();
};

/**
 * Check if it's time to reset limits (new hour)
 * @param lastResetTime - Last reset time
 * @returns Whether limits should be reset
 */
export const shouldResetLimits = (lastResetTime: string): boolean => {
  const lastReset = new Date(lastResetTime);
  const now = new Date();
  const hourDiff = Math.floor((now.getTime() - lastReset.getTime()) / (60 * 60 * 1000));
  return hourDiff >= 1;
};

/**
 * Get usage summary for display
 * @param currentUsage - Current usage count
 * @param limit - Hourly limit
 * @param language - User's language
 * @returns Formatted usage summary
 */
export const getUsageSummary = (
  currentUsage: number,
  limit: number,
  language: string
): string => {
  const percentage = Math.round((currentUsage / limit) * 100);
  
  if (language === 'zh') {
    return `已使用 ${currentUsage}/${limit} (${percentage}%)`;
  } else if (language === 'ja') {
    return `${currentUsage}/${limit} 使用済み (${percentage}%)`;
  } else if (language === 'ko') {
    return `${currentUsage}/${limit} 사용됨 (${percentage}%)`;
  } else if (language === 'es') {
    return `${currentUsage}/${limit} usado (${percentage}%)`;
  } else if (language === 'fr') {
    return `${currentUsage}/${limit} utilisé (${percentage}%)`;
  } else if (language === 'de') {
    return `${currentUsage}/${limit} verwendet (${percentage}%)`;
  } else {
    return `${currentUsage}/${limit} used (${percentage}%)`;
  }
};
