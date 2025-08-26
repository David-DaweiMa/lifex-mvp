# Business用户注册问题修复指南

## 问题描述

个人用户注册可以正常工作，但是business用户注册失败，错误信息显示"用户配置文件创建失败"。

## 问题原因

经过分析，发现问题的根本原因是：

1. **Supabase客户端不一致**：在register route中存在两个不同的Supabase客户端，导致权限和配置不一致。
   - register route中创建了新的supabase客户端
   - authService.ts中使用typedSupabaseAdmin
   - 这可能导致权限问题和数据不一致

2. **缺少自动创建用户配置文件的触发器**：当用户在Supabase Auth中注册时，没有触发器自动在`user_profiles`表中创建对应的配置文件记录。

3. **数据库表结构不完整**：`user_profiles`表可能缺少`email_verified`字段，或者字段类型不匹配。

4. **RLS策略配置问题**：Row Level Security策略可能阻止了用户配置文件的创建。

5. **Business表字段不匹配**：`businesses`表的结构与代码中期望的字段不匹配。

## 解决方案

### 1. 修复Supabase客户端不一致问题 ✅

**已修复**：统一使用`typedSupabaseAdmin`客户端，确保所有操作使用相同的权限和配置。

```typescript
// 修复前：存在两个不同的客户端
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 修复后：统一使用typedSupabaseAdmin
import { typedSupabaseAdmin } from '@/lib/supabase';
```

### 2. 执行数据库修复脚本

在Supabase SQL编辑器中执行 `database-schema-fix.sql` 文件中的所有SQL语句。这个脚本会：

- 添加缺失的`email_verified`字段
- 创建用户配置文件自动创建触发器
- 修复businesses表结构
- 创建categories表和相关数据
- 修复RLS策略

### 3. 验证修复

使用诊断工具验证修复是否成功：

1. 访问 `/test/business-record-creation` 页面
2. 点击"开始测试"按钮
3. 检查所有步骤是否都显示"通过"

### 4. 测试Business用户注册

1. 访问注册页面
2. 选择"Business用户"类型
3. 填写必要信息（business name, service category等）
4. 提交注册

## 修复内容详解

### Supabase客户端修复

```typescript
// 修复前的问题代码
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 修复后的代码
import { typedSupabaseAdmin } from '@/lib/supabase';
// 统一使用typedSupabaseAdmin，确保权限一致
```

### 触发器修复

```sql
-- 创建用户配置文件自动创建触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, email, username, full_name, user_type, email_verified, created_at, updated_at
  ) VALUES (
    NEW.id, NEW.email, 
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    NEW.created_at, NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 表结构修复

```sql
-- 确保user_profiles表有email_verified字段
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 修复businesses表结构
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Auckland',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'New Zealand',
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;
```

### RLS策略修复

```sql
-- 修复user_profiles表的RLS策略
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 验证步骤

1. **环境变量检查**：确保所有必要的环境变量都已配置
2. **数据库连接检查**：验证Supabase连接正常
3. **表结构检查**：确认所有必需字段都存在
4. **RLS策略检查**：验证访问策略配置正确
5. **用户创建测试**：测试用户注册流程
6. **配置文件创建测试**：验证配置文件自动创建
7. **业务记录创建测试**：测试business记录创建

## 常见问题

### Q: 执行修复脚本后仍然失败怎么办？

A: 检查以下几点：
- 确认脚本中的所有SQL语句都执行成功
- 检查Supabase控制台中的错误日志
- 使用诊断工具重新运行测试

### Q: RLS策略阻止了操作怎么办？

A: 临时禁用RLS进行测试：
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
-- 测试完成后重新启用
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Q: 触发器没有触发怎么办？

A: 检查触发器是否正确创建：
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Q: Supabase客户端不一致会导致什么问题？

A: Supabase客户端不一致可能导致：
- 权限问题：不同的客户端可能有不同的权限级别
- 配置问题：不同的客户端可能使用不同的配置
- 数据不一致：可能导致数据在不同客户端之间不同步
- 认证问题：可能导致认证状态不一致

## 预防措施

1. **统一Supabase客户端**：始终使用`typedSupabaseAdmin`进行服务器端操作
2. **定期运行诊断工具**：确保系统配置正确
3. **监控错误日志**：及时发现和修复问题
4. **测试覆盖**：为所有用户类型创建测试用例
5. **文档更新**：保持数据库schema文档的更新

## 联系支持

如果问题仍然存在，请：
1. 运行诊断工具并保存结果
2. 检查Supabase控制台的错误日志
3. 提供详细的错误信息和复现步骤
