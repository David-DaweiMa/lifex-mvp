-- 修复RLS策略脚本
-- 解决用户配置文件创建失败的问题
-- 错误: new row violates row-level security policy for table "user_profiles"

-- 1. 首先检查当前的RLS策略
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
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 2. 删除现有的RLS策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

-- 3. 重新创建正确的RLS策略

-- 策略1: 允许用户查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 策略2: 允许用户更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 策略3: 允许插入配置文件（关键修复）
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 策略4: 允许服务角色管理所有配置文件
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 4. 确保RLS已启用
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 验证策略是否正确创建
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
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY policyname;

-- 6. 测试触发器函数权限
-- 确保触发器函数有正确的权限来插入用户配置文件

-- 检查触发器函数是否存在
SELECT 
    routine_name,
    routine_type,
    security_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 如果触发器函数不存在，重新创建它
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 记录触发器执行
    INSERT INTO public.trigger_logs (
        trigger_name,
        user_id,
        execution_time,
        status,
        error_message
    ) VALUES (
        'handle_new_user',
        NEW.id,
        NOW(),
        'started',
        NULL
    );
    
    -- 创建用户配置文件
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        full_name,
        user_type,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'free'),
        NOW(),
        NOW()
    );
    
    -- 设置用户配额
    PERFORM public.setup_user_quotas(NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_type', 'free'));
    
    -- 更新触发器日志为成功
    UPDATE public.trigger_logs 
    SET status = 'success', execution_time = NOW()
    WHERE trigger_name = 'handle_new_user' 
    AND user_id = NEW.id 
    AND status = 'started';
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    UPDATE public.trigger_logs 
    SET status = 'error', 
        error_message = SQLERRM,
        execution_time = NOW()
    WHERE trigger_name = 'handle_new_user' 
    AND user_id = NEW.id 
    AND status = 'started';
    
    -- 如果没有找到记录，插入错误记录
    IF NOT FOUND THEN
        INSERT INTO public.trigger_logs (
            trigger_name,
            user_id,
            execution_time,
            status,
            error_message
        ) VALUES (
            'handle_new_user',
            NEW.id,
            NOW(),
            'error',
            SQLERRM
        );
    END IF;
    
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 确保触发器正确绑定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. 验证修复结果
-- 检查触发器是否正确绑定
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 检查函数权限
SELECT 
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 9. 测试修复（可选）
-- 可以手动测试触发器是否工作
-- 注意：这会创建一个测试用户，测试后需要清理

/*
-- 测试代码（取消注释以执行测试）
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- 创建测试用户
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'test-rls-fix-' || extract(epoch from now()) || '@example.com',
        crypt('TestPassword123!', gen_salt('bf')),
        now(),
        '{"username": "testrls", "full_name": "Test RLS Fix", "user_type": "free"}'::jsonb,
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    -- 等待触发器执行
    PERFORM pg_sleep(2);
    
    -- 检查结果
    RAISE NOTICE 'Test user created with ID: %', test_user_id;
    
    -- 清理测试数据
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'RLS fix test completed successfully';
END $$;
*/

-- 10. 最终验证
-- 检查所有相关组件是否正常工作
SELECT 'RLS Policies' as component, count(*) as count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles'
UNION ALL
SELECT 'Trigger Function' as component, count(*) as count FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public'
UNION ALL
SELECT 'Trigger Binding' as component, count(*) as count FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 'RLS Enabled' as component, CASE WHEN relrowsecurity THEN 1 ELSE 0 END as count FROM pg_class WHERE relname = 'user_profiles';
