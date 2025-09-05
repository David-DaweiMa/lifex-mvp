import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailVerification } from '@/lib/emailService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 查找未验证的用户
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .eq('email_verified', false)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '未找到未验证的账户' },
        { status: 404 }
      );
    }

    // 检查是否在24小时内
    const hoursSinceCreation = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation >= 24) {
      return NextResponse.json(
        { error: '确认链接已过期，请重新注册' },
        { status: 400 }
      );
    }

    // 检查是否已有有效的确认token
    const { data: existingToken } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('user_id', profile.id)
      .eq('token_type', 'email_verification')
      .eq('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingToken) {
      return NextResponse.json(
        { error: '确认邮件已发送，请检查您的邮箱' },
        { status: 400 }
      );
    }

    // 生成新的确认token
    const { data: newToken, error: tokenError } = await (supabase as any)
      .rpc('generate_email_token', {
        user_id: profile.id,
        email: email,
        token_type: 'email_verification',
        expires_in_hours: 24
      });

    if (tokenError) {
      console.error('生成token失败:', tokenError);
      return NextResponse.json(
        { error: '生成确认链接失败' },
        { status: 500 }
      );
    }

    // 发送邮件
    try {
      const emailResult = await sendEmailVerification(email, profile.id, profile.user_type);
      
      if (!emailResult.success) {
        console.error('发送邮件失败:', emailResult.error);
        
        // 如果是频率限制错误，返回特殊响应
        if (emailResult.rateLimited) {
          return NextResponse.json(
            { 
              error: '邮件发送频率过高，请稍后再试。如果问题持续存在，请联系客服。',
              rateLimited: true
            },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: '发送邮件失败，请稍后重试' },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      return NextResponse.json(
        { error: '发送邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '确认邮件已重新发送，请检查您的邮箱',
      expiresInHours: 24
    });

  } catch (error) {
    console.error('重新发送邮件错误:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
