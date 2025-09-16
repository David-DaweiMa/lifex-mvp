import { supabase, UserProfile } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

class AuthService {
  private currentUser: UserProfile | null = null;

  // 初始化认证状态
  async initialize(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  // 用户登录
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userProfile = await this.loadUserProfile(data.user.id);
        if (userProfile) {
          this.currentUser = userProfile;
          return { success: true, user: userProfile };
        }
      }

      return { success: false, error: 'Failed to load user profile' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // 用户注册
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
            username: registerData.username,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: registerData.email,
            full_name: registerData.fullName,
            username: registerData.username,
            subscription_level: 'free',
            email_verified: false,
            is_active: true,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { success: false, error: 'Account created but profile setup failed' };
        }

        const userProfile = await this.loadUserProfile(data.user.id);
        if (userProfile) {
          this.currentUser = userProfile;
          return { success: true, user: userProfile };
        }
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // 用户登出
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }

      this.currentUser = null;
      await AsyncStorage.removeItem('user_profile');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // 更新用户资料
  async updateProfile(updates: Partial<UserProfile>): Promise<AuthResponse> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // 重新加载用户资料
      const updatedProfile = await this.loadUserProfile(this.currentUser.id);
      if (updatedProfile) {
        this.currentUser = updatedProfile;
        return { success: true, user: updatedProfile };
      }

      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  // 检查当前用户
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !this.currentUser) {
        await this.loadUserProfile(user.id);
      }
      return this.currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // 检查登录状态
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // 加载用户资料
  private async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Load user profile error:', error);
        return null;
      }

      // 缓存用户资料
      await AsyncStorage.setItem('user_profile', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Load user profile error:', error);
      return null;
    }
  }

  // 从缓存加载用户资料
  async loadCachedProfile(): Promise<UserProfile | null> {
    try {
      const cachedProfile = await AsyncStorage.getItem('user_profile');
      if (cachedProfile) {
        this.currentUser = JSON.parse(cachedProfile);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Load cached profile error:', error);
      return null;
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await this.loadUserProfile(session.user.id);
        this.currentUser = userProfile;
        callback(userProfile);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }
}

// 创建单例实例
export const authService = new AuthService();
