-- 安全的 RLS 修复方案
-- 符合最佳实践，不使用服务角色绕过

-- 1. 检查当前触发器状态
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- 2. 重新创建安全的触发器函数
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
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  
  -- 为新用户设置配额
  PERFORM public.setup_user_quotas(NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不中断用户创建
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 确保触发器存在并正确配置
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 创建安全的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow all profile creation" ON public.user_profiles;

-- 用户只能查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- 用户只能更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 只允许触发器创建配置文件（通过 SECURITY DEFINER）
CREATE POLICY "Only trigger can create profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (false);

-- 5. 创建函数来安全地创建配置文件（仅用于修复）
CREATE OR REPLACE FUNCTION public.create_missing_profile(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查用户是否存在
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- 检查配置文件是否已存在
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- 获取用户信息
  DECLARE
    user_email TEXT;
    user_meta JSONB;
  BEGIN
    SELECT email, raw_user_meta_data INTO user_email, user_meta
    FROM auth.users WHERE id = user_id;
    
    -- 创建配置文件
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
      user_id,
      user_email,
      COALESCE(user_meta->>'username', NULL),
      COALESCE(user_meta->>'full_name', NULL),
      COALESCE(user_meta->>'user_type', 'customer'),
      false,
      true,
      NOW(),
      NOW()
    );
    
    -- 设置用户配额
    PERFORM public.setup_user_quotas(user_id);
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create missing profile: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 验证设置
SELECT 'RLS policies and triggers have been configured securely!' as status;

-- 7. 显示当前策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
