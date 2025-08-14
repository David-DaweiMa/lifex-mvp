-- 简单的注册修复方案
-- 允许在注册时直接创建用户配置文件

-- 删除现有的 INSERT 策略
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;

-- 创建允许插入的策略
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 更新 SELECT 策略，允许通过邮箱查找
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 更新 UPDATE 策略
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 完成消息
SELECT 'Simple registration fix applied! Direct profile creation is now allowed.' as status;
