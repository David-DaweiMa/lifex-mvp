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
    const { email, password, username, full_name, user_type } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 验证用户类型
    const validUserTypes = ['free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business'];
    const selectedUserType = user_type || 'free';
    
    if (!validUserTypes.includes(selectedUserType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // 检查邮箱状态
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('id, email_verified, created_at')
      .eq('email', email)
      .single();

    if (existingProfile) {
      if (existingProfile.email_verified) {
        return NextResponse.json(
          { error: '该邮箱已被注册并验证，请直接登录' },
          { status: 400 }
        );
      } else {
        // 检查是否在24小时内
        const hoursSinceCreation = (Date.now() - new Date(existingProfile.created_at).getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCreation < 24) {
          return NextResponse.json(
            { 
              error: '该邮箱已在24小时内注册，请检查您的邮箱并点击确认链接，或等待24小时后重新注册',
              canResendEmail: true,
              email: email
            },
            { status: 400 }
          );
        } else {
          // 超过24小时，删除旧记录
          console.log('超过24小时，删除旧记录并重新注册');
          await supabase.auth.admin.deleteUser(existingProfile.id);
        }
      }
    }

    // 注册用户（不自动确认邮箱）
    const result = await registerUser(email, password, {
      username,
      full_name,
      user_type: selectedUserType
    }, false); // 不自动确认邮箱

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'User registration failed' },
        { status: 400 }
      );
    }

    // 发送邮件确认
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailResult = await sendEmailVerification(email, result.user.id, selectedUserType);
      
      if (emailResult.success) {
        emailSent = true;
        console.log('✅ 邮件发送成功');
      } else {
        emailError = emailResult.error;
        console.error('❌ 邮件发送失败:', emailResult.error);
        
        // 如果是频率限制错误，记录但不阻止注册
        if (emailResult.rateLimited) {
          console.log('⚠️ 邮件发送频率限制，用户需要稍后手动请求重新发送');
        }
      }
    } catch (emailError) {
      console.error('❌ 邮件发送异常:', emailError);
      emailError = '邮件发送失败';
    }

    // 无论邮件是否发送成功，注册都算成功
    return NextResponse.json({
      success: true,
      user: result.user,
      message: emailSent 
        ? '注册成功！请检查您的邮箱并点击确认链接完成验证。'
        : '注册成功！但邮件发送失败，请稍后手动请求重新发送确认邮件。',
      requiresEmailVerification: true,
      emailSent: emailSent,
      emailError: emailError,
      expiresInHours: 24
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
