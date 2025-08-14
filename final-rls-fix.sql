-- 最终 RLS 修复方案
-- 彻底解决用户注册问题

-- 1. 首先检查当前的 RLS 策略
SELECT 'Current RLS policies:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 2. 删除所有现有的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;

-- 3. 创建新的、更宽松的策略
-- 允许插入（用于注册）
CREATE POLICY "Allow profile creation" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 允许查看（用户只能查看自己的配置文件）
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 允许更新（用户只能更新自己的配置文件）
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 4. 验证新策略
SELECT 'New RLS policies:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. 完成消息
SELECT 'Final RLS fix applied! User registration should now work.' as status;
