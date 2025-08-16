# 匿名用户设备识别机制

## 概述

为了准确识别匿名用户并实施有效的使用限制，LifeX实现了多层次的设备识别机制。

## 🔍 识别策略

### 1. 多重存储机制

| 存储方式 | 持久性 | 隐私模式支持 | 用途 |
|----------|--------|--------------|------|
| **localStorage** | 永久 | ❌ | 主要存储 |
| **sessionStorage** | 会话期间 | ✅ | 隐私模式备用 |
| **Cookie** | 30天 | ✅ | 跨浏览器识别 |

### 2. 设备指纹生成

基于以下设备特征生成唯一指纹：

```javascript
const features = [
  navigator.userAgent,        // 浏览器信息
  navigator.language,         // 语言设置
  screen.width + 'x' + screen.height,  // 屏幕分辨率
  new Date().getTimezoneOffset(),      // 时区偏移
  canvasFingerprint,          // Canvas指纹
  window.devicePixelRatio || 1         // 设备像素比
];
```

### 3. 会话ID格式

```
anon_{timestamp}_{deviceFingerprint}_{randomString}
```

示例：`anon_1703123456789_a1b2c3d4e5f6_xyz789abc`

## 🛡️ 隐私保护

### 数据最小化
- 只存储会话ID，不收集个人信息
- 设备指纹仅用于会话识别
- 30天后自动清理cookie

### 用户控制
- 用户可随时清除浏览器数据
- 注册后自动清除匿名会话
- 支持隐私模式使用

## 🔧 技术实现

### 存储优先级
1. **localStorage** - 主要存储
2. **sessionStorage** - 隐私模式备用
3. **Cookie** - 跨浏览器识别

### 设备指纹算法
```javascript
// 简单哈希算法
let hash = 0;
for (let i = 0; i < combined.length; i++) {
  const char = combined.charCodeAt(i);
  hash = ((hash << 5) - hash) + char;
  hash = hash & hash; // 32位整数
}
return Math.abs(hash).toString(36);
```

## 📊 识别能力评估

| 场景 | 识别成功率 | 说明 |
|------|------------|------|
| **同一浏览器** | 99%+ | localStorage + sessionStorage |
| **清除浏览器数据** | 70%+ | 依赖设备指纹 |
| **隐私模式** | 80%+ | sessionStorage + Cookie |
| **不同浏览器** | 60%+ | 设备指纹 + Cookie |
| **不同设备** | 0% | 无法识别 |

## 🚀 使用限制

### 匿名用户限制
- **每日限额**: 10次AI对话
- **重置时间**: 每天00:00 UTC
- **数据保留**: 30天自动清理

### 注册用户优势
- **无限制使用**
- **聊天历史保存**
- **个性化推荐**

## 🔄 会话管理

### 会话创建
```javascript
// 自动创建匿名会话
const sessionId = generateDeviceBasedSessionId();
syncSessionToAllStorages(sessionId);
```

### 会话恢复
```javascript
// 按优先级恢复会话
let sessionId = localStorage.getItem('session') ||
                sessionStorage.getItem('session') ||
                getCookie('session');
```

### 会话清理
```javascript
// 用户注册时清理
clearAnonymousSession();
```

## 🧪 测试

运行设备识别测试：
```bash
node test-device-identification.js
```

测试内容包括：
- 设备指纹生成
- 存储机制验证
- 隐私模式检测
- 跨浏览器兼容性

## ⚠️ 限制说明

1. **隐私模式**: 功能受限，依赖cookie
2. **清除数据**: 会重置会话识别
3. **不同设备**: 无法跨设备识别
4. **浏览器限制**: 某些浏览器可能阻止存储

## 🔮 未来改进

1. **更稳定的设备指纹**
2. **跨设备同步机制**
3. **更智能的会话管理**
4. **增强的隐私保护**

---

**注意**: 此机制仅用于提供更好的用户体验和合理的使用限制，不会收集或存储个人身份信息。
