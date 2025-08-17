# 环境变量设置指南

## 🔧 本地开发环境设置

### 第一步：创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，内容如下：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 邮件服务配置
RESEND_API_KEY=your_resend_api_key_here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
```

### 第二步：获取Supabase配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 第三步：获取Resend API Key

1. 登录 [Resend Dashboard](https://resend.com/dashboard)
2. 进入 **API Keys**
3. 创建新的API Key
4. 复制API Key → `RESEND_API_KEY`

### 第四步：获取OpenAI API Key

1. 登录 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 创建新的API Key
3. 复制API Key → `OPENAI_API_KEY`

## 🚀 部署环境设置

### Vercel环境变量

在Vercel项目设置中添加以下环境变量：

1. 进入Vercel项目仪表板
2. 选择 **Settings** > **Environment Variables**
3. 添加所有必要的环境变量

## 🔍 验证设置

运行以下命令验证环境变量是否正确设置：

```bash
node check-supabase-connection.js
```

如果看到所有环境变量都显示"✅ 已设置"，说明配置正确。

## 🚨 常见问题

### 问题1：Database error saving new user
**原因**: 环境变量未正确设置
**解决**: 确保所有Supabase环境变量都已设置

### 问题2：邮件发送失败
**原因**: RESEND_API_KEY未设置
**解决**: 设置正确的Resend API Key

### 问题3：AI功能不可用
**原因**: OPENAI_API_KEY未设置
**解决**: 设置正确的OpenAI API Key

## 📝 注意事项

1. **不要提交 .env.local 文件** - 该文件已添加到 .gitignore
2. **保护敏感信息** - 不要在任何公开的地方分享API密钥
3. **定期更新密钥** - 建议定期轮换API密钥以提高安全性
