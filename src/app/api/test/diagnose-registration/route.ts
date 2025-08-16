import { NextRequest, NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';
import { emailService } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

// 创建服务角色客户端，用于绕过 RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name } = body;

    console.log('=== 开始注册流程诊断 ===');
    console.log('诊断参数:', { email, username, full_name });

    const diagnosis = {
      steps: [] as any[],
      errors: [] as string[],
      warnings: [] as string[],
      success: false,
      finalResult: null as any
    };

    // 步骤1: 检查环境变量
    console.log('步骤1: 检查环境变量');
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      emailConfirmationUrl: process.env.EMAIL_CONFIRMATION_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    };

    diagnosis.steps.push({
      step: 1,
      name: '环境变量检查',
      status: 'completed',
      details: envCheck
    });

    if (!envCheck.supabaseUrl || !envCheck.supabaseAnonKey) {
      diagnosis.errors.push('Supabase 配置缺失');
    }
    if (!envCheck.resendApiKey) {
      diagnosis.errors.push('Resend API Key 未配置');
    }
    if (!envCheck.resendFromEmail) {
      diagnosis.warnings.push('发件人邮箱未配置');
    }

    // 步骤2: 检查邮件服务初始化
    console.log('步骤2: 检查邮件服务初始化');
    const emailServiceStatus = {
      resendInitialized: !!emailService['resend'],
      fromEmail: emailService['fromEmail'],
    };

    diagnosis.steps.push({
      step: 2,
      name: '邮件服务初始化',
      status: emailServiceStatus.resendInitialized ? 'success' : 'failed',
      details: emailServiceStatus
    });

    if (!emailServiceStatus.resendInitialized) {
      diagnosis.errors.push('邮件服务初始化失败');
    }

    // 步骤3: 检查邮箱是否已存在
    console.log('步骤3: 检查邮箱是否已存在');
    try {
      const { data: existingProfile, error: existingError } = await typedSupabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      const emailExists = !!existingProfile;
      diagnosis.steps.push({
        step: 3,
        name: '邮箱存在性检查',
        status: 'completed',
        details: {
          emailExists,
          error: existingError?.message
        }
      });

      if (emailExists) {
        diagnosis.errors.push('邮箱已存在');
        return NextResponse.json({
          success: false,
          error: '该邮箱已被注册',
          diagnosis
        });
      }
    } catch (error) {
      diagnosis.steps.push({
        step: 3,
        name: '邮箱存在性检查',
        status: 'error',
        details: { error: error instanceof Error ? error.message : '未知错误' }
      });
      diagnosis.errors.push('邮箱检查失败');
    }

    // 步骤4: 创建 Supabase Auth 用户
    console.log('步骤4: 创建 Supabase Auth 用户');
    try {
      const { data: authData, error: authError } = await typedSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          data: {
            username: username,
            full_name: full_name,
            user_type: 'customer'
          }
        }
      });

      diagnosis.steps.push({
        step: 4,
        name: 'Supabase Auth 用户创建',
        status: authError ? 'failed' : 'success',
        details: {
          userId: authData?.user?.id,
          error: authError?.message
        }
      });

      if (authError) {
        diagnosis.errors.push(`Auth 用户创建失败: ${authError.message}`);
        return NextResponse.json({
          success: false,
          error: authError.message,
          diagnosis
        });
      }

      if (!authData.user) {
        diagnosis.errors.push('Auth 用户创建失败：没有返回用户数据');
        return NextResponse.json({
          success: false,
          error: '用户创建失败',
          diagnosis
        });
      }

      // 步骤5: 等待用户配置文件创建
      console.log('步骤5: 等待用户配置文件创建');
      let profile = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!profile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profileData, error: profileError } = await typedSupabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileData && !profileError) {
          profile = profileData;
          break;
        }
        
        attempts++;
      }

      diagnosis.steps.push({
        step: 5,
        name: '用户配置文件创建',
        status: profile ? 'success' : 'failed',
        details: {
          profileCreated: !!profile,
          attempts,
          maxAttempts,
          profileId: profile?.id
        }
      });

      if (!profile) {
        diagnosis.warnings.push('触发器没有创建配置文件，尝试手动创建');
        
        // 手动创建配置文件（使用服务角色客户端绕过 RLS）
        const { data: manualProfile, error: manualError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: email,
            username: username,
            full_name: full_name,
            user_type: 'customer',
            is_verified: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        diagnosis.steps.push({
          step: 5.1,
          name: '手动创建配置文件',
          status: manualError ? 'failed' : 'success',
          details: {
            error: manualError?.message,
            profileId: manualProfile?.id
          }
        });

        if (manualError) {
          diagnosis.errors.push(`手动创建配置文件失败: ${manualError.message}`);
          return NextResponse.json({
            success: false,
            error: `用户创建成功，但配置文件创建失败: ${manualError.message}`,
            diagnosis
          });
        }

        profile = manualProfile;
      }

      // 步骤6: 测试邮件发送
      console.log('步骤6: 测试邮件发送');
      const testToken = `diagnose-token-${Date.now()}`;
      
      try {
        const emailResult = await emailService.sendEmailConfirmation(
          email,
          username || '用户',
          testToken
        );

        diagnosis.steps.push({
          step: 6,
          name: '邮件发送测试',
          status: emailResult.success ? 'success' : 'failed',
          details: {
            success: emailResult.success,
            error: emailResult.error
          }
        });

        if (!emailResult.success) {
          diagnosis.errors.push(`邮件发送失败: ${emailResult.error}`);
        }
      } catch (error) {
        diagnosis.steps.push({
          step: 6,
          name: '邮件发送测试',
          status: 'error',
          details: {
            error: error instanceof Error ? error.message : '未知错误'
          }
        });
        diagnosis.errors.push(`邮件发送异常: ${error instanceof Error ? error.message : '未知错误'}`);
      }

      // 最终结果
      diagnosis.success = diagnosis.errors.length === 0;
      diagnosis.finalResult = {
        userCreated: !!authData.user,
        profileCreated: !!profile,
        emailSent: diagnosis.steps.find(s => s.name === '邮件发送测试')?.status === 'success',
        userId: authData.user?.id,
        profileId: profile?.id
      };

    } catch (error) {
      diagnosis.steps.push({
        step: 4,
        name: 'Supabase Auth 用户创建',
        status: 'error',
        details: { error: error instanceof Error ? error.message : '未知错误' }
      });
      diagnosis.errors.push(`注册流程异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    console.log('=== 注册流程诊断完成 ===');
    console.log('诊断结果:', diagnosis);

    return NextResponse.json({
      success: diagnosis.success,
      error: diagnosis.errors.length > 0 ? diagnosis.errors.join('; ') : null,
      diagnosis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('注册流程诊断失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '注册流程诊断失败: ' + (error instanceof Error ? error.message : '未知错误'),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
