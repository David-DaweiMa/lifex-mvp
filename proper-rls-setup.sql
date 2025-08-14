-- 正确的 RLS 设置
-- 允许 service_role 绕过 RLS，但限制普通用户访问

-- 1. 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.user_profiles;

-- 3. 创建正确的策略
-- 允许用户查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- 允许用户更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 不允许普通用户直接插入（只有 service_role 可以）
CREATE POLICY "No direct inserts for users" ON public.user_profiles
  FOR INSERT WITH CHECK (false);

-- 4. 验证策略
SELECT 'RLS policies created:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. 完成消息
SELECT 'Proper RLS setup complete! Service role can insert, users can only access own data.' as status;
