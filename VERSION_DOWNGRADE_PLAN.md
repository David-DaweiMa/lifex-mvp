# LifeX MVP 版本降级计划

## 🎯 **目标版本配置**

### **当前问题版本**
- React Native: 0.74.5 ❌
- Expo SDK: 51.0.0 ❌
- React: 18.2.0 ✅

### **建议稳定版本**
- React Native: 0.72.15 ✅
- Expo SDK: 49.0.0 ✅
- React: 18.2.0 ✅

## 📋 **降级步骤**

### **步骤1: 更新package.json**
```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "react-native": "0.72.15",
    "@expo/metro-runtime": "~2.4.1",
    "expo-camera": "~13.4.4",
    "expo-location": "~16.1.0",
    "expo-status-bar": "~1.6.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@react-native/babel-preset": "0.72.11",
    "@react-native/eslint-config": "0.72.2",
    "@react-native/metro-config": "0.72.11",
    "@react-native/typescript-config": "0.72.2"
  }
}
```

### **步骤2: 更新Babel配置**
```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
};
```

### **步骤3: 更新Metro配置**
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### **步骤4: 清理和重装**
```bash
# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

# 清理Expo缓存
npx expo start --clear
```

## ⚠️ **注意事项**

1. **API变更**: Expo SDK 49与51之间有API变更
2. **依赖兼容性**: 某些第三方库可能需要降级
3. **功能测试**: 降级后需要重新测试所有功能
4. **文档更新**: 需要更新相关文档和配置

## 🔄 **回滚计划**

如果降级后出现新问题：
1. 恢复原始package.json
2. 重新安装依赖
3. 考虑其他解决方案（如使用React Native CLI）
