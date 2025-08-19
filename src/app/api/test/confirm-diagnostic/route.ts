// src/app/api/test/confirm-diagnostic/route.ts
// 邮件确认问题诊断工具

import { NextRequest, NextResponse } from 'next/server';
import { typedSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      database: {},
      routing: {},
      summary: {}
    };

    console.log('=== 邮件确认问题诊断开始 ===');

    // 1. 环境变量检查
    console.log('检查环境变量...');
    results.environment = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30) + '...' : null
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      NEXT_PUBLIC_APP_URL: {
        exists: !!process.env.NEXT_PUBLIC_APP_URL,
        value: process.env.NEXT_PUBLIC_APP_URL,
        isLocalhost: process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
      }
    };

    // 2. 数据库连接和数据检查
    console.log('检查数据库状态...');
    try {
      // 检查最近的邮件确认记录
      const { data: recentConfirmations, error: confirmError } = await typedSupabaseAdmin
        .from('email_confirmations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      results.database.confirmations = {
        success: !confirmError,
        error: confirmError?.message,
        count: recentConfirmations?.length || 0,
        recent: recentConfirmations?.map(c => ({
          token: c.token.slice(0, 8) + '...',
          created_at: c.created_at,
          used_at: c.used_at,
          expires_at: c.expires_at,
          expired: new Date(c.expires_at) < new Date()
        })) || []
      };

      // 检查用户邮箱验证状态
      const { data: userStats, error: userError } = await typedSupabaseAdmin
        .from('user_profiles')
        .select('email_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const verifiedCount = userStats?.filter(u => u.email_verified).length || 0;
      const totalCount = userStats?.length || 0;

      results.database.users = {
        success: !userError,
        error: userError?.message,
        totalRecent: totalCount,
        verifiedCount,
        unverifiedCount: totalCount - verifiedCount,
        verificationRate: totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) + '%' : '0%'
      };

    } catch (dbError: any) {
      results.database.error = dbError.message;
    }

    // 3. 路由和重定向测试
    console.log('检查路由配置...');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    results.routing = {
      baseUrl,
      confirmRoute: `${baseUrl}/auth/confirm`,
      resultRoute: `${baseUrl}/auth/confirm-result`,
      apiRoute: `${baseUrl}/api/auth/confirm`,
      
      // 测试URL构造
      testErrorUrl: `${baseUrl}/auth/confirm-result?status=error&message=${encodeURIComponent('测试错误消息')}`,
      testSuccessUrl: `${baseUrl}/auth/confirm-result?status=success&message=${encodeURIComponent('测试成功消息')}`
    };

    // 4. 模拟确认流程测试（如果有测试Token）
    const testToken = searchParams.get('test_token');
    if (testToken) {
      console.log('测试Token确认流程...');
      try {
        const { data: tokenData, error: tokenError } = await typedSupabaseAdmin
          .from('email_confirmations')
          .select('*')
          .eq('token', testToken)
          .single();

        results.tokenTest = {
          tokenProvided: testToken,
          found: !tokenError && !!tokenData,
          error: tokenError?.message,
          data: tokenData ? {
            used: !!tokenData.used_at,
            expired: new Date(tokenData.expires_at) < new Date(),
            userId: tokenData.user_id,
            email: tokenData.email
          } : null
        };

        // 如果找到Token，检查对应的用户状态
        if (tokenData) {
          const { data: userProfile } = await typedSupabaseAdmin
            .from('user_profiles')
            .select('email_verified')
            .eq('id', tokenData.user_id)
            .single();

          results.tokenTest.userEmailVerified = userProfile?.email_verified || false;
        }

      } catch (tokenTestError: any) {
        results.tokenTest = {
          error: tokenTestError.message
        };
      }
    }

    // 5. 总结和建议
    console.log('生成诊断总结...');
    const issues = [];
    const suggestions = [];

    if (!results.environment.NEXT_PUBLIC_APP_URL.exists) {
      issues.push('缺少 NEXT_PUBLIC_APP_URL 环境变量');
      suggestions.push('设置正确的应用URL');
    }

    if (results.environment.NEXT_PUBLIC_APP_URL.isLocalhost && action !== 'local') {
      issues.push('生产环境使用了localhost URL');
      suggestions.push('更新 NEXT_PUBLIC_APP_URL 为生产域名');
    }

    if (!results.database.confirmations.success) {
      issues.push('无法访问email_confirmations表');
      suggestions.push('检查数据库权限和RLS策略');
    }

    if (results.database.confirmations.count === 0) {
      issues.push('没有邮件确认记录');
      suggestions.push('检查邮件发送功能是否正常');
    }

    if (results.database.users.verificationRate === '0%') {
      issues.push('没有用户邮箱验证成功');
      suggestions.push('检查邮件确认流程');
    }

    results.summary = {
      totalIssues: issues.length,
      issues,
      suggestions,
      overallStatus: issues.length === 0 ? 'healthy' : 
                    issues.length <= 2 ? 'warning' : 'critical'
    };

    console.log('=== 诊断完成 ===');
    console.log('状态:', results.summary.overallStatus);
    console.log('问题数量:', results.summary.totalIssues);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('诊断过程失败:', error);
    return NextResponse.json({
      error: '诊断过程失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// 使用方法：
// GET /api/test/confirm-diagnostic                    # 完整诊断
// GET /api/test/confirm-diagnostic?action=local       # 本地环境诊断
// GET /api/test/confirm-diagnostic?test_token=xxx     # 测试特定Token