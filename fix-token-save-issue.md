# 修复Token保存问题指南

## 🔍 问题诊断结果

通过测试发现，token无法保存到 `email_confirmations` 表的主要原因是：

1. **缺少 `SUPABASE_SERVICE_ROLE_KEY` 环境变量**
2. **RLS策略阻止匿名用户插入数据**
3. **需要服务角色权限来绕过RLS策略**

## 🛠️ 解决方案

### 步骤1: 添加服务角色密钥

在 `.env.local` 文件中添加：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # 添加这一行
```

### 步骤2: 获取服务角色密钥

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制 **service_role** 密钥（不是 anon 密钥）

### 步骤3: 验证修复

运行测试脚本验证修复：

```bash
node debug-token-save.js
```

### 步骤4: 检查Vercel环境变量

如果部署在Vercel上，确保在Vercel项目设置中添加：

- `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 技术细节

### 为什么需要服务角色密钥？

1. **RLS策略限制**: `email_confirmations` 表启用了RLS
2. **权限控制**: 只有服务角色可以绕过RLS策略
3. **安全考虑**: 防止未授权用户插入数据

### 当前的RLS策略

```sql
-- 用户只能查看自己的确认记录
CREATE POLICY "Users can view own confirmations" ON public.email_confirmations
    FOR SELECT USING (auth.uid() = user_id);

-- 服务角色可以管理所有确认记录
CREATE POLICY "Service role can manage all confirmations" ON public.email_confirmations
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

### 代码中的使用

在 `emailService.ts` 中，我们使用服务角色客户端：

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 使用服务角色密钥
);
```

## 🧪 测试验证

### 测试1: 环境变量检查
```bash
node test-token-save-simple.js
```

### 测试2: 完整功能测试
```bash
node debug-token-save.js
```

### 测试3: 注册流程测试
1. 访问注册页面
2. 完成注册
3. 检查是否收到邮件
4. 点击确认链接
5. 验证确认是否成功

## 📋 检查清单

- [ ] 添加 `SUPABASE_SERVICE_ROLE_KEY` 到 `.env.local`
- [ ] 添加 `SUPABASE_SERVICE_ROLE_KEY` 到 Vercel 环境变量
- [ ] 运行测试脚本验证修复
- [ ] 测试完整的注册流程
- [ ] 验证邮件确认功能

## 🚨 安全注意事项

1. **不要暴露服务角色密钥**: 只在服务器端使用
2. **定期轮换密钥**: 定期更新服务角色密钥
3. **监控使用**: 监控服务角色密钥的使用情况
4. **最小权限原则**: 只给必要的权限

## 🔄 后续步骤

修复完成后，还需要：

1. **禁用Supabase自动邮件**: 避免重复邮件
2. **优化错误处理**: 改进邮件发送失败的处理
3. **添加监控**: 监控邮件发送成功率
4. **用户反馈**: 收集用户对邮件体验的反馈
