import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';
import { sendEmailVerification } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name, user_type } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 验证用户类型
    const validUserTypes = ['free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business'];
    const selectedUserType = user_type || 'free';
    
    if (!validUserTypes.includes(selectedUserType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // 注册用户（不自动确认邮箱）
    const result = await registerUser(email, password, {
      username,
      full_name,
      user_type: selectedUserType
    }, false); // 不自动确认邮箱

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // 发送邮件确认
    try {
      await sendEmailVerification(email, result.user.id, selectedUserType);
    } catch (emailError) {
      console.error('Email verification error:', emailError);
      // 邮件发送失败不影响注册流程，但记录错误
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Registration successful. Please check your email to verify your account.',
      requiresEmailVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
