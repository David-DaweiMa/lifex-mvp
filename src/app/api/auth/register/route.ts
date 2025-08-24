// src/app/api/auth/register/route.ts - Improved version
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';
import { sendEmailVerification } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      username, 
      full_name, 
      phone,
      business_name,
      service_category,
      user_type = 'free' // 保持原有的默认值
    } = body;

    console.log('=== Registration Request ===', { email, user_type, business_name, service_category });

    // Input validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate user type
    const validUserTypes = ['free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business'];
    if (!validUserTypes.includes(user_type)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Service provider required field validation
    if (user_type.includes('business') && (!business_name || !service_category)) {
      return NextResponse.json(
        { error: 'Business name and service category are required for service providers' },
        { status: 400 }
      );
    }

    // Validate service category for business users
    if (user_type.includes('business') && service_category) {
      const validServiceCategories = ['restaurant', 'beauty', 'wellness', 'home_service', 'education', 'repair', 'other'];
      if (!validServiceCategories.includes(service_category)) {
        return NextResponse.json(
          { error: 'Invalid service category' },
          { status: 400 }
        );
      }
    }

    // Check email status
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('id, email_verified, created_at')
      .eq('email', email)
      .single();

    if (existingProfile?.email_verified) {
      return NextResponse.json(
        { error: 'This email is already registered and verified, please sign in directly' },
        { status: 400 }
      );
    }

    // If there's an unverified account, check if it's been more than 24 hours
    if (existingProfile) {
      const hoursSinceCreation = (Date.now() - new Date(existingProfile.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation < 24) {
        return NextResponse.json(
          { 
            error: 'This email was already registered within 24 hours, please check your email for verification link',
            canResendEmail: true,
            email: email
          },
          { status: 400 }
        );
      } else {
        // More than 24 hours, delete old record
        console.log('Over 24 hours, deleting old record and re-registering');
        await supabase.auth.admin.deleteUser(existingProfile.id);
      }
    }

    // Prepare user data
    const userData = {
      username,
      full_name,
      phone,
      user_type,
      // If service provider, add additional fields
      ...(user_type.includes('business') && {
        business_name,
        service_category
      })
    };

    console.log('=== Starting User Registration ===');
    
    // Register user (without auto email confirmation)
    const result = await registerUser(email, password, userData, false);

    if (!result.success || !result.user) {
      console.error('User registration failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'User registration failed' },
        { status: 400 }
      );
    }

    console.log('✅ User registration successful, user ID:', result.user.id);

    // Verify user creation integrity
    console.log('=== Verifying User Creation Integrity ===');
    
    // 1. Re-verify user actually exists
    const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(result.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('User verification failed:', userCheckError);
      return NextResponse.json(
        { error: 'User creation verification failed' },
        { status: 500 }
      );
    }
    
    console.log('✅ User verification successful');

    // 2. Verify user profile exists
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', result.user.id)
      .single();

    if (profileCheckError || !profileCheck) {
      console.error('User profile verification failed:', profileCheckError);
      return NextResponse.json(
        { error: 'User profile verification failed' },
        { status: 500 }
      );
    }
    
    console.log('✅ User profile verification successful');

    // If service provider, create businesses table record
    if (user_type.includes('business') && business_name) {
      console.log('=== Creating Service Provider Business Record ===');
      
      try {
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .insert({
            owner_id: result.user.id,
            name: business_name,
            category: service_category,
            contact_info: JSON.stringify({
              phone: phone || '',
              email: email
            }),
            is_verified: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (businessError) {
          console.error('Business record creation failed:', businessError);
          // Don't fail entire registration, but log warning
          console.warn('User registration successful but business record creation failed');
        } else {
          console.log('✅ Business record created successfully:', businessData.id);
        }
      } catch (businessError) {
        console.error('Business record creation exception:', businessError);
      }
    }

    // 3. Now safely send email confirmation
    console.log('=== Starting Email Confirmation ===');
    
    let emailSent = false;
    let emailError = null;
    
    try {
      // 使用增强的邮件发送方法，传入服务类别
      const emailResult = await sendEmailVerification(
        email, 
        result.user.id, 
        user_type,
        service_category // 传递服务类别参数
      );
      
      if (emailResult.success) {
        emailSent = true;
        console.log('✅ Email sent successfully');
      } else {
        emailError = emailResult.error;
        console.error('❌ Email sending failed:', emailResult.error);
        
        // If rate limited, log but don't block registration
        if (emailResult.rateLimited) {
          console.log('⚠️ Email sending rate limited, user needs to manually request resend later');
        }
      }
    } catch (emailException) {
      console.error('❌ Email sending exception:', emailException);
      emailError = 'Email sending failed';
    }

    // Registration is successful regardless of email sending status
    // Because user has been successfully created, email sending failure doesn't affect user registration
    console.log('=== Registration Process Completed ===');
    
    return NextResponse.json({
      success: true,
      user: result.user,
      message: emailSent 
        ? 'Registration successful! Please check your email and click the confirmation link to complete verification.'
        : 'Registration successful! But email sending failed, please manually request resend confirmation email later.',
      requiresEmailVerification: true,
      emailSent: emailSent,
      emailError: emailError,
      expiresInHours: 24,
      isServiceProvider: user_type.includes('business')
    });

  } catch (error) {
    console.error('Registration API exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}