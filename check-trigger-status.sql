-- 检查触发器状态和配置
-- 诊断为什么触发器仍然无法正常工作

-- ========================================
-- 第一步：检查触发器绑定
-- ========================================

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ========================================
-- 第二步：检查触发器函数
-- ========================================

SELECT 
    routine_name,
    routine_type,
    security_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- ========================================
-- 第三步：检查表结构
-- ========================================

-- 检查 user_profiles 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ========================================
-- 第四步：检查RLS状态
-- ========================================

-- 检查 RLS 是否启用
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- ========================================
-- 第五步：测试触发器（可选）
-- ========================================

/*
-- 取消注释以执行测试
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
    profile_count INTEGER;
BEGIN
    test_email := 'test-trigger-' || extract(epoch from now()) || '@example.com';
    
    RAISE NOTICE '开始测试触发器...';
    RAISE NOTICE '测试邮箱: %', test_email;
    
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
        test_email,
        crypt('TestPassword123!', gen_salt('bf')),
        NULL,
        '{"username": "testtrigger", "full_name": "Test Trigger User", "user_type": "free"}'::jsonb,
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE '测试用户创建成功，ID: %', test_user_id;
    
    -- 等待触发器执行
    RAISE NOTICE '等待触发器执行...';
    PERFORM pg_sleep(3);
    
    -- 检查用户配置文件是否创建成功
    SELECT COUNT(*) INTO profile_count
    FROM public.user_profiles 
    WHERE id = test_user_id;
    
    IF profile_count > 0 THEN
        RAISE NOTICE '✅ 用户配置文件创建成功！';
        
        -- 显示创建的配置文件
        SELECT 
            id,
            email,
            username,
            user_type,
            email_verified,
            created_at
        FROM public.user_profiles 
        WHERE id = test_user_id;
        
    ELSE
        RAISE NOTICE '❌ 用户配置文件创建失败！';
        
        -- 检查触发器日志
        SELECT 
            trigger_name,
            status,
            error_message,
            execution_time
        FROM public.trigger_logs 
        WHERE user_id = test_user_id
        ORDER BY execution_time DESC;
    END IF;
    
    -- 清理测试数据
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '测试完成，已清理测试数据';
    
END $$;
*/

-- ========================================
-- 第六步：检查触发器日志
-- ========================================

-- 查看最近的触发器执行日志
SELECT 
    trigger_name,
    user_id,
    status,
    error_message,
    execution_time,
    created_at
FROM public.trigger_logs 
ORDER BY execution_time DESC 
LIMIT 10;
