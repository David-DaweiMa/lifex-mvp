// src/app/api/business/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkBusinessPermissions, enableBusinessFeatures, submitBusinessVerification } from '@/lib/businessPermissions';
import { checkProductQuota } from '@/lib/productQuota';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, verificationData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile to check current status
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const subscriptionLevel = userProfile.subscription_level || 'free';

    switch (action) {
      case 'enable_business_features':
        // Enable business features for the user
        const enabled = await enableBusinessFeatures(userId);
        
        if (!enabled) {
          return NextResponse.json(
            { success: false, error: 'Failed to enable business features' },
            { status: 500 }
          );
        }

        // Get updated permissions
        const permissions = await checkBusinessPermissions(userId, subscriptionLevel);
        
        return NextResponse.json({
          success: true,
          data: {
            message: 'Business features enabled successfully',
            permissions,
            nextSteps: [
              'Complete your business profile',
              'Add your business information',
              'Start publishing products'
            ]
          }
        });

      case 'submit_verification':
        // Submit business verification
        if (!verificationData) {
          return NextResponse.json(
            { success: false, error: 'Verification data is required' },
            { status: 400 }
          );
        }

        const submitted = await submitBusinessVerification(userId, verificationData);
        
        if (!submitted) {
          return NextResponse.json(
            { success: false, error: 'Failed to submit verification' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            message: 'Business verification submitted successfully',
            status: 'pending',
            estimatedReviewTime: '2-3 business days'
          }
        });

      case 'check_permissions':
        // Check current business permissions
        const currentPermissions = await checkBusinessPermissions(userId, subscriptionLevel);
        
        return NextResponse.json({
          success: true,
          data: {
            permissions: currentPermissions
          }
        });

      case 'check_quota':
        // Check product publishing quota
        const quotaCheck = await checkProductQuota(userId, subscriptionLevel);
        
        return NextResponse.json({
          success: true,
          data: {
            quota: quotaCheck
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Business setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const subscriptionLevel = userProfile.subscription_level || 'free';

    // Get business permissions
    const permissions = await checkBusinessPermissions(userId, subscriptionLevel);

    // Get product quota
    const quotaCheck = await checkProductQuota(userId, subscriptionLevel);

    // Get business profile if exists
    const { data: businessProfile } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        userProfile: {
          id: userProfile.id,
          subscription_level: userProfile.subscription_level,
          has_business_features: userProfile.has_business_features,
          verification_status: userProfile.verification_status
        },
        businessProfile,
        permissions,
        quota: quotaCheck,
        setupComplete: !!businessProfile && businessProfile.business_name && businessProfile.address
      }
    });

  } catch (error) {
    console.error('Business setup status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
