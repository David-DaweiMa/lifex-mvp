-- 创建 Supabase Auth 触发器来自动处理用户配置文件
-- 这个方案避免了 RLS 问题，因为触发器在系统级别运行

-- 首先，创建一个函数来处理新用户注册
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 为新用户创建配置文件
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    user_type,
    is_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'customer',
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，当 auth.users 表有新用户时自动执行
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新 user_profiles 表的 RLS 策略
-- 删除现有的策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;

-- 创建新的安全策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 不允许直接插入，只能通过触发器
CREATE POLICY "No direct inserts allowed" ON public.user_profiles
  FOR INSERT WITH CHECK (false);

-- 完成消息
SELECT 'Auth trigger created successfully! User profiles will be created automatically.' as status;
