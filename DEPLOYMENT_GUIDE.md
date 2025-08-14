# LifeX MVP 部署指南

## 🚀 Vercel 部署

### 步骤 1: 准备环境变量

在 Vercel 项目设置中配置以下环境变量：

#### 必需的环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 可选的环境变量（用于AI功能）：
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-nano
```

#### 应用配置：
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 步骤 2: 获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings > API
4. 复制以下信息：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 步骤 3: 配置 Vercel

1. 连接 GitHub 仓库到 Vercel
2. 在项目设置中添加环境变量
3. 设置构建命令：`npm run build`
4. 设置输出目录：`.next`

### 步骤 4: 部署

1. 推送代码到 GitHub
2. Vercel 会自动触发部署
3. 等待构建完成

## 🔧 环境变量配置

### 本地开发 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 生产环境 (Vercel)
在 Vercel 项目设置 > Environment Variables 中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (可选)
- `NEXT_PUBLIC_APP_URL`

## 🛠️ 故障排除

### 常见问题：

1. **构建失败：supabaseUrl is required**
   - 确保在 Vercel 中设置了 `NEXT_PUBLIC_SUPABASE_URL`
   - 检查环境变量名称是否正确

2. **AI 功能不工作**
   - 检查 `OPENAI_API_KEY` 是否设置
   - 应用会在没有 AI 密钥时使用备用推荐

3. **认证问题**
   - 确保 Supabase 项目配置正确
   - 检查 RLS 策略是否启用

### 调试步骤：

1. 检查 Vercel 构建日志
2. 验证环境变量是否正确设置
3. 测试 Supabase 连接
4. 检查数据库表是否存在

## 📊 监控和维护

### 性能监控：
- 使用 Vercel Analytics
- 监控 Supabase 使用量
- 检查 OpenAI API 使用情况

### 安全维护：
- 定期更新依赖
- 监控 Supabase 安全日志
- 检查 RLS 策略

## 🎯 生产环境检查清单

- [ ] 环境变量配置完成
- [ ] Supabase 项目设置正确
- [ ] 数据库表创建完成
- [ ] RLS 策略启用
- [ ] 域名配置（可选）
- [ ] SSL 证书（自动）
- [ ] 性能测试通过
- [ ] 功能测试完成

## 📞 支持

如果遇到部署问题：
1. 检查 Vercel 构建日志
2. 验证环境变量配置
3. 测试本地构建：`npm run build`
4. 联系技术支持
