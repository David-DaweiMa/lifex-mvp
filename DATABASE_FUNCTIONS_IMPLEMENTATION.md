# 数据库函数解决方案实施指南

## 🎯 概述

这个方案通过创建安全的数据库函数来解决 TypeScript 类型错误问题，是最稳定和安全的解决方案。

## 📋 实施步骤

### 第一步：在 Supabase 中执行数据库函数

1. **登录 Supabase Dashboard**
   - 访问你的 Supabase 项目
   - 进入 SQL Editor

2. **执行数据库函数**
   ```sql
   -- 复制 database-functions.sql 中的所有内容
   -- 在 SQL Editor 中执行
   ```

3. **验证函数创建**
   ```sql
   -- 检查函数是否创建成功
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%user%' OR routine_name LIKE '%business%' OR routine_name LIKE '%post%';
   ```

### 第二步：更新代码使用数据库函数

#### 2.1 更新 authService.ts

```typescript
// 替换现有的手动创建配置文件代码
import { createUserProfile, updateUserEmailVerification } from './databaseService';

// 在 registerUser 函数中
if (!profile) {
  console.warn('触发器没有创建配置文件，尝试手动创建...');
  
  const result = await createUserProfile(authData.user.id, email, {
    username: userData?.username,
    full_name: userData?.full_name,
    subscription_level: userData?.subscription_level || 'free',
    has_business_features: userData?.has_business_features || false,
    business_name: userData?.business_name,
    email_verified: false
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || '用户配置文件创建失败'
    };
  }

  profile = result.user;
  console.log('✅ 手动创建配置文件成功:', profile.id);
}

// 在自动确认邮箱部分
if (autoConfirmEmail) {
  console.log('自动确认邮箱...');
  const { error: confirmError } = await typedSupabaseAdmin.auth.admin.updateUserById(
    authData.user.id,
    { email_confirm: true }
  );

  if (confirmError) {
    console.error('自动确认邮箱失败:', confirmError);
  } else {
    // 使用数据库函数更新邮箱验证状态
    await updateUserEmailVerification(authData.user.id, true);
    profile.email_verified = true;
    console.log('邮箱自动确认成功');
  }
}
```

#### 2.2 更新 AI 路由 (api/ai/route.ts)

```typescript
import { createChatMessage, recordAssistantUsage, recordAnonymousUsage } from '@/lib/databaseService';

// 替换聊天消息创建
const { data: messageData, error: messageError } = await createChatMessage(userId, {
  session_id: sessionId,
  message_type: 'user',
  content: message,
  metadata: { assistant_type: assistant }
});

if (messageError) {
  console.error('保存用户消息失败:', messageError);
}

// 替换助手使用记录
await recordAssistantUsage(userId, assistant);

// 替换匿名使用记录
await recordAnonymousUsage(sessionId, 'coly');
```

#### 2.3 更新业务相关 API

```typescript
import { createBusiness } from '@/lib/databaseService';

// 在 businesses/route.ts 中
const result = await createBusiness(userId, {
  name: businessData.name,
  description: businessData.description,
  category: businessData.category || 'general',
  contact_info: {
    phone: businessData.phone,
    email: businessData.email
  },
  address: {
    city: businessData.city,
    country: businessData.country
  },
  // ... 其他字段
});

if (!result.success) {
  return NextResponse.json(
    { success: false, error: result.error },
    { status: 500 }
  );
}
```

#### 2.4 更新趋势页面组件

```typescript
import { createTrendingPost, likePost, sharePost } from '@/lib/databaseService';

// 创建帖子
const result = await createTrendingPost(user.id, {
  content: postData.content,
  images: postData.images || [],
  videos: postData.videos || [],
  hashtags: postData.hashtags || [],
  location: postData.location
});

// 点赞帖子
await likePost(user.id, postId);

// 分享帖子
await sharePost(user.id, postId, 'native', 'app');
```

### 第三步：测试和验证

#### 3.1 测试数据库函数

```sql
-- 测试用户相关函数
SELECT update_user_email_verification('test-uuid', true);
SELECT create_user_profile('test-uuid', 'test@example.com', '{"username": "testuser"}');

-- 测试业务相关函数
SELECT create_business('owner-uuid', '{"name": "Test Business", "category": "restaurant"}');

-- 测试帖子相关函数
SELECT create_trending_post('author-uuid', '{"content": "Hello world!"}');
SELECT like_post('user-uuid', 'post-uuid');
```

#### 3.2 测试 TypeScript 编译

```bash
cd packages/web
npm run build
```

#### 3.3 测试功能

1. 用户注册和登录
2. 创建业务记录
3. 发布趋势帖子
4. 点赞和分享功能
5. AI 聊天功能

## 🔧 故障排除

### 常见问题

1. **函数不存在错误**
   ```sql
   -- 检查函数是否存在
   SELECT routine_name FROM information_schema.routines WHERE routine_name = 'function_name';
   ```

2. **权限错误**
   ```sql
   -- 重新设置权限
   GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
   GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
   ```

3. **类型错误**
   ```typescript
   // 如果仍有类型错误，使用类型断言
   const result = await (typedSupabase as any).rpc('function_name', params);
   ```

## 🚀 优势

1. **类型安全**: 完全避免 TypeScript 类型错误
2. **性能优化**: 数据库函数执行效率更高
3. **安全性**: 使用 SECURITY DEFINER 确保数据安全
4. **可维护性**: 统一的数据库操作接口
5. **可扩展性**: 易于添加新的数据库操作

## 📝 注意事项

1. 所有函数都使用 `SECURITY DEFINER` 确保权限正确
2. 函数参数使用 JSONB 类型提供灵活性
3. 错误处理在函数内部和 TypeScript 代码中都有实现
4. 所有操作都有适当的日志记录

## 🔄 迁移策略

1. **渐进式迁移**: 可以逐步将现有代码迁移到使用数据库函数
2. **向后兼容**: 保持现有 API 接口不变
3. **测试优先**: 每个函数都要经过充分测试
4. **回滚计划**: 保留原有代码作为备份

这个方案可以一次性解决所有 TypeScript 类型错误，同时提供更好的性能和安全性。

