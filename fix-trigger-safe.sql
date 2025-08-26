-- 安全修复触发器以正确处理business_name字段
-- 保留原有的错误处理逻辑

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

-- 5. 创建新的函数，正确处理business_name字段，保留错误处理
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- 简化的触发器，包含business_name字段
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        full_name,
        user_type,
        business_name,  -- 添加business_name字段
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'free'),
        NEW.raw_user_meta_data->>'business_name',  -- 添加business_name字段
        false,  -- 默认未验证
        NOW(),
        NOW()
    )
    RETURNING id INTO profile_id;
    
    -- 记录成功日志
    INSERT INTO public.trigger_logs (
        trigger_name,
        user_id,
        status,
        execution_time
    ) VALUES (
        'handle_new_user',
        NEW.id,
        'success',
        NOW()
    );
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- 记录错误但不阻止用户创建
    INSERT INTO public.trigger_logs (
        trigger_name,
        user_id,
        status,
        error_message,
        execution_time
    ) VALUES (
        'handle_new_user',
        NEW.id,
        'error',
        SQLERRM,
        NOW()
    );
    
    -- 重要：不要 RAISE，让用户创建继续
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
