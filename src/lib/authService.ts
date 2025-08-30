import { typedSupabase, typedSupabaseAdmin } from './supabase';
import { emailService } from './emailService';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_level: 'free' | 'essential' | 'premium';
  has_business_features: boolean;
  business_name?: string;
  email_verified: boolean;
  is_active?: boolean;
  verification_status?: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

/**
 * 用户注册 - 使用新的邮件确认流程
 */
export async function registerUser(
  email: string, 
  password: string, 
  userData?: Partial<UserProfile>,
  autoConfirmEmail: boolean = false
): Promise<AuthResult> {
  try {
    console.log('=== 开始用户注册流程 ===');
    console.log('注册参数:', { email, username: userData?.username, full_name: userData?.full_name, subscription_level: userData?.subscription_level });

    // 检查 Supabase 配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase configuration missing, using demo mode');
      // 返回模拟用户数据用于演示
      const mockUser: UserProfile = {
        id: 'demo-user-id',
        email: email,
        username: userData?.username || 'demo_user',
        full_name: userData?.full_name || 'Demo User',
        subscription_level: userData?.subscription_level || 'free',
        has_business_features: userData?.has_business_features || false,
        email_verified: true,
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
    const { data: existingProfile, error: existingError } = await typedSupabaseAdmin
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

    // 创建 Supabase 用户 - 使用管理员API直接创建用户
    const { data: authData, error: authError } = await typedSupabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        username: userData?.username,
        full_name: userData?.full_name,
        subscription_level: userData?.subscription_level || 'free',
        business_name: userData?.business_name
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

    // 🔄 新的逻辑：确保用户完全创建成功后再进行后续操作
    console.log('=== 验证用户创建完整性 ===');
    
    // 1. 验证用户是否真的存在于auth.users表中
    const { data: userCheck, error: userCheckError } = await typedSupabaseAdmin.auth.admin.getUserById(authData.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('用户验证失败:', userCheckError);
      return {
        success: false,
        error: '用户创建验证失败'
      };
    }
    
    console.log('✅ 用户验证成功，用户ID:', userCheck.user.id);

    // 2. 等待并验证用户配置文件创建
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10;

    console.log('等待用户配置文件创建...');
    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileData, error: profileError } = await typedSupabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileData && !profileError) {
        profile = profileData;
        console.log('✅ 用户配置文件创建成功:', profile.id);
        break;
      }
      
      attempts++;
      console.log(`配置文件检查尝试 ${attempts}/${maxAttempts} 失败:`, profileError?.message);
    }

    if (!profile) {
      console.warn('触发器没有创建配置文件，尝试手动创建...');
      
      // 手动创建用户配置文件
      const { data: manualProfile, error: manualError } = await typedSupabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          username: userData?.username,
          full_name: userData?.full_name,
          subscription_level: userData?.subscription_level || 'free',
          has_business_features: userData?.has_business_features || false,
          business_name: userData?.business_name,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (manualError) {
        console.error('手动创建配置文件失败:', manualError);
        return {
          success: false,
          error: '用户配置文件创建失败'
        };
      } else {
        profile = manualProfile;
        console.log('✅ 手动创建配置文件成功:', profile.id);
      }
    }

    // 3. 最终验证：确保用户和配置文件都存在且关联正确
    const { data: finalCheck, error: finalCheckError } = await typedSupabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .eq('email', email)
      .single();

    if (finalCheckError || !finalCheck) {
      console.error('最终验证失败:', finalCheckError);
      return {
        success: false,
        error: '用户数据完整性验证失败'
      };
    }

    console.log('✅ 用户数据完整性验证成功');
    profile = finalCheck;

    // 如果设置为自动确认邮箱，则直接确认
    if (autoConfirmEmail) {
      console.log('自动确认邮箱...');
      const { error: confirmError } = await typedSupabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('自动确认邮箱失败:', confirmError);
      } else {
        // 更新配置文件中的邮箱验证状态
        await typedSupabaseAdmin
          .from('user_profiles')
          .update({ email_verified: true })
          .eq('id', authData.user.id);
        
        profile.email_verified = true;
        console.log('邮箱自动确认成功');
      }
    }

    // 4. 返回成功结果，但不在这里发送邮件
    // 邮件发送将在调用方进行，确保用户创建完全成功后再发送
    console.log('=== 用户注册流程完成 ===');
    console.log('返回用户信息:', {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      subscription_level: profile.subscription_level,
      email_verified: profile.email_verified
    });

    return {
      success: true,
      user: profile
    };

  } catch (error) {
    console.error('注册过程中发生错误:', error);
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
        subscription_level: 'free',
        has_business_features: false,
        email_verified: true,
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
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: '用户配置文件不存在'
      };
    }

    // 检查邮箱是否已验证
    if (!profile.email_verified) {
      return {
        success: false,
        error: '请先验证您的邮箱地址'
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
      .eq('id', authUser.id)
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
    subscription_level: 'free'
  }, true); // 自动确认邮箱
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
