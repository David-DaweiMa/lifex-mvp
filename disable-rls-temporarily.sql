-- 临时禁用 RLS 以解决注册问题
-- 注意：这仅用于开发环境，生产环境需要更安全的策略

-- 禁用 user_profiles 表的 RLS
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 验证 RLS 已禁用
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 完成消息
SELECT 'RLS temporarily disabled for user_profiles table. Remember to re-enable with proper policies later!' as status;
