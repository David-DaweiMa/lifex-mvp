import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      // Supabase 配置
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
        anonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置',
        serviceKeyValue: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置',
      },
      
      // 邮件配置
      email: {
        resendApiKey: !!process.env.RESEND_API_KEY,
        resendFromEmail: process.env.RESEND_FROM_EMAIL || '未配置',
        emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL || '未配置',
        emailWelcomeUrl: process.env.EMAIL_WELCOME_URL || '未配置',
      },
      
      // 应用配置
      app: {
        appUrl: process.env.NEXT_PUBLIC_APP_URL || '未配置',
        nodeEnv: process.env.NODE_ENV || '未配置',
      },
      
      // OpenAI 配置（可选）
      openai: {
        apiKey: !!process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || '未配置',
      },
      
      // 数据库配置
      database: {
        databaseUrl: !!process.env.DATABASE_URL,
        databaseUrlValue: process.env.DATABASE_URL ? '已配置' : '未配置',
      },
      
      // 分析配置（可选）
      analytics: {
        gaId: !!process.env.NEXT_PUBLIC_GA_ID,
        sentryDsn: !!process.env.SENTRY_DSN,
      }
    };

    // 检查配置完整性
    const issues = [];
    
    if (!envCheck.supabase.url) issues.push('NEXT_PUBLIC_SUPABASE_URL 未配置');
    if (!envCheck.supabase.anonKey) issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY 未配置');
    if (!envCheck.email.resendApiKey) issues.push('RESEND_API_KEY 未配置');
    if (!envCheck.email.resendFromEmail || envCheck.email.resendFromEmail === '未配置') {
      issues.push('RESEND_FROM_EMAIL 未配置');
    }

    const isConfigured = issues.length === 0;

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      issues,
      envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('环境变量检查失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '环境变量检查失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    );
  }
}
