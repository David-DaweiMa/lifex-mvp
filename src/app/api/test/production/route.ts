import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    resendApiKey: process.env.RESEND_API_KEY ? '已配置' : '未配置',
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
    emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置',
  };

  return NextResponse.json({
    success: true,
    message: '生产环境配置检查',
    config,
    timestamp: new Date().toISOString(),
  });
}
