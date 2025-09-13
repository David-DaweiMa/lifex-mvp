# Monorepo完善详细实施计划

## 🎯 目标
完成核心服务提取到共享包，统一类型系统，验证无功能回归

## 📊 当前状态分析

### 已提取到共享包的服务 ✅
- `authService.ts` - 认证服务接口
- `aiService.ts` - AI服务接口  
- `quotaService.ts` - 配额服务接口
- `businessService.ts` - 商业服务接口

### 需要提取的服务 ❌
- `quotaConfig.ts` - 配额配置 (完整实现)
- `assistantPersonality.ts` - AI助手个性化 (完整实现)
- `languageDetection.ts` - 语言检测 (完整实现)
- `assistantUsage.ts` - 助手使用跟踪 (完整实现)
- `productQuota.ts` - 产品配额管理 (完整实现)
- `businessPermissions.ts` - 商业权限 (完整实现)

### 类型系统问题 ⚠️
- `packages/shared/src/types/index.ts` - 共享类型定义
- `packages/web/src/lib/types.ts` - Web包重复类型定义
- 需要合并并统一

## 📋 详细实施步骤

### 阶段1：类型系统统一 (优先级：高)

#### 1.1 分析类型冲突
```bash
# 比较两个类型文件
diff packages/shared/src/types/index.ts packages/web/src/lib/types.ts
```

#### 1.2 合并类型定义
- 保留共享包中的完整类型定义
- 将Web包中独有的类型添加到共享包
- 删除Web包中的重复类型定义

#### 1.3 更新导入引用
- 更新所有Web包文件中的类型导入
- 从 `../lib/types` 改为 `@lifex/shared`

### 阶段2：提取核心服务 (优先级：高)

#### 2.1 提取配额配置服务
```typescript
// packages/shared/src/services/quotaConfig.ts
export { QUOTA_CONFIG, ANONYMOUS_QUOTA, QuotaConfig } from './quotaConfig';
```

#### 2.2 提取AI助手相关服务
```typescript
// packages/shared/src/services/assistantPersonality.ts
export { PERSONALITY_RESPONSES, getRandomResponse } from './assistantPersonality';

// packages/shared/src/services/languageDetection.ts  
export { detectLanguage, SupportedLanguage } from './languageDetection';

// packages/shared/src/services/assistantUsage.ts
export { AssistantUsageService } from './assistantUsage';
```

#### 2.3 提取商业相关服务
```typescript
// packages/shared/src/services/productQuota.ts
export { ProductQuotaService } from './productQuota';

// packages/shared/src/services/businessPermissions.ts
export { BusinessPermissionsService } from './businessPermissions';
```

### 阶段3：更新Web包引用 (优先级：中)

#### 3.1 更新服务导入
```typescript
// 替换所有Web包中的本地服务导入
// 从: import { authService } from '../lib/authService'
// 到: import { authService } from '@lifex/shared'
```

#### 3.2 更新类型导入
```typescript
// 替换所有类型导入
// 从: import { Business } from '../lib/types'
// 到: import { Business } from '@lifex/shared'
```

### 阶段4：验证无功能回归 (优先级：高)

#### 4.1 构建测试
```bash
# 测试共享包构建
cd packages/shared
npm run build

# 测试Web包构建
cd packages/web  
npm run build

# 测试完整构建流程
npm run build:shared && cd packages/web && npm run build
```

#### 4.2 功能测试清单
- [ ] 用户认证功能
- [ ] AI聊天功能
- [ ] 配额管理功能
- [ ] 商业功能
- [ ] 商家发现功能
- [ ] 用户资料管理

#### 4.3 类型检查
```bash
# 检查类型错误
cd packages/web
npx tsc --noEmit
```

## 🚨 风险评估与缓解

### 高风险操作
1. **类型系统变更** - 可能导致类型错误
   - 缓解：逐步迁移，保留备份
   
2. **服务导入变更** - 可能导致运行时错误
   - 缓解：逐个文件更新，立即测试

3. **构建流程变更** - 可能导致构建失败
   - 缓解：先在开发环境验证

### 回滚策略
1. 保留原始Web包服务文件
2. 使用Git分支进行实验
3. 每个阶段完成后立即测试

## 📅 实施时间表

### 第1天：类型系统统一
- 分析类型冲突
- 合并类型定义
- 更新基础导入

### 第2天：服务提取
- 提取配额配置服务
- 提取AI助手服务
- 提取商业服务

### 第3天：引用更新与测试
- 更新所有导入引用
- 全面功能测试
- 修复发现的问题

## ✅ 成功标准

1. **构建成功** - 所有包都能正常构建
2. **类型检查通过** - 无TypeScript错误
3. **功能正常** - 所有核心功能工作正常
4. **代码清洁** - 无重复代码，结构清晰
5. **性能无回归** - 构建时间和运行时性能无显著下降

## 🔧 工具和命令

### 构建命令
```bash
# 构建共享包
cd packages/shared && npm run build

# 构建Web包
cd packages/web && npm run build

# 完整构建流程
npm run build:shared && cd packages/web && npm run build
```

### 测试命令
```bash
# 启动开发服务器
cd packages/web && npm run dev

# 类型检查
cd packages/web && npx tsc --noEmit

# 运行测试
npm run test
```

### 清理命令
```bash
# 清理构建缓存
rm -rf packages/*/dist
rm -rf packages/*/node_modules/.cache

# 重新安装依赖
npm run clean:install
```
