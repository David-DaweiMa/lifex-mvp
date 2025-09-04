# iOS测试指南 - 无需Mac设备

## 🎯 **概述**

本指南将帮助您在**Windows系统上开发**，然后在**iPhone上测试**iOS应用，无需Mac设备。

## 📱 **测试方式对比**

| 方式 | 需要Mac | 成本 | 难度 | 推荐度 |
|------|---------|------|------|--------|
| Expo Go | ❌ | 免费 | ⭐ | ⭐⭐⭐⭐⭐ |
| TestFlight | ❌ | $99/年 | ⭐⭐ | ⭐⭐⭐⭐ |
| 真机调试 | ✅ | 免费 | ⭐⭐⭐ | ⭐⭐⭐ |

## 🚀 **方式1：Expo Go测试（推荐）**

### **优势：**
- ✅ 完全免费
- ✅ 无需Mac设备
- ✅ 实时热重载
- ✅ 简单易用
- ✅ 支持大部分功能

### **步骤：**

#### **1. 安装Expo Go应用**
```bash
# 在iPhone上从App Store安装
搜索: "Expo Go"
安装: Expo Go by Expo
```

#### **2. 启动开发服务器**
```bash
# 在Windows上
cd packages/mobile
npm install
npm run expo
```

#### **3. 连接测试**
```bash
# 方法1: 扫描二维码
# 在Expo Go中点击"Scan QR Code"
# 扫描终端显示的二维码

# 方法2: 输入URL
# 在Expo Go中点击"Enter URL manually"
# 输入: exp://192.168.x.x:8081
```

#### **4. 实时测试**
- 修改代码后自动刷新
- 支持调试和日志查看
- 可以测试大部分功能

## 🎯 **方式2：TestFlight分发**

### **优势：**
- ✅ 接近生产环境
- ✅ 支持大量测试用户
- ✅ 自动更新
- ✅ 崩溃报告
- ✅ 无需Mac开发

### **步骤：**

#### **1. 注册Apple Developer账户**
```bash
# 访问: https://developer.apple.com
# 注册: $99/年
# 验证: 身份验证
```

#### **2. 使用EAS Build构建**
```bash
# 安装EAS CLI
npm install -g eas-cli

# 登录Expo账户
eas login

# 配置构建
eas build:configure

# 构建iOS应用
eas build --platform ios
```

#### **3. 上传到App Store Connect**
```bash
# 构建完成后下载.ipa文件
# 上传到App Store Connect
# 配置TestFlight测试
```

#### **4. 邀请测试用户**
```bash
# 在App Store Connect中
# 添加测试用户邮箱
# 发送测试邀请
```

## 🛠️ **开发环境配置**

### **Windows开发环境：**
```bash
# 1. 安装Node.js (>=18)
# 2. 安装Expo CLI
npm install -g @expo/cli

# 3. 安装项目依赖
cd packages/mobile
npm install

# 4. 启动开发服务器
npm run expo
```

### **iPhone测试环境：**
```bash
# 1. 安装Expo Go应用
# 2. 确保网络连接
# 3. 扫描二维码或输入URL
```

## 📋 **功能测试清单**

### **基础功能：**
- [ ] 应用启动
- [ ] 用户界面显示
- [ ] 导航功能
- [ ] 用户认证
- [ ] AI对话功能

### **高级功能：**
- [ ] 位置服务
- [ ] 相机功能
- [ ] 推送通知
- [ ] 数据同步
- [ ] 离线模式

### **性能测试：**
- [ ] 启动速度
- [ ] 内存使用
- [ ] 网络请求
- [ ] 电池消耗

## 🔧 **故障排除**

### **常见问题：**

#### **1. 无法连接Expo Go**
```bash
# 检查网络连接
# 确保在同一WiFi网络
# 检查防火墙设置
# 尝试重启开发服务器
```

#### **2. 功能不工作**
```bash
# 检查Expo Go版本
# 更新到最新版本
# 检查依赖兼容性
# 查看错误日志
```

#### **3. 构建失败**
```bash
# 检查EAS配置
# 验证Apple Developer账户
# 检查证书和配置文件
# 查看构建日志
```

## 📊 **成本分析**

### **免费方案：**
- Expo Go测试
- 基础功能开发
- 个人项目测试

### **付费方案：**
- Apple Developer: $99/年
- EAS Build: 免费额度 + 付费
- 完整iOS功能支持

## 🎯 **推荐流程**

### **开发阶段：**
1. **使用Expo Go** - 快速原型和功能测试
2. **本地开发** - 在Windows上编写代码
3. **实时测试** - 在iPhone上验证功能

### **测试阶段：**
1. **内部测试** - 使用Expo Go
2. **Beta测试** - 使用TestFlight
3. **用户测试** - 邀请真实用户

### **发布阶段：**
1. **构建应用** - 使用EAS Build
2. **提交审核** - 通过App Store Connect
3. **发布上线** - 正式发布到App Store

## 📞 **技术支持**

### **Expo相关：**
- 官方文档: https://docs.expo.dev
- 社区论坛: https://forums.expo.dev
- GitHub: https://github.com/expo/expo

### **Apple相关：**
- 开发者文档: https://developer.apple.com/documentation
- 技术支持: https://developer.apple.com/support

---

**总结：** 您完全可以在Windows上开发iOS应用，并通过Expo Go在iPhone上测试，无需Mac设备！
