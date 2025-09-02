// Assistant Permissions and Access Control
import { canUseColy, canUseMax } from './quotaConfig';

export type AssistantType = 'coly' | 'max';
export type SubscriptionLevel = 'free' | 'essential' | 'premium';

export interface AssistantPermission {
  canUse: boolean;
  requiresUpgrade: boolean;
  upgradeMessage?: string;
  features: string[];
}

/**
 * Check if user can access a specific assistant
 * @param assistant - The assistant type
 * @param subscriptionLevel - User's subscription level
 * @returns Permission information
 */
export const checkAssistantPermission = (
  assistant: AssistantType,
  subscriptionLevel: SubscriptionLevel
): AssistantPermission => {
  const canUse = assistant === 'coly' 
    ? canUseColy(subscriptionLevel)
    : canUseMax(subscriptionLevel);

  const requiresUpgrade = !canUse;

  let upgradeMessage: string | undefined;
  let features: string[] = [];

  if (assistant === 'coly') {
    features = getColyFeatures(subscriptionLevel);
    if (requiresUpgrade) {
      upgradeMessage = `Coly is available for Essential and Premium users. Upgrade your subscription to access personal life assistance!`;
    }
  } else if (assistant === 'max') {
    features = getMaxFeatures(subscriptionLevel);
    if (requiresUpgrade) {
      upgradeMessage = `Max is available for Premium users only. Upgrade to Premium to access business growth expertise!`;
    }
  }

  return {
    canUse,
    requiresUpgrade,
    upgradeMessage,
    features
  };
};

/**
 * Get available features for Coly based on subscription
 * @param subscriptionLevel - User's subscription level
 * @returns Array of available features
 */
export const getColyFeatures = (subscriptionLevel: SubscriptionLevel): string[] => {
  switch (subscriptionLevel) {
    case 'free':
      return [
        'Limited access (10 chats per day)',
        'Basic life assistance',
        'General recommendations'
      ];
    
    case 'essential':
      return [
        '50 chats per hour',
        'Personal life planning',
        'Local recommendations',
        'Daily routine assistance',
        'Event suggestions',
        'Weather and travel tips'
      ];
    
    case 'premium':
      return [
        '50 chats per hour',
        'Advanced personal assistance',
        'Family management',
        'Priority support',
        'Customized recommendations',
        'Integration with calendar',
        'Smart reminders',
        'Personalized insights'
      ];
    
    default:
      return [];
  }
};

/**
 * Get available features for Max based on subscription
 * @param subscriptionLevel - User's subscription level
 * @returns Array of available features
 */
export const getMaxFeatures = (subscriptionLevel: SubscriptionLevel): string[] => {
  switch (subscriptionLevel) {
    case 'free':
      return [
        'No access to Max',
        'Upgrade to Premium required'
      ];
    
    case 'essential':
      return [
        'No access to Max',
        'Upgrade to Premium required'
      ];
    
    case 'premium':
      return [
        '50 chats per hour',
        'Business strategy consulting',
        'Market analysis',
        'Growth planning',
        'Competitive insights',
        'Financial advice',
        'Marketing strategies',
        'Operational optimization',
        'Customer acquisition tips',
        'Revenue optimization'
      ];
    
    default:
      return [];
  }
};

/**
 * Get assistant description
 * @param assistant - The assistant type
 * @returns Assistant description
 */
export const getAssistantDescription = (assistant: AssistantType): string => {
  switch (assistant) {
    case 'coly':
      return 'Your personal life assistant, helping you plan your day, find local recommendations, and manage your daily activities.';
    
    case 'max':
      return 'Your business growth expert, providing strategic advice, market insights, and optimization strategies for your business.';
    
    default:
      return '';
  }
};

/**
 * Get assistant icon or emoji
 * @param assistant - The assistant type
 * @returns Assistant icon
 */
export const getAssistantIcon = (assistant: AssistantType): string => {
  switch (assistant) {
    case 'coly':
      return '🌟';
    
    case 'max':
      return '💼';
    
    default:
      return '🤖';
  }
};

/**
 * Get assistant color theme
 * @param assistant - The assistant type
 * @returns Color theme
 */
export const getAssistantColor = (assistant: AssistantType): string => {
  switch (assistant) {
    case 'coly':
      return '#8B5CF6'; // Purple
    
    case 'max':
      return '#10B981'; // Green
    
    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Check if user can switch between assistants
 * @param currentAssistant - Current assistant
 * @param targetAssistant - Target assistant
 * @param subscriptionLevel - User's subscription level
 * @returns Whether switching is allowed
 */
export const canSwitchAssistant = (
  currentAssistant: AssistantType,
  targetAssistant: AssistantType,
  subscriptionLevel: SubscriptionLevel
): boolean => {
  if (currentAssistant === targetAssistant) {
    return true;
  }

  const targetPermission = checkAssistantPermission(targetAssistant, subscriptionLevel);
  return targetPermission.canUse;
};

/**
 * Get available assistants for user
 * @param subscriptionLevel - User's subscription level
 * @returns Array of available assistants
 */
export const getAvailableAssistants = (subscriptionLevel: SubscriptionLevel): AssistantType[] => {
  const assistants: AssistantType[] = [];
  
  if (canUseColy(subscriptionLevel)) {
    assistants.push('coly');
  }
  
  if (canUseMax(subscriptionLevel)) {
    assistants.push('max');
  }
  
  return assistants;
};

/**
 * Get assistant comparison for upgrade prompts
 * @param currentAssistant - Current assistant
 * @param subscriptionLevel - User's subscription level
 * @returns Comparison information
 */
export const getAssistantComparison = (
  currentAssistant: AssistantType,
  subscriptionLevel: SubscriptionLevel
): {
  currentFeatures: string[];
  upgradeFeatures: string[];
  upgradeRequired: boolean;
} => {
  const currentFeatures = currentAssistant === 'coly' 
    ? getColyFeatures(subscriptionLevel)
    : getMaxFeatures(subscriptionLevel);

  let upgradeFeatures: string[] = [];
  let upgradeRequired = false;

  if (subscriptionLevel === 'free') {
    upgradeFeatures = [
      'Unlimited Coly access',
      'Max business assistant',
      'Advanced features',
      'Priority support'
    ];
    upgradeRequired = true;
  } else if (subscriptionLevel === 'essential') {
    if (currentAssistant === 'coly') {
      upgradeFeatures = [
        'Max business assistant',
        'Advanced business tools',
        'Strategic consulting',
        'Market analysis'
      ];
      upgradeRequired = true;
    }
  }

  return {
    currentFeatures,
    upgradeFeatures,
    upgradeRequired
  };
};
