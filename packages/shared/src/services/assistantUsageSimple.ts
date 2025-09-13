// Simplified AI Assistant Usage Tracking and Limits (without direct Supabase dependency)
import { detectLanguage } from './languageDetection';
import { getPersonalityResponse } from './assistantPersonality';
import { canUseColy, canUseMax, getColyHourlyLimit, getMaxHourlyLimit } from './quotaConfig';

export type AssistantUsageType = 'coly' | 'max';

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
  assistant_type: AssistantUsageType;
  created_at: string;
}

/**
 * Check if user can use the specified assistant (simplified version)
 * @param userId - User ID
 * @param assistantType - Type of assistant (coly or max)
 * @param subscriptionLevel - User's subscription level
 * @param userMessage - User's message for language detection
 * @param currentUsage - Current usage count (to be provided by calling code)
 * @returns Usage check result
 */
export const checkAssistantLimit = async (
  userId: string,
  assistantType: AssistantUsageType,
  subscriptionLevel: string,
  userMessage: string,
  currentUsage: number = 0
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

    // Get hourly limit
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

    const remaining = Math.max(0, limit - currentUsage);
    const canUse = currentUsage < limit;

    if (!canUse) {
      const language = detectLanguage(userMessage);
      const message = getPersonalityResponse(assistantType, 'tired', language);
      return {
        canUse: false,
        message,
        resetTime: getNextResetTime(),
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
        resetTime: getNextResetTime(),
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
