// 测试产品配额表的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试product_quota_tracking表是否存在且可访问
    const { data, error } = await (typedSupabase as any)
      .from('product_quota_tracking')
      .select('*')
      .limit(5);

    if (error) {
      console.error('产品配额表测试失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '产品配额表测试失败', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 测试插入数据
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data: insertData, error: insertError } = await (typedSupabase as any)
      .from('product_quota_tracking')
      .insert({
        user_id: testUserId,
        quota_type: 'daily',
        quota_period_start: new Date().toISOString(),
        quota_period_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        current_count: 0,
        limit_count: 10
      })
      .select()
      .single();

    // 清理测试数据
    if (insertData) {
      await (typedSupabase as any)
        .from('product_quota_tracking')
        .delete()
        .eq('id', insertData.id);
    }

    return NextResponse.json({
      success: true,
      message: '产品配额表测试通过',
      data: {
        tableExists: true,
        canRead: true,
        canInsert: !insertError,
        sampleData: data || [],
        insertTest: insertError ? { error: insertError.message } : { success: true }
      }
    });

  } catch (error) {
    console.error('产品配额表测试错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '产品配额表测试错误', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
