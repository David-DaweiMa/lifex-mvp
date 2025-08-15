import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { registerUser } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name } = body;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config: {
        resendApiKey: process.env.RESEND_API_KEY ? '已配置' : '未配置',
        resendFromEmail: process.env.RESEND_FROM_EMAIL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置',
      }
    };

    console.log('=== 邮件发送调试开始 ===');
    console.log('调试信息:', debugInfo);

    // 步骤1: 测试邮件服务初始化
    console.log('步骤1: 测试邮件服务初始化');
    const emailServiceStatus = {
      resendInitialized: emailService['resend'] !== null,
      fromEmail: emailService['fromEmail']
    };
    console.log('邮件服务状态:', emailServiceStatus);

    // 步骤2: 测试直接邮件发送（带详细日志）
    console.log('步骤2: 测试直接邮件发送');
    const testEmailData = {
      to: email,
      subject: '测试邮件 - 直接发送',
      html: '<h1>这是一封测试邮件</h1><p>如果您收到这封邮件，说明邮件服务正常工作。</p>',
      text: '这是一封测试邮件 - 如果您收到这封邮件，说明邮件服务正常工作。'
    };
    
    console.log('发送邮件数据:', testEmailData);
    
    // 直接调用 Resend API 获取详细响应
    let resendResponse = null;
    if (emailService['resend']) {
      try {
        const { data, error } = await emailService['resend'].emails.send({
          from: emailService['fromEmail'],
          to: [email],
          subject: testEmailData.subject,
          html: testEmailData.html,
          text: testEmailData.text,
        });
        
        resendResponse = { data, error };
        console.log('Resend 直接响应:', resendResponse);
      } catch (resendError) {
        console.error('Resend 直接调用错误:', resendError);
        resendResponse = { error: resendError };
      }
    }
    
    const testEmailResult = await emailService.sendEmail(testEmailData);
    console.log('直接邮件发送结果:', testEmailResult);

    // 步骤3: 测试注册流程
    console.log('步骤3: 测试注册流程');
    const registrationResult = await registerUser(email, password, {
      username,
      full_name,
      user_type: 'customer'
    });
    console.log('注册结果:', registrationResult);

    // 步骤4: 测试确认邮件模板生成
    console.log('步骤4: 测试确认邮件模板生成');
    const template = emailService.generateEmailConfirmationTemplate(
      username || '测试用户',
      'test-token-123',
      email
    );
    console.log('邮件模板生成成功:', {
      subject: template.subject,
      htmlLength: template.html.length,
      textLength: template.text.length
    });

    return NextResponse.json({
      success: true,
      message: '调试完成',
      debugInfo,
      emailServiceStatus,
      testEmailResult,
      resendResponse,
      registrationResult,
      templateGenerated: true
    });

  } catch (error) {
    console.error('邮件调试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '调试失败: ' + (error instanceof Error ? error.message : '未知错误'),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
