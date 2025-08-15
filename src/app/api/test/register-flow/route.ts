import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name } = body;

    console.log('=== 注册流程详细调试开始 ===');
    console.log('输入参数:', { email, username, full_name });

    // 步骤1: 检查环境配置
    console.log('步骤1: 检查环境配置');
    const envCheck = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    console.log('环境配置:', envCheck);

    // 步骤2: 检查邮件服务状态
    console.log('步骤2: 检查邮件服务状态');
    const emailServiceStatus = {
      resendInitialized: !!emailService['resend'],
      fromEmail: emailService['fromEmail'],
    };
    console.log('邮件服务状态:', emailServiceStatus);

    // 步骤3: 执行注册流程
    console.log('步骤3: 执行注册流程');
    const startTime = Date.now();
    
    const registrationResult = await registerUser(email, password, {
      username,
      full_name,
      user_type: 'customer'
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('注册结果:', registrationResult);
    console.log('注册耗时:', duration + 'ms');

    // 步骤4: 检查用户状态
    console.log('步骤4: 检查用户状态');
    let userStatus = null;
    if (registrationResult.success && registrationResult.user) {
      userStatus = {
        id: registrationResult.user.id,
        email: registrationResult.user.email,
        is_verified: registrationResult.user.is_verified,
        created_at: registrationResult.user.created_at,
      };
    }
    console.log('用户状态:', userStatus);

    return NextResponse.json({
      success: true,
      message: '注册流程详细调试完成',
      debug: {
        envCheck,
        emailServiceStatus,
        registrationResult,
        userStatus,
        duration: duration + 'ms',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('注册流程调试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '注册流程调试失败: ' + (error instanceof Error ? error.message : '未知错误'),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
