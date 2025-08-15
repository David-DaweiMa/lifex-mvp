import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    console.log('开始测试注册邮件发送...');
    console.log('邮箱:', email);
    console.log('用户名:', username);

    // 注册用户
    const result = await registerUser(email, password, {
      username,
      full_name,
      user_type: 'customer'
    });

    console.log('注册结果:', result);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '注册成功，请检查邮箱确认邮件',
      user: result.user
    });

  } catch (error) {
    console.error('注册邮件测试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
