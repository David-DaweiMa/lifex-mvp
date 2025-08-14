-- 标准的 Supabase Auth 触发器设置
-- 这是业界常见的最佳实践

-- 1. 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 设置标准的 RLS 策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts for users" ON public.user_profiles;

-- 创建标准策略
-- 用户只能查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- 用户只能更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 不允许直接插入（只有触发器可以）
CREATE POLICY "No direct inserts" ON public.user_profiles
  FOR INSERT WITH CHECK (false);

-- 4. 验证设置
SELECT 'Standard auth trigger created successfully!' as status;
SELECT 'Trigger function:' as info, routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
SELECT 'Trigger:' as info, trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
SELECT 'RLS policies:' as info, policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
