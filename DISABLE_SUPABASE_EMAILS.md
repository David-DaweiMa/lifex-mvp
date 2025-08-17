# 禁用Supabase自动邮件发送

## 问题描述
目前系统同时发送两封邮件：
1. Supabase Auth自动发送的确认邮件
2. 我们的自定义邮件模板

这导致用户收到重复邮件，且可能造成混淆。

## 解决方案

### 方法1: 在Supabase Dashboard中禁用自动邮件

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Settings**
4. 找到 **Email Templates** 部分
5. 禁用以下模板：
   - **Confirm signup** - 禁用注册确认邮件
   - **Invite user** - 禁用邀请邮件（如果不需要）

### 方法2: 使用环境变量禁用

在Supabase项目设置中添加环境变量：
```
DISABLE_SIGNUP_CONFIRMATION_EMAIL=true
```

### 方法3: 在代码中处理

如果无法在Dashboard中禁用，可以在注册后立即删除Supabase发送的邮件记录：

```sql
-- 在触发器或函数中删除Supabase的邮件记录
DELETE FROM auth.users WHERE email = NEW.email AND email_confirmed_at IS NULL;
```

## 推荐做法

1. **首选方法1** - 在Supabase Dashboard中禁用自动邮件
2. **使用我们的自定义邮件服务** - 提供更好的用户体验和品牌一致性
3. **统一邮件流程** - 所有邮件都通过我们的邮件服务发送

## 验证步骤

1. 在Supabase Dashboard中禁用自动邮件
2. 重新测试注册流程
3. 确认只收到一封我们的自定义邮件
4. 验证邮件确认链接正常工作

## 注意事项

- 禁用Supabase邮件后，所有邮件确认都依赖我们的邮件服务
- 确保我们的邮件服务配置正确且稳定
- 考虑添加邮件发送失败的重试机制
