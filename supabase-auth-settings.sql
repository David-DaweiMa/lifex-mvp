-- 配置Supabase认证设置（开发环境）
-- 注意：这些设置仅用于开发测试，生产环境需要重新配置

-- 1. 检查当前认证设置
SELECT 
    key,
    value
FROM auth.config
WHERE key IN ('enable_signup', 'enable_confirmations', 'enable_email_change_confirmations');

-- 2. 临时禁用邮件确认（仅用于开发）
-- 注意：这需要管理员权限，如果无法执行，请在Supabase Dashboard中手动设置

-- 3. 创建测试用户（绕过邮件确认）
-- 这个方法直接创建用户配置文件，不依赖Supabase Auth
INSERT INTO public.user_profiles (
  email,
  username,
  full_name,
  user_type,
  is_verified,
  is_active
) VALUES (
  'test@lifex.com',
  'testuser',
  'Test User',
  'customer',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- 完成消息
SELECT 'Test user created directly in user_profiles table' as status;
