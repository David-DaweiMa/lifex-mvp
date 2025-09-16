import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, UserProfile } from '../lib/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // 初始化认证服务
      await authService.initialize();
      
      // 尝试从缓存加载用户资料
      const cachedUser = await authService.loadCachedProfile();
      if (cachedUser) {
        setUser(cachedUser);
      }
      
      // 检查当前用户
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // 监听认证状态变化
      const { data: { subscription } } = authService.onAuthStateChange((user) => {
        setUser(user);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const result = await authService.register({ email, password, ...userData });
      if (result.success && result.user) {
        setUser(result.user);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const result = await authService.logout();
      if (result.success) {
        setUser(null);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Logout failed. Please try again.' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const result = await authService.updateProfile(updates);
      if (result.success && result.user) {
        setUser(result.user);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
