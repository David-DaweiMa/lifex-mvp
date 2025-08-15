# LifeX 邮件确认功能设置指南

## 📧 概述

LifeX 现在支持完整的邮件确认功能，包括：
- 用户注册时的邮件确认
- 注册成功后的欢迎邮件
- 邮件确认页面和重新发送功能

## 🎯 需要的邮箱配置

### 主要邮箱
1. **noreply@lifex.co.nz** - 系统通知和邮件确认
2. **support@lifex.co.nz** - 用户支持
3. **welcome@lifex.co.nz** - 欢迎邮件

### 可选邮箱
4. **marketing@lifex.co.nz** - 营销邮件
5. **admin@lifex.co.nz** - 管理员通知

## 🔧 邮件服务配置

### 方案一：Resend (推荐用于生产环境)

1. **注册 Resend 账户**
   - 访问 [Resend](https://resend.com)
   - 创建账户并验证域名 `lifex.co.nz`

2. **配置环境变量**
   ```env
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@lifex.co.nz
   ```

3. **验证域名**
   - 在 Resend 控制台添加域名 `lifex.co.nz`
   - 配置 DNS 记录（SPF, DKIM, DMARC）
   - 等待域名验证完成

### 方案二：SMTP (备用方案)

1. **配置 SMTP 服务器**
   ```env
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   SMTP_FROM_EMAIL=noreply@lifex.co.nz
   ```

2. **推荐的 SMTP 提供商**
   - Gmail (需要应用专用密码)
   - SendGrid
   - Mailgun
   - Amazon SES

## 📋 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@lifex.co.nz

# Email Templates
EMAIL_CONFIRMATION_URL=https://lifex.co.nz/auth/confirm
EMAIL_WELCOME_URL=https://lifex.co.nz/auth/welcome

# Application Configuration
NEXT_PUBLIC_APP_URL=https://lifex.co.nz
```

## 🚀 功能特性

### 1. 邮件确认流程
1. 用户注册账户
2. 系统发送确认邮件
3. 用户点击确认链接
4. 账户激活，发送欢迎邮件

### 2. 邮件模板
- **确认邮件**：包含确认链接和账户信息
- **欢迎邮件**：介绍平台功能和快速开始指南

### 3. 错误处理
- 邮件发送失败时的优雅降级
- 重新发送确认邮件功能
- 用户友好的错误提示

## 📱 用户界面

### 注册页面
- 注册成功后显示邮件确认提示
- 模态框显示确认状态

### 确认页面
- 自动处理确认链接
- 显示确认结果
- 重新发送邮件选项

## 🔒 安全考虑

### 1. 确认链接安全
- 使用用户ID作为确认token
- 验证邮箱地址匹配
- 防止重复确认

### 2. 邮件安全
- 使用官方域名发送邮件
- 配置 SPF, DKIM, DMARC 记录
- 防止邮件被标记为垃圾邮件

### 3. 数据保护
- 不存储敏感信息在邮件中
- 使用HTTPS链接
- 符合隐私法规

## 🧪 测试

### 1. 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 测试邮件发送
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "username": "testuser",
    "full_name": "Test User"
  }'
```

### 2. 生产环境测试
1. 使用真实邮箱地址测试
2. 检查邮件送达率
3. 验证确认链接功能
4. 测试重新发送功能

## 📊 监控和维护

### 1. 邮件发送监控
- 监控发送成功率
- 跟踪退信率
- 检查垃圾邮件投诉

### 2. 用户行为分析
- 确认邮件打开率
- 确认链接点击率
- 用户激活率

### 3. 性能优化
- 邮件发送队列
- 批量发送优化
- 模板缓存

## 🐛 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查 API 密钥配置
   - 验证域名设置
   - 检查 SMTP 配置

2. **邮件被标记为垃圾邮件**
   - 配置 SPF, DKIM, DMARC
   - 使用官方域名
   - 优化邮件内容

3. **确认链接无效**
   - 检查 URL 配置
   - 验证 token 生成
   - 检查数据库连接

### 调试步骤

1. 检查环境变量配置
2. 查看服务器日志
3. 测试邮件服务连接
4. 验证数据库操作

## 📈 未来扩展

### 计划功能
- 邮件模板自定义
- 多语言邮件支持
- 邮件营销集成
- 高级邮件分析

### 技术改进
- 邮件队列系统
- 实时发送状态
- 邮件模板编辑器
- 自动化测试

## 📞 支持

如有问题，请联系：
- 📧 技术支持：support@lifex.co.nz
- 📚 文档：查看项目 README
- 🐛 问题反馈：GitHub Issues

---

**注意**：在生产环境部署前，请确保：
1. 域名验证完成
2. 邮件服务配置正确
3. 环境变量设置完整
4. 测试所有功能正常

