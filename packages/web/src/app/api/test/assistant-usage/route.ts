// 测试AI助手使用表的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试assistant_usage表是否存在且可访问
    const { data, error } = await (typedSupabase as any)
      .from('assistant_usage')
      .select('*')
      .limit(5);

    if (error) {
      console.error('AI助手使用表测试失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI助手使用表测试失败', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 测试插入数据
    const { data: insertData, error: insertError } = await (typedSupabase as any)
      .from('assistant_usage')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // 测试UUID
        assistant_type: 'coly'
      })
      .select()
      .single();

    // 清理测试数据
    if (insertData) {
      await (typedSupabase as any)
        .from('assistant_usage')
        .delete()
        .eq('id', insertData.id);
    }

    return NextResponse.json({
      success: true,
      message: 'AI助手使用表测试通过',
      data: {
        tableExists: true,
        canRead: true,
        canInsert: !insertError,
        sampleData: data || [],
        insertTest: insertError ? { error: insertError.message } : { success: true }
      }
    });

  } catch (error) {
    console.error('AI助手使用表测试错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI助手使用表测试错误', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

