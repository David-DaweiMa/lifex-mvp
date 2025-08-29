// src/lib/businessPermissions.ts
import { supabase } from './supabase';

export interface BusinessPermissions {
  canAccessBusinessFeatures: boolean;
  canPublishProducts: boolean;
  canUseAdvancedFeatures: boolean;
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  features: string[];
  limitations: string[];
  upgradeMessage?: string;
}

export interface BusinessSetupStatus {
  isSetup: boolean;
  missingSteps: string[];
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  nextSteps: string[];
}

/**
 * Check business permissions for a user
 */
export async function checkBusinessPermissions(
  userId: string,
  subscriptionLevel: 'free' | 'essential' | 'premium'
): Promise<BusinessPermissions> {
  try {
    // Get user profile
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return getDefaultPermissions(subscriptionLevel, false);
    }

    const hasBusinessFeatures = userProfile.has_business_features || false;
    
    // Determine verification level
    const verificationLevel = determineVerificationLevel(userProfile, subscriptionLevel);
    
    // Check if user can access business features
    const canAccessBusinessFeatures = hasBusinessFeatures || subscriptionLevel !== 'free';
    
    // Check if user can publish products (all users can, but with different limits)
    const canPublishProducts = true; // All users can publish products with limits
    
    // Check if user can use advanced features
    const canUseAdvancedFeatures = subscriptionLevel === 'premium' && verificationLevel === 'premium';

    // Get features and limitations based on subscription and verification
    const { features, limitations } = getFeaturesAndLimitations(subscriptionLevel, verificationLevel);

    // Generate upgrade message if needed
    let upgradeMessage: string | undefined;
    if (!canAccessBusinessFeatures) {
      upgradeMessage = 'Upgrade to any paid plan to access business features';
    } else if (!canUseAdvancedFeatures && subscriptionLevel !== 'premium') {
      upgradeMessage = 'Upgrade to Premium for advanced business features';
    }

    return {
      canAccessBusinessFeatures,
      canPublishProducts,
      canUseAdvancedFeatures,
      verificationLevel,
      features,
      limitations,
      upgradeMessage
    };

  } catch (error) {
    console.error('Error checking business permissions:', error);
    return getDefaultPermissions(subscriptionLevel, false);
  }
}

/**
 * Get business setup status for a user
 */
export async function getBusinessSetupStatus(userId: string): Promise<BusinessSetupStatus> {
  try {
    // Get user profile
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return {
        isSetup: false,
        missingSteps: ['Complete profile setup'],
        verificationStatus: 'none',
        nextSteps: ['Create account', 'Complete profile']
      };
    }

    const missingSteps: string[] = [];
    const nextSteps: string[] = [];

    // Check basic setup requirements
    if (!userProfile.full_name) {
      missingSteps.push('Complete profile name');
      nextSteps.push('Add your full name');
    }

    if (!userProfile.phone) {
      missingSteps.push('Add phone number');
      nextSteps.push('Add your phone number');
    }

    // Check business-specific requirements
    if (userProfile.has_business_features) {
      // Get business profile
      const { data: businessProfile } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!businessProfile) {
        missingSteps.push('Create business profile');
        nextSteps.push('Set up your business profile');
      } else {
        if (!businessProfile.business_name) {
          missingSteps.push('Add business name');
          nextSteps.push('Add your business name');
        }
        if (!businessProfile.business_type) {
          missingSteps.push('Select business type');
          nextSteps.push('Choose your business category');
        }
        if (!businessProfile.address) {
          missingSteps.push('Add business address');
          nextSteps.push('Add your business address');
        }
      }
    }

    // Determine verification status
    const verificationStatus = determineVerificationStatus(userProfile);

    const isSetup = missingSteps.length === 0;

    return {
      isSetup,
      missingSteps,
      verificationStatus,
      nextSteps: nextSteps.length > 0 ? nextSteps : ['You\'re all set!']
    };

  } catch (error) {
    console.error('Error getting business setup status:', error);
    return {
      isSetup: false,
      missingSteps: ['Unable to check setup status'],
      verificationStatus: 'none',
      nextSteps: ['Please try again later']
    };
  }
}

/**
 * Enable business features for a user
 */
export async function enableBusinessFeatures(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ has_business_features: true })
      .eq('id', userId);

    if (error) {
      console.error('Error enabling business features:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error enabling business features:', error);
    return false;
  }
}

/**
 * Submit business verification
 */
export async function submitBusinessVerification(
  userId: string,
  verificationData: {
    businessName: string;
    businessType: string;
    address: string;
    phone: string;
    documents?: string[];
  }
): Promise<boolean> {
  try {
    // Create or update business profile
    const { error: businessError } = await supabase
      .from('businesses')
      .upsert({
        user_id: userId,
        business_name: verificationData.businessName,
        business_type: verificationData.businessType,
        address: verificationData.address,
        phone: verificationData.phone,
        verification_status: 'pending',
        created_at: new Date().toISOString()
      });

    if (businessError) {
      console.error('Error creating business profile:', businessError);
      return false;
    }

    // Update user profile
    const { error: userError } = await supabase
      .from('user_profiles')
      .update({
        has_business_features: true,
        verification_status: 'pending'
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user profile:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error submitting business verification:', error);
    return false;
  }
}

/**
 * Determine verification level based on user profile and subscription
 */
function determineVerificationLevel(
  userProfile: any,
  subscriptionLevel: 'free' | 'essential' | 'premium'
): 'none' | 'basic' | 'verified' | 'premium' {
  if (subscriptionLevel === 'premium') {
    return 'premium';
  }

  if (subscriptionLevel === 'essential') {
    return 'verified';
  }

  if (userProfile.has_business_features) {
    return 'basic';
  }

  return 'none';
}

/**
 * Determine verification status from user profile
 */
function determineVerificationStatus(userProfile: any): 'none' | 'pending' | 'approved' | 'rejected' {
  if (!userProfile.has_business_features) {
    return 'none';
  }

  return userProfile.verification_status || 'pending';
}

/**
 * Get features and limitations based on subscription and verification level
 */
function getFeaturesAndLimitations(
  subscriptionLevel: 'free' | 'essential' | 'premium',
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium'
): { features: string[]; limitations: string[] } {
  const features: string[] = [];
  const limitations: string[] = [];

  // Basic features for all users
  features.push('Create business profile');
  features.push('Publish products/services');
  features.push('Basic business management');

  // Subscription-based features
  switch (subscriptionLevel) {
    case 'free':
      limitations.push('Limited to 100 total products');
      limitations.push('Basic business tools only');
      limitations.push('No advanced analytics');
      break;
    
    case 'essential':
      features.push('Enhanced business tools');
      features.push('Basic analytics');
      features.push('Priority support');
      limitations.push('Limited to 100 total products');
      limitations.push('No advanced features');
      break;
    
    case 'premium':
      features.push('Unlimited products (up to 1000)');
      features.push('Advanced analytics');
      features.push('Premium support');
      features.push('Advanced business tools');
      features.push('Custom branding');
      break;
  }

  // Verification-based features
  switch (verificationLevel) {
    case 'basic':
      features.push('Basic verification badge');
      break;
    
    case 'verified':
      features.push('Verified business badge');
      features.push('Enhanced trust indicators');
      break;
    
    case 'premium':
      features.push('Premium verification badge');
      features.push('Priority listing');
      features.push('Advanced trust features');
      break;
  }

  return { features, limitations };
}

/**
 * Get default permissions for error cases
 */
function getDefaultPermissions(
  subscriptionLevel: 'free' | 'essential' | 'premium',
  hasBusinessFeatures: boolean
): BusinessPermissions {
  return {
    canAccessBusinessFeatures: hasBusinessFeatures || subscriptionLevel !== 'free',
    canPublishProducts: true,
    canUseAdvancedFeatures: subscriptionLevel === 'premium',
    verificationLevel: 'none',
    features: ['Create business profile', 'Publish products/services'],
    limitations: ['Limited features due to account status'],
    upgradeMessage: 'Upgrade to access full business features'
  };
}

/**
 * Get business feature descriptions
 */
export function getBusinessFeatureDescriptions(): Record<string, string> {
  return {
    'Create business profile': 'Set up your business information and branding',
    'Publish products/services': 'List your products or services for customers',
    'Basic business management': 'Manage your business listings and information',
    'Enhanced business tools': 'Advanced tools for business management',
    'Basic analytics': 'View basic performance metrics',
    'Priority support': 'Get faster customer support',
    'Advanced analytics': 'Detailed business performance insights',
    'Advanced business tools': 'Professional business management features',
    'Custom branding': 'Customize your business appearance',
    'Basic verification badge': 'Show customers you\'re a verified business',
    'Verified business badge': 'Enhanced trust with verified status',
    'Premium verification badge': 'Premium trust indicators',
    'Priority listing': 'Your business appears higher in search results',
    'Advanced trust features': 'Enhanced security and trust features'
  };
}
