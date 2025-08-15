# LifeX 邮件功能测试指南

## 📧 概述

本指南将帮助您测试 LifeX 项目的邮件确认功能，包括邮件发送、确认流程和用户界面。

## 🚀 快速开始

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问测试页面
- **配置检查**：http://localhost:3000/test/config
- **邮件测试**：http://localhost:3000/test/email
- **用户注册**：http://localhost:3000/auth/register
- **邮件确认**：http://localhost:3000/auth/confirm

## 🔧 环境变量配置

### 必需的配置
在 `.env.local` 文件中添加：

```env
# Resend 配置
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@lifex.co.nz

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_CONFIRMATION_URL=http://localhost:3000/auth/confirm
```

### 获取 Resend API Key
1. 登录 [Resend](https://resend.com)
2. 进入 API Keys 页面
3. 创建新的 API Key
4. 复制并粘贴到环境变量中

## 🧪 测试步骤

### 步骤 1：配置检查
1. 访问 http://localhost:3000/test/config
2. 检查所有配置项是否显示为绿色（成功）
3. 如果有红色（错误）项，请检查环境变量配置

### 步骤 2：邮件发送测试
1. 访问 http://localhost:3000/test/email
2. 输入您的测试邮箱地址
3. 点击"测试确认邮件"按钮
4. 检查邮箱是否收到邮件

### 步骤 3：用户注册测试
1. 访问 http://localhost:3000/auth/register
2. 填写注册信息
3. 提交注册表单
4. 检查是否显示邮件确认提示

### 步骤 4：邮件确认测试
1. 点击邮件中的确认链接
2. 或访问 http://localhost:3000/auth/confirm?token=test&email=test@example.com
3. 检查确认页面是否正常显示

## 📋 测试清单

### ✅ 配置测试
- [ ] Resend API Key 已配置
- [ ] 发送邮箱地址已配置
- [ ] 应用 URL 已配置
- [ ] 邮件确认 URL 已配置

### ✅ 邮件发送测试
- [ ] 确认邮件可以发送
- [ ] 欢迎邮件可以发送
- [ ] 邮件内容正确显示
- [ ] 邮件链接可以点击

### ✅ 用户界面测试
- [ ] 注册页面显示邮件确认提示
- [ ] 确认页面正常显示
- [ ] 错误处理正常工作
- [ ] 重新发送功能正常

### ✅ 功能集成测试
- [ ] 用户注册后发送确认邮件
- [ ] 邮件确认后更新用户状态
- [ ] 确认后发送欢迎邮件
- [ ] 整个流程无缝衔接

## 🐛 常见问题

### 问题 1：邮件发送失败
**症状**：测试页面显示"邮件发送失败"
**解决方案**：
1. 检查 Resend API Key 是否正确
2. 确认域名验证是否完成
3. 检查 DNS 记录是否正确配置

### 问题 2：邮件进入垃圾箱
**症状**：邮件被标记为垃圾邮件
**解决方案**：
1. 检查 SPF, DKIM, DMARC 记录
2. 确保使用官方域名发送
3. 优化邮件内容

### 问题 3：确认链接无效
**症状**：点击确认链接显示错误
**解决方案**：
1. 检查 EMAIL_CONFIRMATION_URL 配置
2. 确认确认页面路由正确
3. 检查 token 和 email 参数

### 问题 4：环境变量未生效
**症状**：配置检查显示未配置
**解决方案**：
1. 重启开发服务器
2. 检查 .env.local 文件位置
3. 确认变量名拼写正确

## 📊 测试数据

### 测试邮箱建议
- **Gmail**：测试@gmail.com
- **Outlook**：测试@outlook.com
- **QQ邮箱**：测试@qq.com
- **163邮箱**：测试@163.com

### 测试用户数据
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "password": "testpass123"
}
```

## 🔍 调试技巧

### 1. 查看控制台日志
```bash
# 在终端中查看服务器日志
npm run dev
```

### 2. 检查网络请求
- 打开浏览器开发者工具
- 查看 Network 标签页
- 检查 API 请求和响应

### 3. 验证环境变量
```bash
# 在代码中打印环境变量
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY);
```

### 4. 测试 API 端点
```bash
# 测试配置检查 API
curl http://localhost:3000/api/test/config

# 测试邮件发送 API
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","type":"confirmation"}'
```

## 📈 性能测试

### 邮件发送性能
- **单次发送**：通常 < 1 秒
- **批量发送**：建议不超过 10 封/分钟
- **错误重试**：自动重试 3 次

### 用户体验指标
- **页面加载时间**：< 2 秒
- **邮件发送反馈**：< 3 秒
- **确认流程完成**：< 5 秒

## 🚀 生产环境部署

### 部署前检查
1. 更新环境变量为生产环境
2. 配置生产域名
3. 测试所有功能
4. 监控邮件发送状态

### 生产环境配置
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://lifex.co.nz
EMAIL_CONFIRMATION_URL=https://lifex.co.nz/auth/confirm
RESEND_FROM_EMAIL=noreply@lifex.co.nz
```

## 📞 支持

### 获取帮助
- **技术问题**：查看控制台日志
- **配置问题**：检查环境变量
- **邮件问题**：查看 Resend 控制台

### 有用的链接
- [Resend 文档](https://resend.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [项目 GitHub](https://github.com/your-repo)

---

**注意**：测试完成后，请确保清理测试数据，避免影响生产环境。
