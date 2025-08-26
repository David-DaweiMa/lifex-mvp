// src/app/api/auth/register/route.ts - 修正导入路径
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';
import { sendEmailVerification } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 类别映射 - 从前端service_category到数据库category_id
const SERVICE_CATEGORY_MAPPING: Record<string, string> = {
  'dining': 'fea943e5-08f2-493a-9f36-8cbf50d3024f', // "Dining"
  'beverage': 'bd303355-2e83-4565-98e5-917e742fe10d', // "Bars & Pubs"
  'entertainment': 'abcbe7a9-b7ec-427f-9a3a-010e922e5bd8', // "Entertainment"
  'recreation': 'fe0194cd-5c25-470e-ace7-3d5e5a1a47a4', // "Fitness"
  'shopping': 'bd96d407-5f7b-45ef-b8d5-637a316dbd25', // "Shopping"
  'accommodation': 'df52a25b-e863-4455-bfd6-a746220984c9', // "Accommodation"
  'beauty': '84102d22-f0a8-49a9-bf2b-489868529d93', // "Beauty"
  'wellness': '929e40f3-67ce-46e0-9509-9b63d345dd7c', // "Health"
  
  // 向后兼容旧类别
  'restaurant': 'fea943e5-08f2-493a-9f36-8cbf50d3024f', // 映射到 Dining
  'home_service': '29aef3f0-4fd9-425e-a067-f6c7ba7f71ff', // "Home"
  'education': 'db6140ee-dabe-4948-aafb-c5c0757f36a0', // "Education"
  'repair': '82c30023-ecef-495b-a651-a5bd615d114b', // "Professional Services"
  'other': 'aa411129-9c7c-431d-a66a-0e61fd79deeb' // "Other"
};

const getCategoryId = (serviceCategoryName: string): string => {
  const categoryId = SERVICE_CATEGORY_MAPPING[serviceCategoryName];
  if (!categoryId) {
    console.warn(`Unknown service category: ${serviceCategoryName}, using 'other'`);
    return SERVICE_CATEGORY_MAPPING['other'];
  }
  return categoryId;
};

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
      user_type = 'free'
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

    // 验证服务类别
    if (user_type.includes('business') && service_category) {
      const validServiceCategories = Object.keys(SERVICE_CATEGORY_MAPPING);
      if (!validServiceCategories.includes(service_category)) {
        return NextResponse.json(
          { 
            error: `Invalid service category. Allowed: ${validServiceCategories.join(', ')}`,
            allowedCategories: validServiceCategories
          },
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
      ...(user_type.includes('business') && {
        business_name,
        service_category
      })
    };

    console.log('=== Starting User Registration ===');
    
    // Register user
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
    
    const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(result.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('User verification failed:', userCheckError);
      return NextResponse.json(
        { error: 'User creation verification failed' },
        { status: 500 }
      );
    }
    
    console.log('✅ User verification successful');

    // Verify user profile exists
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

    // 创建业务记录 - 修复后的版本
    if (user_type.includes('business') && business_name) {
      console.log('=== Creating Service Provider Business Record ===');
      
      try {
        const categoryId = getCategoryId(service_category);
        
        console.log(`Creating business with category mapping:`, {
          serviceCategory: service_category,
          categoryId: categoryId,
          businessName: business_name
        });

        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .insert({
            owner_id: result.user.id,
            name: business_name,
            description: `${business_name} - Lifestyle business in New Zealand`,
            category_id: categoryId,    // 使用正确的字段名和UUID
            phone: phone || null,       // 使用独立字段
            email: email,              // 使用独立字段
            city: 'Auckland',          // 默认城市
            country: 'New Zealand',    // 默认国家
            is_claimed: false,         // 使用正确的字段名
            is_active: true
            // created_at 和 updated_at 由数据库自动处理
          })
          .select()
          .single();

        if (businessError) {
          console.error('Business record creation failed:', businessError);
          console.error('Business error details:', {
            message: businessError.message,
            details: businessError.details,
            hint: businessError.hint,
            code: businessError.code,
            attemptedData: {
              owner_id: result.user.id,
              name: business_name,
              category_id: categoryId,
              service_category: service_category
            }
          });
          console.warn('User registration successful but business record creation failed');
        } else {
          console.log('✅ Business record created successfully:', {
            businessId: businessData.id,
            businessName: businessData.name,
            categoryId: businessData.category_id,
            ownerId: businessData.owner_id
          });
        }
      } catch (businessError) {
        console.error('Business record creation exception:', businessError);
      }
    }

    // Send email confirmation
    console.log('=== Starting Email Confirmation ===');
    
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailResult = await sendEmailVerification(
        email, 
        result.user.id, 
        user_type,
        service_category
      );
      
      if (emailResult.success) {
        emailSent = true;
        console.log('✅ Email sent successfully');
      } else {
        emailError = emailResult.error;
        console.error('❌ Email sending failed:', emailResult.error);
        
        if (emailResult.rateLimited) {
          console.log('⚠️ Email sending rate limited');
        }
      }
    } catch (emailException) {
      console.error('❌ Email sending exception:', emailException);
      emailError = 'Email sending failed';
    }

    console.log('=== Registration Process Completed ===');
    
    return NextResponse.json({
      success: true,
      user: result.user,
      message: emailSent 
        ? 'Registration successful! Please check your email and click the confirmation link to complete verification.'
        : 'Registration successful! Email sending failed, please manually request resend confirmation email later.',
      requiresEmailVerification: true,
      emailSent: emailSent,
      emailError: emailError,
      expiresInHours: 24,
      isServiceProvider: user_type.includes('business'),
      businessCategory: user_type.includes('business') ? service_category : null
    });

  } catch (error) {
    console.error('Registration API exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}