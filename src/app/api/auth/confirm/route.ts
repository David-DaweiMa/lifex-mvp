import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // 验证token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('verify_email_token', { token: token, token_type: 'email_verification' });

    if (tokenError || !tokenData || tokenData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const verification = tokenData[0];
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Token has expired or already been used' },
        { status: 400 }
      );
    }

    // 标记token为已使用
    await supabase.rpc('mark_token_used', { token: token });

    // 更新用户邮箱验证状态
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', verification.user_id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // 确认用户邮箱（在auth.users表中）
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      verification.user_id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming user email:', confirmError);
      return NextResponse.json(
        { error: 'Failed to confirm user email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // 验证token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('verify_email_token', { token: token, token_type: 'email_verification' });

    if (tokenError || !tokenData || tokenData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const verification = tokenData[0];
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Token has expired or already been used' },
        { status: 400 }
      );
    }

    // 标记token为已使用
    await supabase.rpc('mark_token_used', { token: token });

    // 更新用户邮箱验证状态
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', verification.user_id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // 确认用户邮箱（在auth.users表中）
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      verification.user_id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming user email:', confirmError);
      return NextResponse.json(
        { error: 'Failed to confirm user email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
