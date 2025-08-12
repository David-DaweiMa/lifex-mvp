# LifeX AI 功能设置指南

## 概述

LifeX 集成了 OpenAI GPT-5 Nano 来提供智能聊天和推荐功能。AI 助手可以帮助用户发现新西兰的本地服务，提供个性化推荐，并回答相关问题。

## 功能特性

### 🤖 AI 聊天助手
- 自然语言对话
- 个性化推荐
- 上下文理解
- 后续问题建议

### 🎯 智能推荐系统
- 基于用户偏好的推荐
- 关键词匹配
- 评分和评论分析
- 实时可用性检查

### 💡 智能功能
- 用户偏好提取
- 对话历史管理
- 多轮对话支持
- 错误处理和回退机制

## 环境配置

### 1. OpenAI API 密钥设置

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 创建账户并获取 API 密钥
3. 复制 `.env.example` 到 `.env.local`
4. 设置你的 OpenAI API 密钥：

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. 可选配置

```bash
# 指定 AI 模型（默认：gpt-5-nano）
OPENAI_MODEL=gpt-5-nano

# 其他环境变量
NODE_ENV=development
```

## API 端点

### POST /api/ai

处理 AI 相关的请求，支持以下类型：

#### 1. 对话请求
```json
{
  "type": "conversation",
  "data": {
    "message": "用户消息",
    "conversationHistory": [
      {"role": "user", "content": "用户消息"},
      {"role": "assistant", "content": "AI 回复"}
    ],
    "context": {
      "userPreferences": ["family-friendly", "work-friendly"]
    }
  }
}
```

#### 2. 推荐请求
```json
{
  "type": "recommendations",
  "data": {
    "query": "推荐咖啡店",
    "userPreferences": ["work-friendly", "quiet"],
    "location": "Auckland",
    "budget": "$$"
  }
}
```

#### 3. 推理请求
```json
{
  "type": "reasoning",
  "data": {
    "business": {...},
    "userQuery": "为什么推荐这个？",
    "userPreferences": ["family-friendly"]
  }
}
```

## 使用示例

### 基本聊天
```typescript
import { chatService } from '@/lib/chatService';

// 发送消息
const response = await chatService.sendMessage("推荐一个适合工作的咖啡店");
console.log(response.message); // AI 回复
console.log(response.recommendations); // 推荐列表
console.log(response.followUpQuestions); // 后续问题
```

### 获取推荐
```typescript
import { getAIRecommendations } from '@/lib/ai';

const recommendations = await getAIRecommendations(
  { query: "健康食品" },
  availableBusinesses
);
```

## 回退机制

当 OpenAI API 不可用时，系统会自动回退到：

1. **关键词匹配推荐** - 基于业务类型和标签
2. **评分排序** - 按用户评分和评论数量
3. **可用性检查** - 优先推荐营业中的商家

## 用户偏好提取

系统会自动从对话中提取用户偏好：

- **家庭友好** - family, kids, children
- **工作友好** - work, laptop, wifi, quiet
- **预算意识** - cheap, affordable, budget
- **健康选择** - healthy, organic, vegan
- **快速服务** - fast, quick, express
- **本地特色** - local, authentic, kiwi

## 错误处理

### 常见错误及解决方案

1. **API 密钥无效**
   ```
   错误：OpenAI API key not available
   解决：检查 OPENAI_API_KEY 环境变量
   ```

2. **网络连接问题**
   ```
   错误：Failed to fetch
   解决：检查网络连接和 API 端点
   ```

3. **模型不可用**
   ```
   错误：Model not found
   解决：检查 OPENAI_MODEL 设置
   ```

## 性能优化

### 1. 缓存策略
- 对话历史本地存储
- 用户偏好缓存
- 推荐结果缓存

### 2. 请求优化
- 批量处理推荐请求
- 智能上下文管理
- 减少不必要的 API 调用

### 3. 用户体验
- 打字指示器
- 渐进式加载
- 错误重试机制

## 开发调试

### 启用调试日志
```typescript
// 在开发环境中启用详细日志
if (process.env.NODE_ENV === 'development') {
  console.log('AI Request:', request);
  console.log('AI Response:', response);
}
```

### 测试 AI 功能
```bash
# 启动开发服务器
npm run dev

# 测试 API 端点
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"type":"conversation","data":{"message":"推荐咖啡店"}}'
```

## 安全考虑

1. **API 密钥保护**
   - 永远不要在前端暴露 API 密钥
   - 使用环境变量存储敏感信息
   - 定期轮换 API 密钥

2. **请求限制**
   - 实施速率限制
   - 监控 API 使用量
   - 设置合理的超时时间

3. **数据隐私**
   - 不存储敏感用户信息
   - 匿名化对话数据
   - 遵守隐私法规

## 故障排除

### 问题：AI 不响应
**检查清单：**
- [ ] API 密钥是否正确设置
- [ ] 网络连接是否正常
- [ ] OpenAI 服务是否可用
- [ ] 环境变量是否正确加载

### 问题：推荐不准确
**检查清单：**
- [ ] 业务数据是否完整
- [ ] 关键词匹配是否正确
- [ ] 用户偏好是否正确提取
- [ ] AI 模型是否合适

### 问题：性能缓慢
**检查清单：**
- [ ] API 响应时间
- [ ] 网络延迟
- [ ] 缓存是否有效
- [ ] 请求频率是否过高

## 更新日志

### v1.0.0
- 初始 AI 集成
- 基本聊天功能
- 推荐系统
- 用户偏好提取

### 计划功能
- 多语言支持
- 语音输入
- 图像识别
- 高级推荐算法

## 支持

如果遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看控制台错误日志
3. 验证环境配置
4. 联系开发团队

---

**注意：** 确保在生产环境中正确配置所有环境变量，并定期监控 AI API 的使用情况。
