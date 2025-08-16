-- 专门修复 user_profiles 表的 RLS 策略
-- 解决注册时配置文件创建失败的问题

-- 1. 先删除现有的策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;

-- 2. 创建新的策略，允许在注册时创建配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 关键：允许任何插入操作，因为触发器和服务角色需要创建配置文件
CREATE POLICY "Allow all profile creation" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 3. 确保 RLS 已启用
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. 完成消息
SELECT 'User profiles RLS policies have been fixed!' as status;
