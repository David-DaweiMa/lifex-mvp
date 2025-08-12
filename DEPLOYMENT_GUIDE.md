# LifeX 部署指南 - 解决CSS样式丢失问题

## 问题描述
部署后CSS样式丢失，页面显示为基础HTML结构，没有样式。

## 解决方案

### 1. 已修复的配置问题

#### Tailwind CSS 配置优化
- ✅ 更新了 `tailwind.config.js` 的 `content` 路径
- ✅ 添加了完整的 `safelist` 确保关键样式不被清除
- ✅ 优化了自定义颜色和主题配置

#### Next.js 配置优化
- ✅ 简化了 `next.config.js` 配置
- ✅ 移除了不兼容的选项
- ✅ 添加了必要的安全头部配置

#### CSS 文件优化
- ✅ 更新了 `globals.css` 确保基础样式可用
- ✅ 添加了 `@layer` 指令优化CSS结构
- ✅ 添加了关键样式的备用定义

### 2. 部署步骤

#### 本地测试
```bash
# 清理之前的构建
npm run clean

# 安装依赖
npm install

# 构建项目
npm run build

# 测试生产构建
npm run start
```

#### Vercel 部署
1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（参考 `env.example`）
4. 部署

#### 其他平台部署
1. 运行 `npm run build`
2. 上传 `.next` 文件夹和 `package.json`
3. 配置环境变量
4. 运行 `npm start`

### 3. 环境变量配置

确保在部署平台设置以下环境变量：

```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

# 可选的环境变量
NEXT_PUBLIC_APP_URL=your_deployment_url
NODE_ENV=production
```

### 4. 验证部署

部署后检查以下项目：

#### 样式检查
- [ ] 页面背景是否为深色渐变
- [ ] 文字颜色是否正确（白色/灰色）
- [ ] 按钮和卡片是否有正确的背景色
- [ ] 自定义颜色（紫色、绿色等）是否显示

#### 功能检查
- [ ] 所有页面路由是否正常
- [ ] 导航是否工作
- [ ] 响应式设计是否正常

### 5. 常见问题解决

#### 如果样式仍然丢失
1. 检查浏览器控制台是否有CSS加载错误
2. 确认 `.next/static/css/` 文件夹中有CSS文件
3. 检查网络请求中CSS文件是否返回200状态码

#### 如果构建失败
1. 确保 Node.js 版本 >= 18.0.0
2. 清理 `.next` 文件夹重新构建
3. 检查 `package-lock.json` 是否最新

#### 如果环境变量问题
1. 确认所有必需的环境变量已设置
2. 检查环境变量名称是否正确
3. 重启部署服务

### 6. 性能优化

#### 已实施的优化
- ✅ CSS 压缩和优化
- ✅ 静态资源优化
- ✅ 图片优化配置
- ✅ 代码分割

#### 进一步优化建议
- 使用 CDN 加速静态资源
- 启用 gzip 压缩
- 配置缓存策略

### 7. 监控和维护

#### 部署后监控
- 检查页面加载速度
- 监控错误日志
- 验证功能完整性

#### 定期维护
- 更新依赖包
- 检查安全漏洞
- 优化性能

## 联系支持

如果仍然遇到问题：
1. 检查构建日志
2. 查看浏览器开发者工具
3. 验证环境变量配置
4. 确认部署平台设置
