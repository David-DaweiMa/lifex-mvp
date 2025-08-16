import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username = '测试用户' } = body;

    console.log('=== 开始邮件服务测试 ===');
    console.log('测试邮箱:', email);
    console.log('测试用户名:', username);

    // 检查环境变量
    const envCheck = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    };

    console.log('环境变量检查:', envCheck);

    // 测试邮件服务初始化
    const emailServiceStatus = {
      resendInitialized: !!emailService['resend'],
      fromEmail: emailService['fromEmail'],
    };

    console.log('邮件服务状态:', emailServiceStatus);

    // 生成测试token
    const testToken = `test-token-${Date.now()}`;

    // 测试发送确认邮件
    console.log('开始发送测试确认邮件...');
    const startTime = Date.now();
    
    const emailResult = await emailService.sendEmailConfirmation(
      email,
      username,
      testToken
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('邮件发送结果:', emailResult);
    console.log('发送耗时:', duration + 'ms');

    return NextResponse.json({
      success: true,
      message: '邮件服务测试完成',
      emailSent: emailResult.success,
      emailError: emailResult.error,
      duration: duration + 'ms',
      envCheck,
      emailServiceStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('邮件服务测试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '邮件服务测试失败: ' + (error instanceof Error ? error.message : '未知错误'),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
