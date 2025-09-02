// 注意：这是共享包的authService，需要根据具体平台进行调整

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

export interface AuthService {
  // 用户注册
  registerUser(
    email: string, 
    password: string, 
    userData?: Partial<UserProfile>,
    autoConfirmEmail?: boolean
  ): Promise<AuthResult>;

  // 用户登录
  loginUser(email: string, password: string): Promise<AuthResult>;

  // 用户登出
  logoutUser(): Promise<{ success: boolean; error?: string }>;

  // 获取当前用户
  getCurrentUser(): Promise<AuthResult>;

  // 更新用户配置文件
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResult>;

  // 检查用户会话状态
  checkSession(): Promise<{ isAuthenticated: boolean; user?: UserProfile }>;

  // 发送邮件确认
  sendEmailConfirmation(email: string): Promise<{ success: boolean; error?: string }>;

  // 确认邮件
  confirmEmail(token: string): Promise<{ success: boolean; error?: string }>;

  // 重置密码
  resetPassword(email: string): Promise<{ success: boolean; error?: string }>;

  // 更新密码
  updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }>;
}

// 抽象基类，提供通用的认证逻辑
export abstract class BaseAuthService implements AuthService {
  abstract registerUser(
    email: string, 
    password: string, 
    userData?: Partial<UserProfile>,
    autoConfirmEmail?: boolean
  ): Promise<AuthResult>;

  abstract loginUser(email: string, password: string): Promise<AuthResult>;

  abstract logoutUser(): Promise<{ success: boolean; error?: string }>;

  abstract getCurrentUser(): Promise<AuthResult>;

  abstract updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResult>;

  abstract checkSession(): Promise<{ isAuthenticated: boolean; user?: UserProfile }>;

  abstract sendEmailConfirmation(email: string): Promise<{ success: boolean; error?: string }>;

  abstract confirmEmail(token: string): Promise<{ success: boolean; error?: string }>;

  abstract resetPassword(email: string): Promise<{ success: boolean; error?: string }>;

  abstract updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }>;

  // 通用的用户验证逻辑
  protected validateUserProfile(profile: any): profile is UserProfile {
    return profile && 
           typeof profile.id === 'string' && 
           typeof profile.email === 'string' &&
           typeof profile.subscription_level === 'string';
  }

  // 通用的错误处理
  protected handleError(error: any, context: string): AuthResult {
    console.error(`${context} 失败:`, error);
    return {
      success: false,
      error: error?.message || '操作失败'
    };
  }

  // 通用的成功响应
  protected createSuccessResult(user: UserProfile): AuthResult {
    return {
      success: true,
      user
    };
  }
}
