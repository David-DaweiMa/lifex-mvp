# 用户注册邮件确认问题完整分析

## 🔍 问题描述

### 核心问题
- 生产环境中用户注册后，`email_confirmations` 表为空
- 邮件可以发送，但Token无法保存到数据库
- 用户无法通过邮件链接确认邮箱
- 前端显示"User not allowed"错误

### 问题表现
1. 用户注册成功，`auth.users` 表有记录
2. 用户配置文件 `user_profiles` 表有记录
3. 但 `email_confirmations` 表为空
4. 邮件发送失败或Token验证失败

## 📁 相关代码文件

### 1. 数据库配置
**文件**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 类型化的匿名客户端（用于前端）
export const typedSupabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 类型化的服务角色客户端（用于后端API）
export const typedSupabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);
```

### 2. 用户注册服务
**文件**: `src/lib/authService.ts`

```typescript
import { typedSupabase, typedSupabaseAdmin } from './supabase';
import { emailService } from './emailService';

export async function registerUser(
  email: string, 
  password: string, 
  userData?: Partial<UserProfile>,
  autoConfirmEmail: boolean = false
): Promise<AuthResult> {
  try {
    console.log('=== 开始用户注册流程 ===');
    
    // 检查邮箱是否已存在
    const { data: existingProfile, error: existingError } = await typedSupabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return {
        success: false,
        error: '该邮箱已被注册'
      };
    }

    // 创建 Supabase 用户 - 使用管理员API直接创建用户
    const { data: authData, error: authError } = await typedSupabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        username: userData?.username,
        full_name: userData?.full_name,
        user_type: userData?.user_type || 'free'
      }
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || '用户创建失败'
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
          user_type: userData?.user_type || 'free',
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
      user_type: profile.user_type,
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
```

### 3. 注册API路由
**文件**: `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/authService';
import { sendEmailVerification } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, full_name, user_type } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 验证用户类型
    const validUserTypes = ['free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business'];
    const selectedUserType = user_type || 'free';
    
    if (!validUserTypes.includes(selectedUserType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // 检查邮箱状态
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('id, email_verified, created_at')
      .eq('email', email)
      .single();

    if (existingProfile) {
      if (existingProfile.email_verified) {
        return NextResponse.json(
          { error: '该邮箱已被注册并验证，请直接登录' },
          { status: 400 }
        );
      } else {
        // 检查是否在24小时内
        const hoursSinceCreation = (Date.now() - new Date(existingProfile.created_at).getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCreation < 24) {
          return NextResponse.json(
            { 
              error: '该邮箱已在24小时内注册，请检查您的邮箱并点击确认链接，或等待24小时后重新注册',
              canResendEmail: true,
              email: email
            },
            { status: 400 }
          );
        } else {
          // 超过24小时，删除旧记录
          console.log('超过24小时，删除旧记录并重新注册');
          await supabase.auth.admin.deleteUser(existingProfile.id);
        }
      }
    }

    // 🔄 新的逻辑：先确保用户完全创建成功
    console.log('=== 开始用户注册流程 ===');
    
    // 注册用户（不自动确认邮箱）
    const result = await registerUser(email, password, {
      username,
      full_name,
      user_type: selectedUserType
    }, false); // 不自动确认邮箱

    if (!result.success || !result.user) {
      console.error('用户注册失败:', result.error);
      return NextResponse.json(
        { error: result.error || 'User registration failed' },
        { status: 400 }
      );
    }

    console.log('✅ 用户注册成功，用户ID:', result.user.id);

    // 🔄 验证用户创建完整性
    console.log('=== 验证用户创建完整性 ===');
    
    // 1. 再次验证用户是否真的存在
    const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(result.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('用户验证失败:', userCheckError);
      return NextResponse.json(
        { error: '用户创建验证失败' },
        { status: 500 }
      );
    }
    
    console.log('✅ 用户验证成功');

    // 2. 验证用户配置文件是否存在
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', result.user.id)
      .single();

    if (profileCheckError || !profileCheck) {
      console.error('用户配置文件验证失败:', profileCheckError);
      return NextResponse.json(
        { error: '用户配置文件验证失败' },
        { status: 500 }
      );
    }
    
    console.log('✅ 用户配置文件验证成功');

    // 3. 现在可以安全地发送邮件确认
    console.log('=== 开始发送邮件确认 ===');
    
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailResult = await sendEmailVerification(email, result.user.id, selectedUserType);
      
      if (emailResult.success) {
        emailSent = true;
        console.log('✅ 邮件发送成功');
      } else {
        emailError = emailResult.error;
        console.error('❌ 邮件发送失败:', emailResult.error);
        
        // 如果是频率限制错误，记录但不阻止注册
        if (emailResult.rateLimited) {
          console.log('⚠️ 邮件发送频率限制，用户需要稍后手动请求重新发送');
        }
      }
    } catch (emailError) {
      console.error('❌ 邮件发送异常:', emailError);
      emailError = '邮件发送失败';
    }

    // 无论邮件是否发送成功，注册都算成功
    // 因为用户已经成功创建，邮件发送失败不影响用户注册
    console.log('=== 注册流程完成 ===');
    
    return NextResponse.json({
      success: true,
      user: result.user,
      message: emailSent 
        ? '注册成功！请检查您的邮箱并点击确认链接完成验证。'
        : '注册成功！但邮件发送失败，请稍后手动请求重新发送确认邮件。',
      requiresEmailVerification: true,
      emailSent: emailSent,
      emailError: emailError,
      expiresInHours: 24
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. 邮件服务
**文件**: `src/lib/emailService.ts`

```typescript
import { typedSupabaseAdmin } from './supabase';

export async function sendEmailVerification(
  email: string, 
  userId: string, 
  userType: string = 'free'
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
  try {
    console.log('=== 开始发送邮件验证 ===');
    console.log('邮箱:', email);
    console.log('用户ID:', userId);
    console.log('用户类型:', userType);

    // 检查邮件服务配置
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error('邮件服务配置缺失');
      return {
        success: false,
        error: '邮件服务配置缺失'
      };
    }

    // 生成确认Token
    const confirmationToken = crypto.randomUUID();
    console.log('生成的Token:', confirmationToken);

    // 保存Token到数据库
    console.log('保存Token到数据库...');
    const { data: saveData, error: saveError } = await typedSupabaseAdmin
      .from('email_confirmations')
      .insert({
        user_id: userId,
        email: email,
        token: confirmationToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();

    if (saveError) {
      console.error('Token保存失败:', saveError);
      return {
        success: false,
        error: `Token保存失败: ${saveError.message}`
      };
    }

    console.log('✅ Token保存成功:', saveData);

    // 构建确认链接
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/auth/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('确认链接:', confirmUrl);

    // 发送邮件
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'LifeX - 确认您的邮箱地址',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">欢迎加入 LifeX！</h2>
          <p>感谢您注册 LifeX 账户。请点击下面的链接确认您的邮箱地址：</p>
          <p style="margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              确认邮箱地址
            </a>
          </p>
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
          <p>此链接将在24小时后过期。</p>
          <p>如果您没有注册 LifeX 账户，请忽略此邮件。</p>
        </div>
      `
    });

    if (emailError) {
      console.error('邮件发送失败:', emailError);
      
      // 检查是否是频率限制错误
      if (emailError.message?.includes('rate limit') || emailError.message?.includes('too many requests')) {
        return {
          success: false,
          error: '邮件发送频率限制，请稍后重试',
          rateLimited: true
        };
      }
      
      return {
        success: false,
        error: `邮件发送失败: ${emailError.message}`
      };
    }

    console.log('✅ 邮件发送成功:', emailData);
    return { success: true };

  } catch (error) {
    console.error('邮件发送过程中发生错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}
```

## 🗄️ 数据库表结构

### 1. auth.users (Supabase Auth)
```sql
-- 这是Supabase自动管理的表，包含用户认证信息
-- 主要字段：
-- id: uuid (主键)
-- email: text
-- encrypted_password: text
-- email_confirmed_at: timestamp
-- created_at: timestamp
-- updated_at: timestamp
-- user_metadata: jsonb
```

### 2. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  location JSONB,
  bio TEXT,
  website TEXT,
  social_links JSONB,
  user_type TEXT NOT NULL DEFAULT 'free' CHECK (user_type IN ('guest', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 触发器：当auth.users表插入新用户时，自动创建user_profiles记录
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, user_type, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'free'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
```

### 3. email_confirmations
```sql
CREATE TABLE email_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_email_confirmations_token ON email_confirmations(token);
CREATE INDEX idx_email_confirmations_user_id ON email_confirmations(user_id);
CREATE INDEX idx_email_confirmations_email ON email_confirmations(email);
```

## 🔧 环境变量配置

### 必需的环境变量
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 邮件服务配置
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🐛 已知问题和解决方案

### 1. "User not allowed" 错误
**原因**: 使用了匿名客户端执行管理员操作
**解决方案**: 使用 `typedSupabaseAdmin` 替代 `typedSupabase`

### 2. Token保存失败
**原因**: 外键约束违反或权限问题
**解决方案**: 确保用户完全创建成功后再保存Token

### 3. 邮件发送失败
**原因**: Resend API配置问题或频率限制
**解决方案**: 检查环境变量和API密钥

### 4. 时序问题
**原因**: 用户创建和Token保存之间的竞争条件
**解决方案**: 添加多层验证机制

## 📊 测试结果

### 本地测试
```
✅ 用户创建和验证流程正常
✅ 用户配置文件创建正常
✅ Email Confirmation记录创建正常
✅ 逻辑验证：用户创建成功后才创建Token记录
```

### 生产环境问题
- 环境变量配置正确
- Supabase连接正常
- 数据库权限正常
- 但Token仍然无法保存

## 🔍 诊断建议

1. **检查Vercel函数日志** - 查看具体的错误信息
2. **验证环境变量** - 确认生产环境变量正确设置
3. **检查数据库权限** - 确认RLS策略和权限设置
4. **测试API端点** - 直接调用注册API查看响应
5. **检查网络连接** - 确认Vercel到Supabase的连接

## 📋 下一步行动

1. 查看Vercel函数日志获取详细错误信息
2. 检查生产环境的环境变量配置
3. 验证Supabase项目的权限设置
4. 测试数据库连接和权限
5. 检查RLS策略是否正确配置
