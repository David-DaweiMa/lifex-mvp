# Supabase客户端配置问题分析

## 🔍 发现的问题

### 根本原因
`src/lib/supabase.ts` 中的 `typedSupabase` 客户端使用的是**匿名密钥**，而不是**服务角色密钥**。

### 问题详情
```typescript
// 当前配置（有问题）
export const typedSupabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'  // 使用匿名密钥
);
```

### 影响
1. **Token保存失败** - 匿名用户无法插入数据到 `email_confirmations` 表
2. **RLS策略阻止** - 匿名用户被RLS策略阻止执行插入操作
3. **邮件发送失败** - 因为token没有保存，邮件发送流程中断

## 🛠️ 解决方案

### 方案1: 创建服务角色客户端（推荐）

在 `src/lib/supabase.ts` 中添加服务角色客户端：

```typescript
// 现有的匿名客户端（用于前端）
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 新增服务角色客户端（用于后端API）
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

// 类型化的匿名客户端
export const typedSupabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 类型化的服务角色客户端
export const typedSupabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);
```

### 方案2: 修改邮件服务使用服务角色客户端

在 `src/lib/emailService.ts` 中：

```typescript
// 修改前
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 修改后
import { typedSupabaseAdmin } from './supabase';

// 在 sendEmailVerification 函数中使用
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
```

### 方案3: 修改认证服务使用服务角色客户端

在 `src/lib/authService.ts` 中：

```typescript
// 导入服务角色客户端
import { typedSupabaseAdmin } from './supabase';

// 在需要绕过RLS的地方使用服务角色客户端
const { data: profileData, error: profileError } = await typedSupabaseAdmin
  .from('user_profiles')
  .select('*')
  .eq('id', authData.user.id)
  .single();
```

## 📋 实施步骤

### 1. 修改 supabase.ts
```typescript
// 添加服务角色客户端
export const typedSupabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);
```

### 2. 修改 emailService.ts
```typescript
import { typedSupabaseAdmin } from './supabase';

// 在 sendEmailVerification 函数中使用 typedSupabaseAdmin
```

### 3. 修改 authService.ts
```typescript
import { typedSupabaseAdmin } from './supabase';

// 在需要绕过RLS的地方使用 typedSupabaseAdmin
```

### 4. 测试修复
```bash
# 运行测试脚本验证修复
node debug-api-routes.js
```

## 🔒 安全考虑

### 服务角色密钥使用原则
1. **只在服务器端使用** - 不要在前端代码中使用服务角色密钥
2. **最小权限原则** - 只在必要时使用服务角色客户端
3. **环境变量保护** - 确保服务角色密钥不会暴露到客户端

### 使用场景
- **匿名客户端**: 用户登录、注册、查询自己的数据
- **服务角色客户端**: 邮件发送、管理员操作、绕过RLS的操作

## 🧪 验证修复

### 测试步骤
1. 修改代码使用服务角色客户端
2. 运行测试脚本验证token保存
3. 测试完整的注册流程
4. 验证邮件发送功能

### 预期结果
- ✅ Token可以成功保存到数据库
- ✅ 邮件发送功能正常工作
- ✅ 用户注册流程完整
- ✅ 邮件确认链接有效

## 📝 注意事项

1. **环境变量** - 确保 `SUPABASE_SERVICE_ROLE_KEY` 在生产环境中正确配置
2. **代码审查** - 确保服务角色客户端只在必要时使用
3. **测试覆盖** - 全面测试修复后的功能
4. **监控日志** - 监控生产环境中的错误日志

## 🔄 后续优化

1. **统一客户端管理** - 创建统一的客户端管理模块
2. **权限检查** - 添加权限检查机制
3. **错误处理** - 改进错误处理和日志记录
4. **性能优化** - 优化数据库查询性能
