import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { registerUser } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name } = body;

    console.log('=== 邮件发送对比测试开始 ===');

    // 测试1: 直接发送测试邮件
    console.log('测试1: 直接发送测试邮件');
    const testEmailResult = await emailService.sendEmail({
      to: email,
      subject: '测试邮件 - 直接发送',
      html: '<h1>这是一封测试邮件</h1><p>如果您收到这封邮件，说明邮件服务正常工作。</p>',
      text: '这是一封测试邮件 - 如果您收到这封邮件，说明邮件服务正常工作。'
    });
    console.log('测试邮件结果:', testEmailResult);

    // 等待1秒避免 rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试2: 发送确认邮件模板
    console.log('测试2: 发送确认邮件模板');
    const confirmationTemplate = emailService.generateEmailConfirmationTemplate(
      username || '测试用户',
      'test-confirmation-token',
      email
    );
    const confirmationEmailResult = await emailService.sendEmail({
      to: email,
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html,
      text: confirmationTemplate.text
    });
    console.log('确认邮件结果:', confirmationEmailResult);

    // 等待1秒避免 rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试3: 注册流程（但不创建用户）
    console.log('测试3: 模拟注册流程邮件发送');
    let registrationEmailResult = null;
    try {
      // 创建一个临时的用户ID用于测试
      const tempUserId = 'temp-user-id-for-testing';
      const registrationTemplate = emailService.generateEmailConfirmationTemplate(
        username || '测试用户',
        tempUserId,
        email
      );
      
      registrationEmailResult = await emailService.sendEmail({
        to: email,
        subject: registrationTemplate.subject,
        html: registrationTemplate.html,
        text: registrationTemplate.text
      });
      console.log('注册流程邮件结果:', registrationEmailResult);
    } catch (error) {
      console.error('注册流程邮件发送失败:', error);
      registrationEmailResult = { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误'
      };
    }

    // 测试4: 实际注册流程
    console.log('测试4: 实际注册流程');
    const registrationResult = await registerUser(email, password, {
      username,
      full_name,
      user_type: 'customer'
    });
    console.log('实际注册结果:', registrationResult);

    return NextResponse.json({
      success: true,
      message: '邮件发送对比测试完成',
      results: {
        testEmail: testEmailResult,
        confirmationEmail: confirmationEmailResult,
        registrationEmail: registrationEmailResult,
        actualRegistration: registrationResult
      },
      comparison: {
        testEmailSuccess: testEmailResult.success,
        confirmationEmailSuccess: confirmationEmailResult.success,
        registrationEmailSuccess: registrationEmailResult?.success,
        actualRegistrationSuccess: registrationResult.success
      }
    });

  } catch (error) {
    console.error('邮件对比测试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '对比测试失败: ' + (error instanceof Error ? error.message : '未知错误'),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
