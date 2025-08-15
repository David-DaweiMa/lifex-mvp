import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

interface ConfigStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'unknown';
  message: string;
  value?: string;
}

export async function GET(request: NextRequest) {
  const configs: ConfigStatus[] = [];

  // 检查 Resend API Key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    configs.push({
      name: 'Resend API Key',
      status: 'success',
      message: '已配置 Resend API 密钥',
      value: resendApiKey.substring(0, 8) + '...'
    });
  } else {
    configs.push({
      name: 'Resend API Key',
      status: 'error',
      message: '未配置 Resend API 密钥'
    });
  }

  // 检查 Resend From Email
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  if (resendFromEmail) {
    configs.push({
      name: 'Resend From Email',
      status: 'success',
      message: '已配置发送邮箱地址',
      value: resendFromEmail
    });
  } else {
    configs.push({
      name: 'Resend From Email',
      status: 'error',
      message: '未配置发送邮箱地址'
    });
  }

  // 检查 Email Confirmation URL
  const emailConfirmationUrl = process.env.EMAIL_CONFIRMATION_URL;
  if (emailConfirmationUrl) {
    configs.push({
      name: 'Email Confirmation URL',
      status: 'success',
      message: '已配置邮件确认 URL',
      value: emailConfirmationUrl
    });
  } else {
    configs.push({
      name: 'Email Confirmation URL',
      status: 'warning',
      message: '未配置邮件确认 URL，将使用默认值'
    });
  }

  // 检查 App URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    configs.push({
      name: 'App URL',
      status: 'success',
      message: '已配置应用 URL',
      value: appUrl
    });
  } else {
    configs.push({
      name: 'App URL',
      status: 'warning',
      message: '未配置应用 URL，将使用默认值'
    });
  }

  // 检查 Supabase 配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    configs.push({
      name: 'Supabase Configuration',
      status: 'success',
      message: '已配置 Supabase 连接'
    });
  } else {
    configs.push({
      name: 'Supabase Configuration',
      status: 'warning',
      message: '未配置 Supabase，将使用演示模式'
    });
  }

  // 检查 Node Environment
  const nodeEnv = process.env.NODE_ENV;
  configs.push({
    name: 'Node Environment',
    status: nodeEnv === 'production' ? 'success' : 'warning',
    message: `当前环境：${nodeEnv || 'development'}`,
    value: nodeEnv || 'development'
  });

  // 检查邮件服务可用性
  try {
    // 这里可以添加实际的邮件服务测试
    // 暂时只检查配置
    configs.push({
      name: 'Email Service',
      status: resendApiKey ? 'success' : 'error',
      message: resendApiKey ? '邮件服务配置完整' : '邮件服务配置不完整'
    });
  } catch (error) {
    configs.push({
      name: 'Email Service',
      status: 'error',
      message: '邮件服务测试失败：' + (error instanceof Error ? error.message : '未知错误')
    });
  }

  return NextResponse.json({
    success: true,
    configs,
    summary: {
      total: configs.length,
      success: configs.filter(c => c.status === 'success').length,
      error: configs.filter(c => c.status === 'error').length,
      warning: configs.filter(c => c.status === 'warning').length
    }
  });
}
