// 测试用户表新字段的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试用户表新字段是否存在
    const { data, error } = await (typedSupabase as any)
      .from('user_profiles')
      .select('id, email, subscription_level, has_business_features, verification_status')
      .limit(1);

    if (error) {
      console.error('用户表字段测试失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '用户表字段测试失败', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 检查字段是否存在
    const hasSubscriptionLevel = data && data.length > 0 && 'subscription_level' in data[0];
    const hasBusinessFeatures = data && data.length > 0 && 'has_business_features' in data[0];
    const hasVerificationStatus = data && data.length > 0 && 'verification_status' in data[0];

    return NextResponse.json({
      success: true,
      message: '用户表新字段测试通过',
      data: {
        fields: {
          subscription_level: hasSubscriptionLevel,
          has_business_features: hasBusinessFeatures,
          verification_status: hasVerificationStatus
        },
        sampleData: data[0] || null
      }
    });

  } catch (error) {
    console.error('用户表字段测试错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '用户表字段测试错误', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

