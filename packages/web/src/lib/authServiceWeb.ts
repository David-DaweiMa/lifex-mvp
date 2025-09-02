import { typedSupabase, typedSupabaseAdmin } from './supabase';
import { emailService } from './emailService';
import { BaseAuthService, UserProfile, AuthResult } from '@lifex/shared';

/**
 * Web端的认证服务实现
 * 继承自共享包的BaseAuthService，提供具体的web实现
 */
export class WebAuthService extends BaseAuthService {
  
  /**
   * 用户注册 - 使用新的邮件确认流程
   */
  async registerUser(
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
        return this.createSuccessResult(mockUser);
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

      // 验证用户创建完整性
      const profile = await this.waitForUserProfile(authData.user.id, email, userData);
      if (!profile) {
        return {
          success: false,
          error: '用户配置文件创建失败'
        };
      }

      // 发送邮件确认
      if (!autoConfirmEmail) {
        await this.sendEmailConfirmation(email);
      }

      console.log('=== 用户注册流程完成 ===');
      return this.createSuccessResult(profile);

    } catch (error) {
      return this.handleError(error, '用户注册');
    }
  }

  /**
   * 用户登录
   */
  async loginUser(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await typedSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: '登录失败'
        };
      }

      // 获取用户配置文件
      const { data: profile, error: profileError } = await typedSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: '获取用户信息失败'
        };
      }

      return this.createSuccessResult(profile);

    } catch (error) {
      return this.handleError(error, '用户登录');
    }
  }

  /**
   * 用户登出
   */
  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await typedSupabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      return this.handleError(error, '用户登出');
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data: { user }, error } = await typedSupabase.auth.getUser();
      
      if (error || !user) {
        return {
          success: false,
          error: '用户未登录'
        };
      }

      // 获取用户配置文件
      const { data: profile, error: profileError } = await typedSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: '用户配置文件不存在'
        };
      }

      return this.createSuccessResult(profile);

    } catch (error) {
      return this.handleError(error, '获取当前用户');
    }
  }

  /**
   * 更新用户配置文件
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResult> {
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

      return this.createSuccessResult(profile);

    } catch (error) {
      return this.handleError(error, '更新用户配置文件');
    }
  }

  /**
   * 检查用户会话状态
   */
  async checkSession(): Promise<{ isAuthenticated: boolean; user?: UserProfile }> {
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

  /**
   * 发送邮件确认
   */
  async sendEmailConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 生成确认token和用户名
      const confirmationToken = this.generateRandomToken();
      const username = email.split('@')[0]; // 使用邮箱前缀作为用户名
      
      const result = await emailService.sendEmailConfirmation(
        email, 
        username, 
        confirmationToken, 
        'free' // 默认用户类型
      );
      return result;
    } catch (error) {
      return this.handleError(error, '发送邮件确认');
    }
  }

  /**
   * 确认邮件
   */
  async confirmEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: 实现邮件确认逻辑
      // 这里需要根据token验证并确认用户邮箱
      console.log('确认邮件功能待实现，token:', token);
      return { success: true, error: '邮件确认功能待实现' };
    } catch (error) {
      return this.handleError(error, '确认邮件');
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: 实现密码重置逻辑
      // 这里需要发送密码重置邮件
      console.log('密码重置功能待实现，email:', email);
      return { success: true, error: '密码重置功能待实现' };
    } catch (error) {
      return this.handleError(error, '重置密码');
    }
  }

  /**
   * 更新密码
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await typedSupabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      return this.handleError(error, '更新密码');
    }
  }

  // 私有辅助方法
  private async waitForUserProfile(
    userId: string, 
    email: string, 
    userData?: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10;

    console.log('等待用户配置文件创建...');
    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileData, error: profileError } = await typedSupabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
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
          id: userId,
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
        return null;
      } else {
        profile = manualProfile;
        console.log('✅ 手动创建配置文件成功:', profile.id);
      }
    }

    return profile;
  }

  // 生成随机token的辅助方法
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// 导出单例实例
export const webAuthService = new WebAuthService();

// 为了向后兼容，也导出原来的函数
export const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  checkSession,
  sendEmailConfirmation,
  confirmEmail,
  resetPassword,
  updatePassword
} = webAuthService;
