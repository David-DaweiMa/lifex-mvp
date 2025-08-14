import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/authService';
import { checkUserQuota, updateUserQuota, getUserQuotas } from '@/lib/quotaService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'quota':
        return await testQuotaSystem();
      case 'user':
        return await testUserSystem();
      default:
        return NextResponse.json({
          success: true,
          message: '测试 API 可用',
          available_actions: ['quota', 'user']
        });
    }
  } catch (error) {
    console.error('测试 API 错误:', error);
    return NextResponse.json(
      { error: '测试失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, quotaType } = await request.json();

    switch (action) {
      case 'update_quota':
        if (!userId || !quotaType) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          );
        }
        return await testUpdateQuota(userId, quotaType);
      
      default:
        return NextResponse.json(
          { error: '未知操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('测试 API POST 错误:', error);
    return NextResponse.json(
      { error: '测试失败' },
      { status: 500 }
    );
  }
}

/**
 * 测试配额系统
 */
async function testQuotaSystem() {
  try {
    // 获取当前用户
    const authResult = await getCurrentUser();
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: '需要登录用户',
        message: '请先登录以测试配额系统'
      });
    }

    const userId = authResult.user.id;
    const userType = authResult.user.user_type;

    // 获取所有配额状态
    const quotas = await getUserQuotas(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        type: userType,
        email: authResult.user.email
      },
      quotas: quotas,
      message: '配额系统测试完成'
    });

  } catch (error) {
    console.error('配额系统测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '配额系统测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 测试用户系统
 */
async function testUserSystem() {
  try {
    const authResult = await getCurrentUser();
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: '用户未登录',
        message: '请先登录'
      });
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      message: '用户系统测试完成'
    });

  } catch (error) {
    console.error('用户系统测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '用户系统测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 测试更新配额
 */
async function testUpdateQuota(userId: string, quotaType: string) {
  try {
    // 检查配额
    const quotaCheck = await checkUserQuota(userId, quotaType as any);
    
    if (!quotaCheck.canUse) {
      return NextResponse.json({
        success: false,
        error: '配额已用完',
        quota: quotaCheck
      });
    }

    // 更新配额
    const updateResult = await updateUserQuota(userId, quotaType as any);
    
    if (!updateResult) {
      return NextResponse.json({
        success: false,
        error: '配额更新失败'
      });
    }

    // 重新检查配额
    const newQuota = await checkUserQuota(userId, quotaType as any);

    return NextResponse.json({
      success: true,
      message: '配额更新成功',
      previous_quota: quotaCheck,
      current_quota: newQuota
    });

  } catch (error) {
    console.error('配额更新测试失败:', error);
    return NextResponse.json({
      success: false,
      error: '配额更新测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}
