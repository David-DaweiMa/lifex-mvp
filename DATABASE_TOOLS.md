# 数据库工具集

这个工具集提供了多种方式来检查和获取Supabase数据库的架构和数据信息。

## 🛠️ 工具列表

### 1. `database-inspector.js` - 完整数据库检查工具

**功能最全面的工具，支持多种检查模式**

```bash
# 显示所有信息（默认）
node database-inspector.js

# 只显示表结构
node database-inspector.js --schema

# 只显示数据统计
node database-inspector.js --data

# 只显示示例数据
node database-inspector.js --sample

# 检查特定表
node database-inspector.js --table=businesses

# 导出为JSON文件
node database-inspector.js --export

# 组合使用
node database-inspector.js --schema --data --export
```

**输出示例:**
```
🔍 数据库架构和数据检查工具
📡 项目: muuzilttuddlljumoiig
⏰ 时间: 2025-01-18 15:30:00

📋 获取表结构...
📋 businesses 表结构:
字段名 | 类型 | 可空 | 示例值
------|------|------|--------
id | string | 否 | 2c7d22a6-20a9-4c1f-98d2-06ec29...
name | string | 否 | Ponsonby Central
verification_status | string | 否 | pending
...
```

### 2. `quick-db-check.js` - 快速检查工具

**轻量级工具，快速获取关键信息**

```bash
node quick-db-check.js
```

**输出示例:**
```
⚡ 快速数据库检查
📡 项目: muuzilttuddlljumoiig
⏰ 时间: 2025-01-18 15:30:00

📊 数据统计:
  ✅ businesses: 3 条记录
  ✅ specials: 3 条记录
  ✅ user_profiles: 0 条记录
  ✅ trending_posts: 0 条记录

🔍 关键字段检查:
  Businesses表字段:
    - verification_status: pending
    - business_type: null
  Specials表字段:
    - is_verified: true
    - is_active: true
```

### 3. `get-database-schema.js` - 架构获取工具

**专门用于获取完整的表结构信息**

```bash
node get-database-schema.js
```

### 4. `check-database-simple.js` - 简单检查工具

**基础的数据库连接和数据检查**

```bash
node check-database-simple.js
```

## 📋 检查的表

所有工具都会检查以下表：

- `businesses` - 商家信息
- `specials` - 优惠信息
- `special_claims` - 优惠领取记录
- `special_views` - 优惠浏览记录
- `user_profiles` - 用户资料
- `trending_posts` - 热门帖子
- `post_likes` - 帖子点赞
- `post_shares` - 帖子分享
- `post_comments` - 帖子评论

## 🔧 环境要求

1. **Node.js** - 运行JavaScript脚本
2. **环境变量** - 需要 `.env.local` 文件包含：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

## 📊 输出信息

### 表结构信息
- 字段名称
- 数据类型
- 是否可空
- 示例值

### 数据统计
- 每个表的记录数量
- 连接状态
- 错误信息

### 示例数据
- 每个表的前几条记录
- 字段值示例
- 数据格式

## 🚀 使用场景

### 开发调试
```bash
# 快速检查数据库状态
node quick-db-check.js

# 查看特定表结构
node database-inspector.js --table=specials --schema
```

### 数据迁移
```bash
# 导出完整架构
node database-inspector.js --schema --export

# 检查数据完整性
node database-inspector.js --data
```

### 问题排查
```bash
# 全面检查
node database-inspector.js --all

# 查看示例数据
node database-inspector.js --sample
```

## 📝 注意事项

1. **权限**: 使用 `anon` key，只能访问公开数据
2. **限制**: 示例数据限制为前几条记录
3. **网络**: 需要网络连接访问Supabase
4. **安全**: 不要在生产环境暴露敏感信息

## 🔄 更新数据

这些工具会实时从数据库获取最新信息，每次运行都会显示当前状态：

```bash
# 随时检查最新状态
node quick-db-check.js

# 获取最新架构
node database-inspector.js --schema
```

## 📁 文件说明

- `database-inspector.js` - 主要工具，功能最全
- `quick-db-check.js` - 快速检查，适合日常使用
- `get-database-schema.js` - 架构专用工具
- `check-database-simple.js` - 基础检查工具
- `check-supabase-config.js` - 配置检查工具
- `DATABASE_TOOLS.md` - 本文档

## 🆘 故障排除

### 环境变量错误
```
❌ 缺少Supabase环境变量
```
**解决**: 检查 `.env.local` 文件是否存在且包含正确的配置

### 网络连接问题
```
❌ API连接失败
```
**解决**: 检查网络连接和Supabase服务状态

### 权限问题
```
❌ 表不存在或无法访问
```
**解决**: 检查数据库权限和表是否存在


