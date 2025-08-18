# 🚀 生产环境部署指南

## 🔍 当前问题

从检查结果发现以下问题：

1. **生产环境URL配置错误** - `NEXT_PUBLIC_APP_URL` 设置为 `http://localhost:3000`
2. **邮件确认记录为空** - `email_confirmations` 表没有数据
3. **用户邮箱未验证** - 所有用户的 `email_verified` 都是 `false`

## 🛠️ 解决步骤

### 步骤1: 设置正确的生产环境URL

在Vercel Dashboard中设置环境变量：

1. **访问Vercel Dashboard**: https://vercel.com/dashboard
2. **选择你的项目**
3. **进入Settings → Environment Variables**
4. **添加或更新以下环境变量**:

```
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

**注意**: 将 `your-production-domain.vercel.app` 替换为你的实际Vercel域名。

### 步骤2: 确认其他环境变量

确保以下环境变量都已正确设置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@lifex.co.nz
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

### 步骤3: 重新部署

1. **在Vercel Dashboard中点击"Redeploy"**
2. **或者推送新的代码到GitHub触发自动部署**

### 步骤4: 验证部署

部署完成后，运行以下命令验证：

```bash
node check-production-deployment.js
```

## 🧪 测试步骤

### 1. 测试用户注册

1. 访问生产环境注册页面
2. 完成用户注册
3. 检查是否收到确认邮件
4. 点击确认链接验证功能

### 2. 检查数据库记录

运行以下命令检查：

```bash
node debug-production-email.js
```

### 3. 检查Vercel函数日志

1. 访问Vercel Dashboard
2. 查看函数日志
3. 查找邮件发送相关的错误

## 📋 检查清单

### 环境变量配置
- [ ] `NEXT_PUBLIC_APP_URL` 设置为正确的生产域名
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] `RESEND_API_KEY` 已配置
- [ ] `RESEND_FROM_EMAIL` 已配置

### 代码部署
- [ ] 最新代码已推送到GitHub
- [ ] Vercel自动部署成功
- [ ] 部署时间在代码推送之后

### 功能测试
- [ ] 用户注册功能正常
- [ ] 邮件发送功能正常
- [ ] 邮件确认功能正常
- [ ] 数据库记录正确

## 🔗 有用的链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Resend Dashboard**: https://resend.com/dashboard

## 🚨 常见问题

### 问题1: 邮件发送失败
**解决方案**: 检查Resend API密钥和域名验证

### 问题2: Token保存失败
**解决方案**: 确认 `SUPABASE_SERVICE_ROLE_KEY` 配置正确

### 问题3: 确认链接无效
**解决方案**: 检查 `NEXT_PUBLIC_APP_URL` 设置

## 📞 技术支持

如果问题仍然存在，请提供：

1. Vercel函数日志
2. 环境变量配置截图
3. 数据库记录截图
4. 错误信息详情

## 🎯 预期结果

修复后应该看到：

- ✅ 用户注册后收到确认邮件
- ✅ `email_confirmations` 表有数据
- ✅ 用户邮箱验证状态为 `true`
- ✅ 邮件确认链接正常工作
