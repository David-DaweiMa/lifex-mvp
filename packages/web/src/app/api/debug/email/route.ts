// src/app/api/debug/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { diagnoseDatabaseConnection, getEmailServiceStatus } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    console.log('=== 邮件服务诊断API调用 ===');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service_status: getEmailServiceStatus(),
      database_diagnostics: null as any
    };

    console.log('开始数据库诊断...');
    
    // 运行数据库诊断
    try {
      const dbDiagnostics = await diagnoseDatabaseConnection();
      diagnostics.database_diagnostics = dbDiagnostics;
      console.log('数据库诊断完成:', dbDiagnostics.success ? '成功' : '失败');
    } catch (error) {
      console.error('数据库诊断异常:', error);
      diagnostics.database_diagnostics = {
        success: false,
        error: error instanceof Error ? error.message : '诊断异常'
      };
    }

    console.log('=== 诊断结果汇总 ===');
    console.log('Resend状态:', diagnostics.service_status.resend);
    console.log('Supabase状态:', diagnostics.service_status.supabase);
    console.log('数据库诊断成功:', diagnostics.database_diagnostics?.success);

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('诊断API异常:', error);
    return NextResponse.json({
      error: '诊断API执行失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// 测试特定用户的邮件发送
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, action = 'test' } = body;

    console.log('=== 邮件测试API调用 ===');
    console.log('用户ID:', userId);
    console.log('邮箱:', email);
    console.log('操作:', action);

    if (!userId || !email) {
      return NextResponse.json({
        error: '需要提供 userId 和 email 参数'
      }, { status: 400 });
    }

    const result = {
      timestamp: new Date().toISOString(),
      input: { userId, email, action },
      service_status: getEmailServiceStatus(),
      test_results: {} as any
    };

    if (action === 'test' || action === 'send') {
      // 测试邮件发送
      console.log('开始测试邮件发送...');
      
      try {
        const { sendEmailVerification } = await import('@/lib/emailService');
        const sendResult = await sendEmailVerification(email, userId, 'free');
        
        result.test_results.email_send = {
          success: sendResult.success,
          error: sendResult.error,
          rate_limited: sendResult.rateLimited
        };

        console.log('邮件发送测试结果:', sendResult.success ? '成功' : '失败');
        if (!sendResult.success) {
          console.error('邮件发送失败原因:', sendResult.error);
        }

      } catch (error) {
        console.error('邮件发送测试异常:', error);
        result.test_results.email_send = {
          success: false,
          error: error instanceof Error ? error.message : '邮件发送测试异常'
        };
      }
    }

    if (action === 'test' || action === 'database') {
      // 测试数据库操作
      console.log('开始测试数据库操作...');
      
      try {
        const dbResult = await diagnoseDatabaseConnection();
        result.test_results.database = dbResult;
        console.log('数据库测试结果:', dbResult.success ? '成功' : '失败');
      } catch (error) {
        console.error('数据库测试异常:', error);
        result.test_results.database = {
          success: false,
          error: error instanceof Error ? error.message : '数据库测试异常'
        };
      }
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('测试API异常:', error);
    return NextResponse.json({
      error: '测试API执行失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}