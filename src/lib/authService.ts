import { typedSupabase } from './supabase';
import { emailService } from './emailService';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  user_type: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

/**
 * 用户注册 - 使用标准 Supabase Auth 流程
 */
export async function registerUser(email: string, password: string, userData?: Partial<UserProfile>): Promise<AuthResult> {
  try {
    console.log('=== 开始用户注册流程 ===');
    console.log('注册参数:', { email, username: userData?.username, full_name: userData?.full_name });

    // 检查 Supabase 配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase configuration missing, using demo mode');
      // 返回模拟用户数据用于演示
      const mockUser: UserProfile = {
        id: 'demo-user-id',
        email: email,
        username: userData?.username || 'demo_user',
        full_name: userData?.full_name || 'Demo User',
        user_type: 'customer',
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        user: mockUser
      };
    }

    // 检查邮箱是否已存在
    console.log('检查邮箱是否已存在...');
    const { data: existingProfile, error: existingError } = await typedSupabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('检查现有用户时出错:', existingError);
      return {
        success: false,
        error: '检查用户状态时发生错误'
      };
    }

    if (existingProfile) {
      console.log('邮箱已存在:', existingProfile.id);
      return {
        success: false,
        error: '该邮箱已被注册'
      };
    }

    console.log('邮箱可用，开始创建用户...');

    // 创建 Supabase 用户 - 禁用自动邮件确认，使用我们的自定义邮件服务
    const { data: authData, error: authError } = await typedSupabase.auth.signUp({
      email,
      password,
      options: {
        // 禁用 Supabase 自动邮件确认，我们将手动发送
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          username: userData?.username,
          full_name: userData?.full_name,
          user_type: userData?.user_type || 'customer'
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth 创建用户失败:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      console.error('用户创建失败：没有返回用户数据');
      return {
        success: false,
        error: '用户创建失败'
      };
    }

    console.log('Supabase Auth 用户创建成功:', authData.user.id);

    // 等待数据库触发器创建用户配置文件
    // 在开发环境中，我们可以直接检查配置文件是否创建成功
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10; // 增加重试次数

    console.log('等待用户配置文件创建...');
    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
      
      const { data: profileData, error: profileError } = await typedSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileData && !profileError) {
        profile = profileData;
        console.log('用户配置文件创建成功:', profile.id);
        break;
      }
      
      attempts++;
      console.log(`配置文件检查尝试 ${attempts}/${maxAttempts} 失败:`, profileError?.message);
    }

    if (!profile) {
      console.warn('触发器没有创建配置文件，尝试手动创建...');
      
      // 手动创建用户配置文件
      const { data: manualProfile, error: manualError } = await typedSupabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          username: userData?.username,
          full_name: userData?.full_name,
          user_type: userData?.user_type || 'customer',
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (manualError) {
        console.error('手动创建配置文件失败:', manualError);
        return {
          success: false,
          error: `用户创建成功，但配置文件创建失败: ${manualError.message}`
        };
      }

      profile = manualProfile;
      console.log('手动创建配置文件成功:', profile.id);
    }

    // 发送邮件确认 - 使用我们的自定义邮件服务
    if (authData.user) {
      console.log('=== 开始发送确认邮件 ===');
      console.log('用户ID:', authData.user.id);
      console.log('邮箱:', email);
      console.log('用户名:', userData?.username || '用户');
      
      // 检查邮件服务配置
      console.log('检查邮件服务配置...');
      console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已配置' : '未配置');
      console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
      console.log('EMAIL_CONFIRMATION_URL:', process.env.EMAIL_CONFIRMATION_URL);
      
      let emailSent = false;
      let emailError = null;
      
      // 尝试发送邮件，最多重试3次
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`邮件发送尝试 ${attempt}/3`);
          
          const emailResult = await emailService.sendEmailConfirmation(
            email,
            userData?.username || '用户',
            authData.user.id // 使用用户ID作为确认token
          );
          
          if (emailResult.success) {
            console.log('✅ 确认邮件发送成功');
            emailSent = true;
            break;
          } else {
            console.warn(`❌ 邮件发送失败 (尝试 ${attempt}/3):`, emailResult.error);
            emailError = emailResult.error;
            
            if (attempt < 3) {
              console.log(`等待2秒后重试...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (error) {
          console.error(`❌ 邮件发送异常 (尝试 ${attempt}/3):`, error);
          emailError = error instanceof Error ? error.message : '未知错误';
          
          if (attempt < 3) {
            console.log(`等待2秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!emailSent) {
        console.error('❌ 所有邮件发送尝试都失败了');
        // 邮件发送失败，返回错误信息
        console.log('返回失败状态，因为邮件发送失败');
        return {
          success: false,
          error: `注册成功，但确认邮件发送失败: ${emailError}。请稍后重试或联系客服。`
        };
      }
    }

    console.log('=== 注册流程完成 ===');
    return {
      success: true,
      user: profile
    };

  } catch (error) {
    console.error('用户注册失败:', error);
    return {
      success: false,
      error: '注册过程中发生错误'
    };
  }
}

/**
 * 用户登录
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // 检查 Supabase 配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase configuration missing, using demo mode');
      // 返回模拟用户数据用于演示
      const mockUser: UserProfile = {
        id: 'demo-user-id',
        email: email,
        username: 'demo_user',
        full_name: 'Demo User',
        user_type: 'customer',
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        user: mockUser
      };
    }

    // 使用真实的Supabase Auth登录
    const { data: authData, error: authError } = await typedSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: '登录失败'
      };
    }

    // 获取用户配置文件
    const { data: profile, error: profileError } = await typedSupabase
      .from('user_profiles')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: '用户配置文件不存在'
      };
    }

    return {
      success: true,
      user: profile
    };

  } catch (error) {
    console.error('用户登录失败:', error);
    return {
      success: false,
      error: '登录过程中发生错误'
    };
  }
}

/**
 * 用户登出
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    // 使用真实的Supabase Auth登出

    const { error } = await typedSupabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('用户登出失败:', error);
    return {
      success: false,
      error: '登出过程中发生错误'
    };
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    // 使用真实的Supabase Auth获取当前用户

    const { data: { user: authUser }, error: authError } = await typedSupabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: '用户未登录'
      };
    }

    // 获取用户配置文件
    const { data: profile, error: profileError } = await typedSupabase
      .from('user_profiles')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: '用户配置文件不存在'
      };
    }

    return {
      success: true,
      user: profile
    };

  } catch (error) {
    console.error('获取当前用户失败:', error);
    return {
      success: false,
      error: '获取用户信息失败'
    };
  }
}

/**
 * 更新用户配置文件
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<AuthResult> {
  try {
    const { data: profile, error } = await typedSupabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: profile
    };

  } catch (error) {
    console.error('更新用户配置文件失败:', error);
    return {
      success: false,
      error: '更新用户信息失败'
    };
  }
}

/**
 * 创建测试用户（用于开发）
 */
export async function createTestUser(): Promise<AuthResult> {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  return await registerUser(testEmail, testPassword, {
    username: 'testuser',
    full_name: 'Test User',
    user_type: 'customer'
  });
}

/**
 * 检查用户会话状态
 */
export async function checkSession(): Promise<{ isAuthenticated: boolean; user?: UserProfile }> {
  try {
    const { data: { session }, error } = await typedSupabase.auth.getSession();
    
    if (error || !session) {
      return { isAuthenticated: false };
    }

    // 获取用户配置文件
    const { data: profile } = await typedSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      isAuthenticated: true,
      user: profile || undefined
    };

  } catch (error) {
    console.error('检查会话状态失败:', error);
    return { isAuthenticated: false };
  }
}
