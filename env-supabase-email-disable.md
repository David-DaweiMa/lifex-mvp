# 通过环境变量禁用Supabase邮件

## 在Supabase项目设置中添加环境变量

1. **登录Supabase Dashboard**
2. **进入项目设置**
   - 点击左侧菜单 **Settings**
   - 选择 **General**

3. **添加环境变量**
   在 **Environment Variables** 部分添加：

   ```
   DISABLE_SIGNUP_CONFIRMATION_EMAIL=true
   ENABLE_EMAIL_CONFIRMATIONS=false
   ```

4. **或者在Vercel中添加**
   如果使用Vercel部署，在Vercel项目设置中添加：

   ```
   NEXT_PUBLIC_DISABLE_SUPABASE_EMAILS=true
   ```

## 验证是否生效

1. **重新测试注册**
2. **检查是否只收到一封邮件**
3. **确认邮件是我们的自定义模板**

## 注意事项

- 环境变量可能需要重启应用才能生效
- 某些Supabase版本可能不支持通过环境变量禁用邮件
- 建议优先使用Dashboard方法
