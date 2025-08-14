-- 完全禁用 RLS 以解决注册问题
-- 这是一个临时解决方案，用于开发环境

-- 1. 检查当前 RLS 状态
SELECT 'Current RLS status:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 2. 完全禁用 user_profiles 表的 RLS
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. 删除所有 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.user_profiles;

-- 4. 验证 RLS 已禁用
SELECT 'RLS status after disabling:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 5. 验证没有策略
SELECT 'Remaining policies:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. 完成消息
SELECT 'RLS completely disabled! User registration should now work without any restrictions.' as status;
