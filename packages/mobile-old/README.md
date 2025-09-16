# LifeX MVP Mobile App

## 📱 **支持平台**

- ✅ **Android** - 完整支持，可在Windows上开发
- ✅ **iOS** - 通过Expo Go测试，无需Mac设备

## 🚀 **快速开始**

### **Android开发（Windows）**
```bash
# 1. 安装Android Studio
# 2. 配置Android SDK
# 3. 启动应用
cd packages/mobile
npm install
npm run android
```

### **iOS测试（无需Mac）**
```bash
# 1. 在iPhone上安装Expo Go应用
# 2. 启动开发服务器
cd packages/mobile
npm install
npm run expo
# 3. 扫描二维码测试
```

## 🛠️ **开发环境**

### **Windows开发环境：**
- Node.js >= 18
- Android Studio (Android开发)
- Expo CLI (iOS测试)

### **测试设备：**
- Android手机/模拟器
- iPhone + Expo Go应用

## 📋 **功能特性**

### **核心功能：**
- 用户认证系统
- AI智能对话
- 个性化推荐
- 位置服务
- 相机功能
- 推送通知

### **技术栈：**
- React Native 0.81.1
- TypeScript
- Supabase
- Expo SDK
- AsyncStorage

## 🔧 **项目结构**

```
packages/mobile/
├── src/
│   ├── components/     # React组件
│   ├── services/       # 业务逻辑服务
│   └── lib/           # 工具库
├── android/           # Android原生代码
├── ios/              # iOS原生代码
├── assets/           # 静态资源
├── app.json          # 应用配置
└── expo.json         # Expo配置
```

## 📖 **详细指南**

- [Android开发指南](./ANDROID_SETUP_GUIDE.md)
- [iOS测试指南](./IOS_TESTING_GUIDE.md)

## 🚀 **启动脚本**

### **Windows批处理：**
```bash
# 双击运行
start-expo.bat
```

### **PowerShell：**
```bash
# 右键运行
start-expo.ps1
```

## 🔍 **故障排除**

### **常见问题：**
1. **依赖安装失败** - 清理node_modules重新安装
2. **Android构建失败** - 检查Android Studio配置
3. **Expo连接失败** - 确保网络连接正常
4. **功能不工作** - 检查权限配置

### **获取帮助：**
- 查看详细指南文档
- 检查控制台错误日志
- 验证环境配置

## 📊 **开发状态**

- ✅ 基础架构完成
- ✅ Android配置完成
- ✅ iOS Expo支持完成
- ✅ 核心功能实现
- 🔄 持续测试和优化

---

**注意：** 此项目支持在Windows上开发Android和iOS应用，iOS测试通过Expo Go实现，无需Mac设备。