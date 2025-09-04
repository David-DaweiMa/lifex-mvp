# Android开发环境设置指南

## 🎯 **已修复的问题**

### ✅ **依赖版本兼容性**
- 修复了React 19.1.0与React Native 0.81.1的兼容性问题
- 降级React到18.2.0版本
- 更新了相关的TypeScript类型定义

### ✅ **Android配置**
- 添加了必要的权限配置：
  - 网络权限 (INTERNET, ACCESS_NETWORK_STATE)
  - 相机权限 (CAMERA)
  - 存储权限 (READ/WRITE_EXTERNAL_STORAGE)
  - 位置权限 (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
  - 通知权限 (VIBRATE, WAKE_LOCK, RECEIVE_BOOT_COMPLETED)

### ✅ **Supabase配置**
- 更新了Supabase配置以使用环境变量
- 添加了环境变量检查和警告
- 与web端配置保持一致

### ✅ **服务层实现**
- 认证服务完整实现
- AI服务完整实现，支持离线模式
- 位置服务、通知服务等基础服务

## 🛠️ **安装步骤**

### **1. 安装Android Studio**
```bash
# 下载Android Studio
https://developer.android.com/studio

# 安装时选择：
- Android SDK
- Android SDK Platform-Tools
- Android Emulator
```

### **2. 配置环境变量**
```bash
# Windows环境变量设置
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# 添加到PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### **3. 创建Android虚拟设备**
```bash
# 在Android Studio中：
1. 打开AVD Manager
2. 创建新的虚拟设备
3. 推荐配置：
   - 设备：Pixel 6
   - API Level：33 (Android 13)
   - 架构：x86_64
```

### **4. 安装项目依赖**
```bash
# 进入移动端目录
cd packages/mobile

# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 或者使用yarn
yarn install
```

### **5. 配置环境变量**
```bash
# 创建.env文件（如果需要）
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## 🚀 **运行应用**

### **启动Metro服务器**
```bash
cd packages/mobile
npm start
# 或
yarn start
```

### **运行Android应用**
```bash
# 在新终端中
cd packages/mobile
npm run android
# 或
yarn android
```

## 🔧 **故障排除**

### **常见问题**

#### **1. 构建失败**
```bash
# 清理构建缓存
cd packages/mobile/android
./gradlew clean

# 重新构建
cd ..
npm run android
```

#### **2. 模拟器启动失败**
```bash
# 检查模拟器状态
adb devices

# 重启ADB服务
adb kill-server
adb start-server
```

#### **3. 依赖冲突**
```bash
# 清理所有缓存
rm -rf node_modules
rm -rf android/app/build
rm -rf android/build
npm install
```

#### **4. 网络连接问题**
```bash
# 检查API地址配置
# 确保web端API服务正在运行
# 检查防火墙设置
```

## 📱 **功能测试**

### **基础功能**
- [ ] 应用启动
- [ ] 用户注册/登录
- [ ] AI对话功能
- [ ] 位置权限请求
- [ ] 相机功能
- [ ] 通知功能

### **高级功能**
- [ ] 离线模式
- [ ] 数据同步
- [ ] 推送通知
- [ ] 位置服务

## 📊 **性能优化**

### **构建优化**
- 启用ProGuard代码混淆
- 优化图片资源
- 减少包大小

### **运行时优化**
- 实现懒加载
- 优化内存使用
- 缓存策略

## 🔐 **安全配置**

### **生产环境**
- 更新签名密钥
- 配置网络安全
- 启用代码混淆
- 设置权限最小化原则

## 📞 **支持**

如果遇到问题，请检查：
1. Android Studio版本兼容性
2. SDK版本匹配
3. 环境变量配置
4. 网络连接状态
5. 模拟器/设备状态

---

**注意：** 此指南专门针对Windows环境下的Android开发。iOS开发需要macOS系统。
