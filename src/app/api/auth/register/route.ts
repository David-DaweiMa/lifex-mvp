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

    // 🔄 新的逻辑：先确保用户完全创建成功
    console.log('=== 开始用户注册流程 ===');
    
    // 注册用户（不自动确认邮箱）
    const result = await registerUser(email, password, {
      username,
      full_name,
      user_type: selectedUserType
    }, false); // 不自动确认邮箱

    if (!result.success || !result.user) {
      console.error('用户注册失败:', result.error);
      return NextResponse.json(
        { error: result.error || 'User registration failed' },
        { status: 400 }
      );
    }

    console.log('✅ 用户注册成功，用户ID:', result.user.id);

    // 🔄 验证用户创建完整性
    console.log('=== 验证用户创建完整性 ===');
    
    // 1. 再次验证用户是否真的存在
    const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(result.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('用户验证失败:', userCheckError);
      return NextResponse.json(
        { error: '用户创建验证失败' },
        { status: 500 }
      );
    }
    
    console.log('✅ 用户验证成功');

    // 2. 验证用户配置文件是否存在
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', result.user.id)
      .single();

    if (profileCheckError || !profileCheck) {
      console.error('用户配置文件验证失败:', profileCheckError);
      return NextResponse.json(
        { error: '用户配置文件验证失败' },
        { status: 500 }
      );
    }
    
    console.log('✅ 用户配置文件验证成功');

    // 3. 现在可以安全地发送邮件确认
    console.log('=== 开始发送邮件确认 ===');
    
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
    // 因为用户已经成功创建，邮件发送失败不影响用户注册
    console.log('=== 注册流程完成 ===');
    
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
