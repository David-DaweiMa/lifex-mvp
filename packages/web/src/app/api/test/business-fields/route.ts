// 测试商家表新字段的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试商家表新字段是否存在
    const { data, error } = await (typedSupabase as any)
      .from('businesses')
      .select('id, name, verification_status, business_type, business_license, tax_id')
      .limit(1);

    if (error) {
      console.error('商家表字段测试失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '商家表字段测试失败', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 检查字段是否存在
    const hasVerificationStatus = data && data.length > 0 && 'verification_status' in data[0];
    const hasBusinessType = data && data.length > 0 && 'business_type' in data[0];
    const hasBusinessLicense = data && data.length > 0 && 'business_license' in data[0];
    const hasTaxId = data && data.length > 0 && 'tax_id' in data[0];

    return NextResponse.json({
      success: true,
      message: '商家表新字段测试通过',
      data: {
        fields: {
          verification_status: hasVerificationStatus,
          business_type: hasBusinessType,
          business_license: hasBusinessLicense,
          tax_id: hasTaxId
        },
        sampleData: data[0] || null
      }
    });

  } catch (error) {
    console.error('商家表字段测试错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '商家表字段测试错误', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

