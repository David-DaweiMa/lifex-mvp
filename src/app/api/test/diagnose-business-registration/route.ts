// src/app/api/test/diagnose-business-registration/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, business_name, service_category } = body;

    console.log('=== 开始诊断Business用户注册 ===');
    console.log('测试参数:', { email, business_name, service_category });

    const diagnostics: any = {
      step1: { name: '环境变量检查', status: 'pending' },
      step2: { name: '数据库连接检查', status: 'pending' },
      step3: { name: '用户配置文件表结构检查', status: 'pending' },
      step4: { name: 'RLS策略检查', status: 'pending' },
      step5: { name: '测试用户创建', status: 'pending' },
      step6: { name: '测试配置文件创建', status: 'pending' },
      step7: { name: '测试业务记录创建', status: 'pending' }
    };

    // 步骤1: 检查环境变量
    console.log('步骤1: 检查环境变量...');
    if (!supabaseUrl || !supabaseServiceKey) {
      diagnostics.step1 = {
        status: 'failed',
        error: '缺少必要的环境变量',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      };
      return NextResponse.json({ success: false, diagnostics });
    }
    diagnostics.step1 = { status: 'passed' };

    // 步骤2: 检查数据库连接
    console.log('步骤2: 检查数据库连接...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        diagnostics.step2 = {
          status: 'failed',
          error: error.message,
          details: error
        };
        return NextResponse.json({ success: false, diagnostics });
      }
      diagnostics.step2 = { status: 'passed' };
    } catch (error) {
      diagnostics.step2 = {
        status: 'failed',
        error: '数据库连接失败',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    // 步骤3: 检查用户配置文件表结构
    console.log('步骤3: 检查用户配置文件表结构...');
    try {
      const { data: columns, error } = await supabase
        .rpc('get_table_columns', {
          table_name: 'user_profiles',
          schema_name: 'public'
        });

      if (error) {
        diagnostics.step3 = {
          status: 'failed',
          error: error.message,
          details: error
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      const requiredColumns = ['id', 'email', 'user_type', 'email_verified', 'created_at'];
      const missingColumns = requiredColumns.filter(col => 
        !columns?.find((c: any) => c.column_name === col)
      );

      if (missingColumns.length > 0) {
        diagnostics.step3 = {
          status: 'failed',
          error: '缺少必需的列',
          details: {
            missingColumns,
            allColumns: columns?.map((c: any) => c.column_name)
          }
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      diagnostics.step3 = {
        status: 'passed',
        details: {
          columnCount: columns?.length,
          requiredColumns: requiredColumns.map(col => ({
            name: col,
            present: !!columns?.find((c: any) => c.column_name === col)
          }))
        }
      };
    } catch (error) {
      diagnostics.step3 = {
        status: 'failed',
        error: '检查表结构失败',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    // 步骤4: 检查RLS策略
    console.log('步骤4: 检查RLS策略...');
    try {
      const { data: policies, error } = await supabase
        .rpc('get_table_policies', {
          table_name: 'user_profiles',
          schema_name: 'public'
        });

      if (error) {
        diagnostics.step4 = {
          status: 'failed',
          error: error.message,
          details: error
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      diagnostics.step4 = {
        status: 'passed',
        details: {
          policyCount: policies?.length,
          policies: policies?.map((p: any) => ({
            name: p.policy_name,
            command: p.command,
            definition: p.definition
          }))
        }
      };
    } catch (error) {
      diagnostics.step4 = {
        status: 'failed',
        error: '检查RLS策略失败',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    // 步骤5: 测试用户创建
    console.log('步骤5: 测试用户创建...');
    try {
      const testEmail = `test-business-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: false,
        user_metadata: {
          username: 'test_business_user',
          full_name: 'Test Business User',
          user_type: 'free_business'
        }
      });

      if (authError) {
        diagnostics.step5 = {
          status: 'failed',
          error: authError.message,
          details: authError
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      if (!authData.user) {
        diagnostics.step5 = {
          status: 'failed',
          error: '用户创建失败：没有返回用户数据',
          details: authData
        };
        return NextResponse.json({ success: false, diagnostics });
      }

      diagnostics.step5 = {
        status: 'passed',
        details: {
          userId: authData.user.id,
          email: authData.user.email
        }
      };

      // 步骤6: 测试配置文件创建
      console.log('步骤6: 测试配置文件创建...');
      let profile = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!profile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileData && !profileError) {
          profile = profileData;
          break;
        }
        
        attempts++;
        console.log(`配置文件检查尝试 ${attempts}/${maxAttempts} 失败:`, profileError?.message);
      }

      if (!profile) {
        console.log('触发器没有创建配置文件，尝试手动创建...');
        
        const { data: manualProfile, error: manualError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: testEmail,
            username: 'test_business_user',
            full_name: 'Test Business User',
            user_type: 'free_business',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (manualError) {
          diagnostics.step6 = {
            status: 'failed',
            error: manualError.message,
            details: manualError
          };
          return NextResponse.json({ success: false, diagnostics });
        } else {
          profile = manualProfile;
        }
      }

      diagnostics.step6 = {
        status: 'passed',
        details: {
          profileId: profile.id,
          userType: profile.user_type,
          emailVerified: profile.email_verified
        }
      };

      // 步骤7: 测试业务记录创建
      console.log('步骤7: 测试业务记录创建...');
      try {
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .insert({
            owner_id: authData.user.id,
            name: 'Test Business',
            description: 'Test business for diagnostics',
            category: 'restaurant',
            is_verified: false,
            is_active: true
          })
          .select()
          .single();

        if (businessError) {
          diagnostics.step7 = {
            status: 'failed',
            error: businessError.message,
            details: businessError
          };
        } else {
          diagnostics.step7 = {
            status: 'passed',
            details: {
              businessId: businessData.id,
              businessName: businessData.name,
              ownerId: businessData.owner_id
            }
          };
        }
      } catch (businessError) {
        diagnostics.step7 = {
          status: 'failed',
          error: '业务记录创建异常',
          details: businessError
        };
      }

      // 清理测试数据
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.warn('清理测试数据失败:', cleanupError);
      }

    } catch (error) {
      diagnostics.step5 = {
        status: 'failed',
        error: '测试用户创建异常',
        details: error
      };
      return NextResponse.json({ success: false, diagnostics });
    }

    console.log('=== 诊断完成 ===');

    const allPassed = Object.values(diagnostics).every((d: any) => d.status === 'passed');
    
    return NextResponse.json({
      success: allPassed,
      diagnostics,
      summary: allPassed ? 
        '所有检查都通过，business用户注册应该可以正常工作' : 
        '发现问题，请查看具体失败的步骤'
    });

  } catch (error) {
    console.error('诊断过程中发生错误:', error);
    return NextResponse.json({
      success: false,
      error: '诊断过程中发生错误',
      details: error
    }, { status: 500 });
  }
}
