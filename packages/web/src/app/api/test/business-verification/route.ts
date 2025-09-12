// 测试商业验证表的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试business_verification_requests表是否存在且可访问
    const { data, error } = await (typedSupabase as any)
      .from('business_verification_requests')
      .select('*')
      .limit(5);

    if (error) {
      console.error('商业验证表测试失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '商业验证表测试失败', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 测试插入数据
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data: insertData, error: insertError } = await (typedSupabase as any)
      .from('business_verification_requests')
      .insert({
        user_id: testUserId,
        request_type: 'initial',
        status: 'pending',
        submitted_data: {
          business_name: '测试商家',
          business_type: 'restaurant',
          contact_info: {
            email: 'test@example.com',
            phone: '09-123-4567'
          }
        }
      })
      .select()
      .single();

    // 清理测试数据
    if (insertData) {
      await (typedSupabase as any)
        .from('business_verification_requests')
        .delete()
        .eq('id', insertData.id);
    }

    return NextResponse.json({
      success: true,
      message: '商业验证表测试通过',
      data: {
        tableExists: true,
        canRead: true,
        canInsert: !insertError,
        sampleData: data || [],
        insertTest: insertError ? { error: insertError.message } : { success: true }
      }
    });

  } catch (error) {
    console.error('商业验证表测试错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '商业验证表测试错误', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

