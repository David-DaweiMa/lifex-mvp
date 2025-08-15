import { NextRequest, NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';
import { emailService } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const isTest = searchParams.get('test') === 'true';

    if (!token || !email) {
      return NextResponse.json(
        { error: '缺少必要的确认参数' },
        { status: 400 }
      );
    }

    // 如果是测试模式，直接返回成功
    if (isTest) {
      return NextResponse.json({
        success: true,
        message: '测试邮件确认成功！这是一个测试链接，实际注册时会使用真实的确认流程。'
      });
    }

    // 验证用户是否存在
    const { data: user, error: userError } = await typedSupabase.auth.admin.getUserById(token);
    
    if (userError || !user.user) {
      return NextResponse.json(
        { error: '无效的确认链接' },
        { status: 400 }
      );
    }

    // 检查邮箱是否匹配
    if (user.user.email !== email) {
      return NextResponse.json(
        { error: '邮箱地址不匹配' },
        { status: 400 }
      );
    }

    // 检查是否已经确认过
    if (user.user.email_confirmed_at) {
      return NextResponse.json(
        { error: '邮箱已经确认过了' },
        { status: 400 }
      );
    }

    // 确认用户邮箱
    const { error: confirmError } = await typedSupabase.auth.admin.updateUserById(token, {
      email_confirm: true
    });

    if (confirmError) {
      console.error('邮箱确认失败:', confirmError);
      return NextResponse.json(
        { error: '邮箱确认失败' },
        { status: 500 }
      );
    }

    // 更新用户配置文件中的验证状态
    const { error: profileError } = await typedSupabase
      .from('user_profiles')
      .update({ 
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', token);

    if (profileError) {
      console.warn('更新用户配置文件失败:', profileError);
    }

    // 发送欢迎邮件
    try {
      const username = user.user.user_metadata?.username || '用户';
      await emailService.sendWelcomeEmail(email, username);
    } catch (emailError) {
      console.warn('欢迎邮件发送失败:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '邮箱确认成功！欢迎来到 LifeX！'
    });

  } catch (error) {
    console.error('邮箱确认处理失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      );
    }

    // 查找用户
    const { data: users, error: userError } = await typedSupabase.auth.admin.listUsers();
    
    if (userError) {
      return NextResponse.json(
        { error: '查找用户失败' },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否已经确认过
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: '邮箱已经确认过了' },
        { status: 400 }
      );
    }

    // 重新发送确认邮件
    try {
      const username = user.user_metadata?.username || '用户';
      await emailService.sendEmailConfirmation(
        email,
        username,
        user.id
      );

      return NextResponse.json({
        success: true,
        message: '确认邮件已重新发送'
      });

    } catch (emailError) {
      console.error('重新发送确认邮件失败:', emailError);
      return NextResponse.json(
        { error: '邮件发送失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('重新发送确认邮件处理失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
