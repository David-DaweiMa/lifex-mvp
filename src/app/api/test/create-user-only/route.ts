// src/app/api/test/create-user-only/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // 只创建用户，不创建业务记录
    const result = await registerUser(
      userData.email, 
      userData.password, 
      {
        username: userData.username,
        full_name: userData.full_name,
        subscription_level: userData.subscription_level
        // 故意不包含business相关信息，避免触发业务记录创建
      }, 
      false
    );

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        userId: result.user.id,
        userEmail: result.user.email,
        message: '用户创建成功，未创建业务记录'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '用户创建失败'
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}