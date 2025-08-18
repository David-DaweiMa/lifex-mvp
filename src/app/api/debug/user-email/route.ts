// src/app/api/debug/user-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmailVerification } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('=== 用户邮件测试API ===');
    
    // 获取最近注册的用户
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, created_at, email_verified')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      return NextResponse.json({
        error: '无法获取用户列表',
        details: usersError.message
      }, { status: 500 });
    }

    // 获取现有的邮件确认记录
    const { data: existingConfirmations, error: confirmationsError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      recent_users: recentUsers || [],
      existing_confirmations: existingConfirmations || [],
      instructions: {
        test_with_real_user: "POST /api/debug/user-email with {'userId': 'real-user-id', 'email': 'real-email'}",
        create_test_user: "Register a new user first, then test with that user's ID"
      }
    });

  } catch (error) {
    console.error('用户邮件测试API错误:', error);
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, userType = 'free' } = body;

    console.log('=== 测试真实用户的邮件发送 ===');
    console.log('用户ID:', userId);
    console.log('邮箱:', email);
    console.log('用户类型:', userType);

    if (!userId || !email) {
      return NextResponse.json({
        error: '缺少必需参数',
        required: ['userId', 'email']
      }, { status: 400 });
    }

    const testResult = {
      timestamp: new Date().toISOString(),
      input: { userId, email, userType },
      steps: {} as any
    };

    // 步骤1: 验证用户存在
    console.log('步骤1: 验证用户存在');
    const { data: userExists, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    testResult.steps.user_verification = {
      success: !userError,
      error: userError?.message,
      user_data: userExists
    };

    if (userError || !userExists) {
      testResult.steps.overall_result = {
        success: false,
        error: '用户不存在，无法进行邮件测试'
      };
      return NextResponse.json(testResult);
    }

    // 步骤2: 清理旧的确认记录
    console.log('步骤2: 清理旧的确认记录');
    const { error: cleanupError } = await supabaseAdmin
      .from('email_confirmations')
      .delete()
      .eq('user_id', userId);

    testResult.steps.cleanup = {
      success: !cleanupError,
      error: cleanupError?.message
    };

    // 步骤3: 测试邮件发送
    console.log('步骤3: 测试邮件发送');
    const emailResult = await sendEmailVerification(email, userId, userType);

    testResult.steps.email_send = {
      success: emailResult.success,
      error: emailResult.error,
      rate_limited: emailResult.rateLimited
    };

    // 步骤4: 验证Token是否保存
    console.log('步骤4: 验证Token保存');
    const { data: savedTokens, error: tokenError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    testResult.steps.token_verification = {
      success: !tokenError && savedTokens && savedTokens.length > 0,
      error: tokenError?.message,
      tokens_found: savedTokens?.length || 0,
      latest_token: savedTokens?.[0] || null
    };

    // 整体结果
    testResult.steps.overall_result = {
      success: emailResult.success && (!tokenError && savedTokens && savedTokens.length > 0),
      email_sent: emailResult.success,
      token_saved: !tokenError && savedTokens && savedTokens.length > 0,
      ready_for_confirmation: emailResult.success && (!tokenError && savedTokens && savedTokens.length > 0)
    };

    console.log('=== 测试完成 ===');
    console.log('邮件发送:', emailResult.success ? '成功' : '失败');
    console.log('Token保存:', testResult.steps.token_verification.success ? '成功' : '失败');

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('用户邮件测试错误:', error);
    return NextResponse.json({
      error: '测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}