import { BaseAuthService, UserProfile, AuthResult } from '@lifex/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export class MobileAuthService extends BaseAuthService {
  private storageKey = '@lifex_auth';
  private userCacheKey = '@lifex_user_cache';

  async registerUser(
    email: string, 
    password: string, 
    userData?: Partial<UserProfile>,
    autoConfirmEmail?: boolean
  ): Promise<AuthResult> {
    try {
      // 使用Supabase进行真实用户注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData?.username || email.split('@')[0],
            full_name: userData?.full_name,
            business_name: userData?.business_name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // 创建用户配置文件
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          username: userData?.username || email.split('@')[0],
          full_name: userData?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          subscription_level: 'free',
          has_business_features: false,
          business_name: userData?.business_name,
          email_verified: data.user.email_confirmed_at ? true : false,
          is_active: true,
          verification_status: 'none',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at
        };

        // 保存到本地缓存
        await this.saveUserToCache(userProfile);
        
        // 保存到本地存储（用于离线访问）
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(userProfile));

        return { success: true, user: userProfile };
      }

      return { success: false, error: '注册失败，请重试' };
    } catch (error: any) {
      console.error('注册失败:', error);
      return { success: false, error: error.message || '注册失败' };
    }
  }

  async loginUser(email: string, password: string): Promise<AuthResult> {
    try {
      // 使用Supabase进行真实用户登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user && data.session) {
        // 获取用户完整信息
        const userProfile = await this.getUserProfileFromSupabase(data.user.id);
        
        if (userProfile) {
          // 保存到本地缓存
          await this.saveUserToCache(userProfile);
          
          // 保存到本地存储
          await AsyncStorage.setItem(this.storageKey, JSON.stringify(userProfile));
          
          // 保存session信息
          await AsyncStorage.setItem('@lifex_session', JSON.stringify(data.session));

          return { success: true, user: userProfile };
        } else {
          // 如果用户配置文件不存在，创建一个默认的
          const defaultProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || email.split('@')[0],
            full_name: data.user.user_metadata?.full_name,
            avatar_url: data.user.user_metadata?.avatar_url,
            subscription_level: 'free',
            has_business_features: false,
            business_name: data.user.user_metadata?.business_name,
            email_verified: data.user.email_confirmed_at ? true : false,
            is_active: true,
            verification_status: 'none',
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at
          };

          // 保存到本地
          await this.saveUserToCache(defaultProfile);
          await AsyncStorage.setItem(this.storageKey, JSON.stringify(defaultProfile));
          await AsyncStorage.setItem('@lifex_session', JSON.stringify(data.session));

          return { success: true, user: defaultProfile };
        }
      }

      return { success: false, error: '登录失败，请重试' };
    } catch (error: any) {
      console.error('登录失败:', error);
      return { success: false, error: error.message || '登录失败' };
    }
  }

  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      // 使用Supabase登出
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 清除本地存储
      await AsyncStorage.multiRemove([
        this.storageKey,
        this.userCacheKey,
        '@lifex_session'
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('登出失败:', error);
      return { success: false, error: error.message || '登出失败' };
    }
  }

  async getCurrentUser(): Promise<AuthResult> {
    try {
      // 首先尝试从Supabase获取当前session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        // 从缓存获取用户信息
        const cachedUser = await this.getUserFromCache();
        if (cachedUser && cachedUser.id === session.user.id) {
          return { success: true, user: cachedUser };
        }

        // 缓存过期，从Supabase重新获取
        const userProfile = await this.getUserProfileFromSupabase(session.user.id);
        if (userProfile) {
          await this.saveUserToCache(userProfile);
          await AsyncStorage.setItem(this.storageKey, JSON.stringify(userProfile));
          return { success: true, user: userProfile };
        }
      }

      // 如果没有活跃session，尝试从本地存储获取
      const localUser = await AsyncStorage.getItem(this.storageKey);
      if (localUser) {
        const user = JSON.parse(localUser) as UserProfile;
        return { success: true, user };
      }

      return { success: true, user: undefined };
    } catch (error: any) {
      console.error('获取当前用户失败:', error);
      return { success: false, error: error.message || '获取用户信息失败' };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResult> {
    try {
      // 更新Supabase中的用户元数据
      const { error } = await supabase.auth.updateUser({
        data: {
          username: updates.username,
          full_name: updates.full_name,
          business_name: updates.business_name,
          avatar_url: updates.avatar_url
        }
      });

      if (error) throw error;

      // 获取当前用户信息
      const currentUser = await this.getCurrentUser();
      if (!currentUser.success || !currentUser.user) {
        return { success: false, error: '用户未登录' };
      }

      // 更新本地用户信息
      const updatedUser = { ...currentUser.user, ...updates, updated_at: new Date().toISOString() };
      
      // 保存到本地
      await this.saveUserToCache(updatedUser);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      return { success: false, error: error.message || '更新用户信息失败' };
    }
  }

  async checkSession(): Promise<{ isAuthenticated: boolean; user?: UserProfile }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userProfile = await this.getUserProfileFromSupabase(session.user.id);
        if (userProfile) {
          return { isAuthenticated: true, user: userProfile };
        }
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('检查会话失败:', error);
      return { isAuthenticated: false };
    }
  }

  async sendEmailConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('发送邮件确认失败:', error);
      return { success: false, error: error.message || '发送邮件确认失败' };
    }
  }

  async confirmEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 注意：Supabase的邮件确认通常通过URL回调处理
      // 这里我们只是验证token的有效性
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('邮件确认失败:', error);
      return { success: false, error: error.message || '邮件确认失败' };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('密码重置失败:', error);
      return { success: false, error: error.message || '密码重置失败' };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('密码更新失败:', error);
      return { success: false, error: error.message || '密码更新失败' };
    }
  }

  // 私有辅助方法
  private async saveUserToCache(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem(this.userCacheKey, JSON.stringify(user));
  }

  private async getUserFromCache(): Promise<UserProfile | null> {
    try {
      const cached = await AsyncStorage.getItem(this.userCacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private async getUserProfileFromSupabase(userId: string): Promise<UserProfile | null> {
    try {
      // 从Supabase的users表获取用户信息
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('从Supabase获取用户信息失败，可能用户表不存在:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('获取用户配置文件失败:', error);
      return null;
    }
  }
}

// 导出单例实例
export const mobileAuthService = new MobileAuthService();

// 导出兼容性函数
export const registerUser = mobileAuthService.registerUser.bind(mobileAuthService);
export const loginUser = mobileAuthService.loginUser.bind(mobileAuthService);
export const logoutUser = mobileAuthService.logoutUser.bind(mobileAuthService);
export const getCurrentUser = mobileAuthService.getCurrentUser.bind(mobileAuthService);
export const updateUserProfile = mobileAuthService.updateUserProfile.bind(mobileAuthService);
export const checkSession = mobileAuthService.checkSession.bind(mobileAuthService);
export const sendEmailConfirmation = mobileAuthService.sendEmailConfirmation.bind(mobileAuthService);
export const confirmEmail = mobileAuthService.confirmEmail.bind(mobileAuthService);
export const resetPassword = mobileAuthService.resetPassword.bind(mobileAuthService);
export const updatePassword = mobileAuthService.updatePassword.bind(mobileAuthService);
