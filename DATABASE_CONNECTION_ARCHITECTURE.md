# 数据库连接架构说明

## 🏗️ **整体架构图**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase 数据库                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL    │  │   Auth Service  │  │  Real-time      │ │
│  │   Database      │  │                 │  │  Subscriptions  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
                    ┌───────────┼───────────┐
                    │           │           │
        ┌───────────▼──┐  ┌─────▼─────┐  ┌──▼──────────┐
        │   Web App    │  │  Mobile   │  │   API       │
        │  (Next.js)   │  │   App     │  │  Routes     │
        │              │  │(React     │  │ (Vercel)    │
        │ • 用户界面    │  │ Native)   │  │             │
        │ • 管理后台    │  │           │  │ • AI API    │
        │ • 业务逻辑    │  │ • 移动端  │  │ • Auth API  │
        │              │  │ • 离线    │  │ • Data API  │
        └──────────────┘  └───────────┘  └─────────────┘
```

## 🔗 **连接方式详解**

### **1. Web端连接 (Next.js)**

#### **配置方式**
```typescript
// packages/web/src/lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### **环境变量**
```bash
# .env.local (Web端)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **使用示例**
```typescript
// 用户认证
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// 数据查询
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId);
```

### **2. 移动端连接 (React Native)**

#### **配置方式**
```typescript
// packages/mobile/src/lib/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### **环境变量**
```bash
# .env (移动端)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### **使用示例**
```typescript
// 移动端认证
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// 离线数据同步
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .order('created_at', { ascending: false });
```

### **3. API路由连接 (Vercel)**

#### **服务端配置**
```typescript
// packages/web/src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### **API路由示例**
```typescript
// packages/web/src/app/api/ai/route.ts
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  // 使用服务角色密钥进行数据库操作
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      user_id: userId,
      content: message,
      message_type: 'ai'
    });
}
```

## 🔐 **安全架构**

### **权限层级**

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase 安全模型                        │
├─────────────────────────────────────────────────────────────┤
│  Row Level Security (RLS)                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Anonymous     │  │   Authenticated │  │   Service   │ │
│  │   (Public)      │  │   (User)        │  │   Role      │ │
│  │                 │  │                 │  │             │ │
│  │ • 只读公开数据   │  │ • 用户数据      │  │ • 全部权限   │ │
│  │ • 注册/登录     │  │ • 个人设置      │  │ • 管理操作   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **密钥管理**

| 密钥类型 | 用途 | 权限 | 使用场景 |
|---------|------|------|----------|
| **Anon Key** | 客户端 | 受限 | Web端、移动端前端 |
| **Service Role Key** | 服务端 | 完全 | API路由、后台任务 |
| **JWT Secret** | 认证 | 令牌 | 用户会话管理 |

## 📊 **数据流示例**

### **用户注册流程**
```
1. 用户填写注册表单
   ↓
2. Web端/移动端调用 supabase.auth.signUp()
   ↓
3. Supabase Auth 处理注册
   ↓
4. 触发数据库触发器
   ↓
5. 自动创建用户配置文件
   ↓
6. 返回用户信息给客户端
```

### **AI对话流程**
```
1. 用户发送消息
   ↓
2. 移动端保存到本地 (离线)
   ↓
3. 调用 Web API (/api/ai)
   ↓
4. API 使用 Service Role 保存到数据库
   ↓
5. 调用 OpenAI API
   ↓
6. 返回AI回复
   ↓
7. 移动端同步数据
```

## 🛠️ **配置步骤**

### **1. 创建Supabase项目**
```bash
# 访问 https://supabase.com
# 创建新项目
# 获取项目URL和密钥
```

### **2. 配置环境变量**

#### **Web端 (Vercel)**
```bash
# 在Vercel Dashboard中设置环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **移动端**
```bash
# 创建 .env 文件
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **3. 数据库初始化**
```sql
-- 运行 database-schema.sql
-- 创建表结构
-- 设置RLS策略
-- 创建触发器
```

## 🔄 **数据同步策略**

### **Web端**
- **实时同步**: 使用Supabase实时订阅
- **缓存策略**: 客户端缓存 + SWR
- **离线处理**: Service Worker

### **移动端**
- **离线优先**: AsyncStorage本地存储
- **增量同步**: 时间戳比较
- **冲突解决**: 最后写入获胜

## 🚨 **故障处理**

### **连接失败**
```typescript
// 重试机制
const retryConnection = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabase.from('table').select();
      if (!error) return data;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### **离线模式**
```typescript
// 移动端离线检测
const isOnline = navigator.onLine;
if (!isOnline) {
  // 使用本地缓存数据
  const cachedData = await AsyncStorage.getItem('cached_data');
  return JSON.parse(cachedData);
}
```

## 📈 **性能优化**

### **查询优化**
- 使用索引
- 限制返回字段
- 分页查询
- 缓存策略

### **连接优化**
- 连接池
- 预连接
- 心跳检测
- 自动重连

---

**总结**: 数据库通过Supabase统一管理，Web端和移动端都直接连接，API路由使用服务角色进行管理操作，确保数据一致性和安全性。
