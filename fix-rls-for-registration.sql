-- 修复 RLS 策略以允许用户注册
-- 这个脚本修改 user_profiles 表的 RLS 策略

-- 删除现有的 INSERT 策略
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- 创建新的 INSERT 策略，允许插入（用于注册）
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 更新 SELECT 策略，允许用户查看自己的配置文件
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 更新 UPDATE 策略，允许用户更新自己的配置文件
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- 完成消息
SELECT 'RLS policies updated to allow user registration!' as status;
