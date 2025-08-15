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
    
    // 创建一个自定义的注册函数来捕获邮件发送过程
    interface EmailAttempt {
      attempt: number;
      success: boolean;
      error?: string;
      duration: string;
      timestamp: string;
    }
    
    let emailSendAttempts: EmailAttempt[] = [];
    let emailSendSuccess = false;
    let emailSendError: string | null = null;
    
    // 临时替换 emailService.sendEmailConfirmation 来捕获详细信息
    const originalSendEmailConfirmation = emailService.sendEmailConfirmation;
    emailService.sendEmailConfirmation = async (email, username, token) => {
      console.log('=== 邮件发送过程开始 ===');
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const attemptStartTime = Date.now();
        console.log(`邮件发送尝试 ${attempt}/3 开始`);
        
        try {
          const result = await originalSendEmailConfirmation.call(emailService, email, username, token);
          const attemptDuration = Date.now() - attemptStartTime;
          
          const attemptInfo = {
            attempt,
            success: result.success,
            error: result.error,
            duration: attemptDuration + 'ms',
            timestamp: new Date().toISOString()
          };
          
          emailSendAttempts.push(attemptInfo);
          console.log(`邮件发送尝试 ${attempt}/3 结果:`, attemptInfo);
          
          if (result.success) {
            emailSendSuccess = true;
            console.log('✅ 邮件发送成功');
            break;
          } else {
            emailSendError = result.error;
            console.log(`❌ 邮件发送失败 (尝试 ${attempt}/3):`, result.error);
            
            if (attempt < 3) {
              console.log('等待2秒后重试...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (error) {
          const attemptDuration = Date.now() - attemptStartTime;
          emailSendError = error instanceof Error ? error.message : '未知错误';
          
          const attemptInfo = {
            attempt,
            success: false,
            error: emailSendError,
            duration: attemptDuration + 'ms',
            timestamp: new Date().toISOString()
          };
          
          emailSendAttempts.push(attemptInfo);
          console.log(`❌ 邮件发送异常 (尝试 ${attempt}/3):`, error);
          
          if (attempt < 3) {
            console.log('等待2秒后重试...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!emailSendSuccess) {
        console.error('❌ 所有邮件发送尝试都失败了');
        return {
          success: false,
          error: `邮件发送失败: ${emailSendError}`
        };
      }
      
      return { success: true };
    };
    
    const registrationResult = await registerUser(email, password, {
      username,
      full_name,
      user_type: 'customer'
    });
    
    // 恢复原始方法
    emailService.sendEmailConfirmation = originalSendEmailConfirmation;
    
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
        emailSendAttempts,
        emailSendSuccess,
        emailSendError
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
