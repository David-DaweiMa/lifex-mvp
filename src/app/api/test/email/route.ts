import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, type } = body;

    // 验证输入
    if (!email || !username || !type) {
      return NextResponse.json(
        { 
          success: false, 
          message: '缺少必要参数：email, username, type' 
        },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '邮箱格式不正确' 
        },
        { status: 400 }
      );
    }

    let result;

    // 根据类型发送不同的邮件
    switch (type) {
      case 'confirmation':
        // 发送确认邮件 - 使用测试模式
        const testToken = 'test-token-' + Date.now();
        const testConfirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${testToken}&email=${encodeURIComponent(email)}&test=true`;
        
        // 直接调用邮件服务，但使用测试 URL
        const template = emailService.generateEmailConfirmationTemplate(username, testToken, email);
        result = await emailService.sendEmail({
          to: email,
          subject: template.subject,
          html: template.html.replace(
            /href="[^"]*"/,
            `href="${testConfirmationUrl}"`
          ),
          text: template.text.replace(
            /http:\/\/localhost:3000\/auth\/confirm\?token=[^&\s]*/,
            testConfirmationUrl
          ),
        });
        break;

      case 'welcome':
        // 发送欢迎邮件
        result = await emailService.sendWelcomeEmail(email, username);
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            message: '不支持的邮件类型：' + type 
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `邮件发送成功！请检查 ${email} 的收件箱（包括垃圾邮件文件夹）`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '邮件发送失败：' + (result.error || '未知错误')
      });
    }

  } catch (error) {
    console.error('邮件测试失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器错误：' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '邮件测试 API 可用',
    endpoints: {
      'POST /api/test/email': '发送测试邮件',
      body: {
        email: 'string (必需)',
        username: 'string (必需)',
        type: 'confirmation | welcome (必需)'
      }
    }
  });
}
