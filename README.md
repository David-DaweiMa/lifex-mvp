# LifeX MVP - 新西兰本地生活平台

## 项目概述

LifeX 是一个基于 AI 的新西兰本地生活推荐平台，集成了用户认证、配额管理、内嵌式广告和智能推荐系统。

## 功能特性

### 🎯 核心功能
- **AI 智能对话**: 基于 GPT-5 Nano 的本地生活助手
- **用户配额管理**: 按用户类型限制功能使用次数
- **内嵌式广告**: 智能投放，融入内容流
- **商家管理**: 支持商家注册、商品发布
- **内容发布**: Trending 内容、产品展示

### 👥 用户类型
- **Guest**: 游客用户（有限功能）
- **Customer**: 普通用户
- **Premium**: 高级用户
- **Free Business**: 免费商家
- **Professional Business**: 专业商家
- **Enterprise Business**: 企业商家

### 📊 配额系统
每个用户类型都有不同的功能使用限制：

| 用户类型 | Chat (每日) | Trending (每月) | Ads (每月) | Products | Stores |
|---------|-------------|----------------|------------|----------|---------|
| Guest | 3 | 0 | 0 | 0 | 0 |
| Customer | 10 | 5 | 1 | 0 | 0 |
| Premium | 50 | 20 | 5 | 0 | 0 |
| Free Business | 10 | 5 | 1 | 10 | 1 |
| Professional Business | 100 | 50 | 20 | 50 | 3 |
| Enterprise Business | 200 | 100 | 50 | 200 | 10 |

## 技术栈

- **前端**: Next.js 15, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-5 Nano
- **认证**: Supabase Auth

## 快速开始

### 1. 环境配置

复制环境变量文件：
```bash
cp env.example .env.local
```

配置以下环境变量：
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-nano

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. 数据库设置

#### 2.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和匿名密钥

#### 2.2 执行数据库脚本
在 Supabase SQL 编辑器中执行 `database-schema.sql` 文件中的所有 SQL 语句。

#### 2.3 配置 RLS 策略
确保所有表都启用了 Row Level Security，并根据需要调整访问策略。

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 测试系统

### 1. 访问测试页面
访问 [http://localhost:3000/test](http://localhost:3000/test) 查看系统测试页面。

### 2. 测试 API 端点

#### 检查测试 API 状态
```bash
curl http://localhost:3000/api/test
```

#### 测试配额系统
```bash
curl "http://localhost:3000/api/test?action=quota"
```

#### 测试用户系统
```bash
curl "http://localhost:3000/api/test?action=user"
```

### 3. 测试 Chat API

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "推荐一些奥克兰的咖啡店",
    "userId": "your_user_id",
    "sessionId": "test_session"
  }'
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── ai/           # AI 聊天 API
│   │   └── test/         # 测试 API
│   ├── test/             # 测试页面
│   └── page.tsx          # 主页
├── components/            # React 组件
│   ├── pages/            # 页面组件
│   └── LifeXApp.tsx      # 主应用组件
├── lib/                   # 工具库
│   ├── ai.ts             # AI 服务
│   ├── authService.ts    # 认证服务
│   ├── quotaService.ts   # 配额管理
│   ├── adService.ts      # 广告服务
│   └── supabase.ts       # Supabase 配置
└── types/                # TypeScript 类型定义
```

## 核心服务

### AI 服务 (`src/lib/ai.ts`)
- 智能对话生成
- 商家推荐
- 用户偏好提取

### 配额服务 (`src/lib/quotaService.ts`)
- 用户配额检查
- 使用量更新
- 配额重置

### 认证服务 (`src/lib/authService.ts`)
- 用户注册/登录
- 会话管理
- 用户配置文件

### 广告服务 (`src/lib/adService.ts`)
- 智能广告投放
- 相关性匹配
- 点击追踪

## 开发指南

### 添加新功能
1. 在 `src/lib/` 中创建服务文件
2. 在 `src/app/api/` 中创建 API 路由
3. 在 `src/components/` 中创建 UI 组件
4. 更新类型定义

### 数据库修改
1. 修改 `database-schema.sql`
2. 更新 `src/lib/supabase.ts` 中的类型定义
3. 更新相关服务文件

### 测试新功能
1. 在 `src/app/test/` 中添加测试页面
2. 在 `src/app/api/test/` 中添加测试 API
3. 更新测试页面 UI

## 部署

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署项目

### 环境变量配置
确保在 Vercel 中配置以下环境变量：
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 故障排除

### 常见问题

#### 1. EPERM 错误
```bash
# 清理 Next.js 缓存
rm -rf .next
npm run dev
```

#### 2. 端口占用
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
# 终止进程
taskkill /PID <进程ID> /F
```

#### 3. Supabase 连接问题
- 检查环境变量配置
- 确认 Supabase 项目状态
- 验证 RLS 策略设置

#### 4. AI API 问题
- 检查 OpenAI API 密钥
- 确认模型名称正确
- 查看 API 使用配额

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请创建 Issue 或联系开发团队。