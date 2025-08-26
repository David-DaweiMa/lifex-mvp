-- 修复触发器以正确处理business_name字段

-- 1. 首先检查现有的触发器
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles' 
AND event_object_schema = 'public';

-- 2. 检查handle_new_user函数
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. 删除现有的触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. 删除现有的函数（如果存在）
DROP FUNCTION IF EXISTS handle_new_user();

-- 5. 创建新的函数，正确处理business_name字段
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, email, username, full_name, user_type, business_name, email_verified, created_at, updated_at
  ) VALUES (
    NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.raw_user_meta_data->>'business_name',  -- 添加business_name字段
    NEW.email_confirmed_at IS NOT NULL,
    NEW.created_at, NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. 验证触发器创建成功
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles' 
AND event_object_schema = 'public';
