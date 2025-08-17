# 数据库触发器手动测试指导

## 测试前准备

### 1. 环境要求
- Supabase项目已创建
- 数据库权限已配置
- SQL编辑器可访问

### 2. 执行修复脚本

在Supabase SQL编辑器中执行以下脚本：

```sql
-- 复制并执行 fix-database-triggers.sql 的全部内容
```

### 3. 快速验证

执行快速检查脚本：

```sql
-- 复制并执行 quick-trigger-check.sql 的全部内容
```

## 详细测试步骤

### 步骤1: 验证触发器函数
```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'setup_user_quotas');
```

**预期结果**: 应该看到两个函数，security_type 为 'DEFINER'

### 步骤2: 验证触发器绑定
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**预期结果**: 应该看到触发器绑定到 auth.users 表

### 步骤3: 验证表结构
```sql
SELECT table_name, 'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_quotas', 'trigger_logs')
ORDER BY table_name;
```

**预期结果**: 应该看到所有三个表都存在

### 步骤4: 创建测试用户
```sql
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test-' || extract(epoch from now()) || '@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"username": "testuser", "full_name": "Test User", "user_type": "customer"}'::jsonb,
  now(),
  now()
) RETURNING id, email;
```

**记录返回的用户ID，用于后续测试**

### 步骤5: 验证触发器执行结果
```sql
-- 检查用户配置文件（替换 USER_ID 为实际用户ID）
SELECT * FROM public.user_profiles WHERE id = 'USER_ID';

-- 检查用户配额
SELECT * FROM public.user_quotas WHERE user_id = 'USER_ID';

-- 检查触发器日志
SELECT * FROM public.trigger_logs WHERE user_id = 'USER_ID';
```

**预期结果**:
- 用户配置文件已创建，user_type 为 'customer'
- 用户配额已设置，包含5个配额项
- 触发器日志已记录，状态为 'success'

### 步骤6: 清理测试数据
```sql
-- 删除测试用户（替换 USER_ID 为实际用户ID）
DELETE FROM auth.users WHERE id = 'USER_ID';
```

## 测试不同用户类型

### 测试免费用户
```sql
-- 创建免费用户
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'test-free-' || extract(epoch from now()) || '@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"username": "testfree", "full_name": "Test Free User", "user_type": "free"}'::jsonb,
  now(),
  now()
) RETURNING id, email;
```

### 测试高级用户
```sql
-- 创建高级用户
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'test-premium-' || extract(epoch from now()) || '@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"username": "testpremium", "full_name": "Test Premium User", "user_type": "premium"}'::jsonb,
  now(),
  now()
) RETURNING id, email;
```

## 故障排除

### 常见问题

1. **触发器函数不存在**
   - 重新执行 fix-database-triggers.sql
   - 检查SQL执行是否有错误

2. **触发器未绑定**
   - 检查触发器创建语句
   - 确认 auth.users 表存在

3. **用户配置文件未创建**
   - 检查 RLS 策略
   - 查看触发器日志表中的错误信息

4. **用户配额未设置**
   - 检查 setup_user_quotas 函数
   - 验证用户类型是否正确

### 调试技巧

1. **查看触发器日志**
   ```sql
   SELECT * FROM public.trigger_logs ORDER BY execution_time DESC LIMIT 10;
   ```

2. **检查RLS策略**
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. **查看函数定义**
   ```sql
   SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user';
   ```

## 成功标准

✅ 所有测试步骤都成功执行
✅ 不同用户类型都能正确创建配置文件和配额
✅ 触发器日志正确记录
✅ 测试数据能够正确清理

## 联系支持

如果遇到问题，请：
1. 记录错误信息
2. 保存测试结果
3. 检查 Supabase Dashboard 的日志
4. 参考故障排除部分
