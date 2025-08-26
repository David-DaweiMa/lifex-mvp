// src/app/api/test/business-record-creation/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, service_category } = body;

    console.log('=== 测试Business记录创建 ===');
    console.log('测试参数:', { business_name, service_category });

    const diagnostics: any = {
      step1: { name: '检查businesses表结构', status: 'pending' },
      step2: { name: '检查categories表', status: 'pending' },
      step3: { name: '测试business记录插入', status: 'pending' }
    };

    // 步骤1: 检查businesses表结构
    console.log('步骤1: 检查businesses表结构...');
    try {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'businesses')
        .eq('table_schema', 'public');

      if (error) {
        diagnostics.step1 = {
          status: 'failed',
          error: error.message,
          details: error
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      const requiredColumns = ['id', 'owner_id', 'name', 'category_id', 'phone', 'email', 'city', 'country', 'is_claimed', 'is_active'];
      const missingColumns = requiredColumns.filter(col => 
        !columns?.find(c => c.column_name === col)
      );

      if (missingColumns.length > 0) {
        diagnostics.step1 = {
          status: 'failed',
          error: 'businesses表缺少必需的列',
          details: {
            missingColumns,
            allColumns: columns?.map(c => c.column_name)
          }
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      diagnostics.step1 = {
        status: 'passed',
        details: {
          columnCount: columns?.length,
          requiredColumns: requiredColumns.map(col => ({
            name: col,
            present: !!columns?.find(c => c.column_name === col),
            type: columns?.find(c => c.column_name === col)?.data_type
          }))
        }
      };
    } catch (error) {
      diagnostics.step1 = {
        status: 'failed',
        error: '检查businesses表结构失败',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    // 步骤2: 检查categories表
    console.log('步骤2: 检查categories表...');
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .limit(5);

      if (error) {
        diagnostics.step2 = {
          status: 'failed',
          error: error.message,
          details: error
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      if (!categories || categories.length === 0) {
        diagnostics.step2 = {
          status: 'failed',
          error: 'categories表为空或不存在',
          details: { categories }
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      diagnostics.step2 = {
        status: 'passed',
        details: {
          categoryCount: categories.length,
          categories: categories.map(c => ({ id: c.id, name: c.name }))
        }
      };
    } catch (error) {
      diagnostics.step2 = {
        status: 'failed',
        error: '检查categories表失败',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    // 步骤3: 测试business记录插入
    console.log('步骤3: 测试business记录插入...');
    try {
      // 先创建一个测试用户
      const testEmail = `test-business-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: false
      });

      if (authError) {
        diagnostics.step3 = {
          status: 'failed',
          error: '创建测试用户失败',
          details: authError
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      // 获取一个category_id
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
        .single();

      if (categoryError || !category) {
        diagnostics.step3 = {
          status: 'failed',
          error: '获取category_id失败',
          details: categoryError
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      // 尝试插入business记录
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          owner_id: authData.user.id,
          name: business_name || 'Test Business',
          description: 'Test business for diagnostics',
          category_id: category.id,
          phone: '123456789',
          email: testEmail,
          city: 'Auckland',
          country: 'New Zealand',
          is_claimed: false,
          is_active: true
        })
        .select()
        .single();

      if (businessError) {
        diagnostics.step3 = {
          status: 'failed',
          error: businessError.message,
          details: {
            message: businessError.message,
            details: businessError.details,
            hint: businessError.hint,
            code: businessError.code
          }
        };
      } else {
        diagnostics.step3 = {
          status: 'passed',
          details: {
            businessId: businessData.id,
            businessName: businessData.name,
            categoryId: businessData.category_id,
            ownerId: businessData.owner_id
          }
        };
      }

      // 清理测试数据
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.warn('清理测试数据失败:', cleanupError);
      }

    } catch (error) {
      diagnostics.step3 = {
        status: 'failed',
        error: '测试business记录插入异常',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    console.log('=== Business记录创建测试完成 ===');

    const allPassed = Object.values(diagnostics).every((d: any) => d.status === 'passed');
    
    return NextResponse.json({
      success: allPassed,
      diagnostics,
      summary: allPassed ? 
        'Business记录创建测试通过，business用户注册应该可以正常工作' : 
        '发现business记录创建问题，请查看具体失败的步骤'
    });

  } catch (error) {
    console.error('Business记录创建测试过程中发生错误:', error);
    return NextResponse.json({
      success: false,
      error: 'Business记录创建测试过程中发生错误',
      details: error
    }, { status: 500 });
  }
}
