-- 测试触发器修复后的功能
-- 这个测试会创建一个用户并检查配置文件是否被正确创建

-- ========================================
-- 测试触发器是否工作
-- ========================================

DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
    profile_exists BOOLEAN;
    token_exists BOOLEAN;
BEGIN
    -- 生成测试邮箱
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
    PERFORM pg_sleep(2);
    
    -- 检查用户配置文件是否创建
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = test_user_id) INTO profile_exists;
    
    -- 检查邮件确认token是否创建
    SELECT EXISTS(SELECT 1 FROM public.email_confirmations WHERE user_id = test_user_id) INTO token_exists;
    
    -- 输出结果
    IF profile_exists THEN
        RAISE NOTICE '✅ 用户配置文件创建成功！';
        
        -- 显示配置文件详情
        RAISE NOTICE '配置文件详情:';
        RAISE NOTICE '  - 邮箱: %', (SELECT email FROM public.user_profiles WHERE id = test_user_id);
        RAISE NOTICE '  - 用户名: %', (SELECT username FROM public.user_profiles WHERE id = test_user_id);
        RAISE NOTICE '  - 用户类型: %', (SELECT user_type FROM public.user_profiles WHERE id = test_user_id);
        RAISE NOTICE '  - 邮箱验证状态: %', (SELECT email_verified FROM public.user_profiles WHERE id = test_user_id);
        RAISE NOTICE '  - 验证过期时间: %', (SELECT email_verification_expires_at FROM public.user_profiles WHERE id = test_user_id);
    ELSE
        RAISE NOTICE '❌ 用户配置文件创建失败！';
    END IF;
    
    IF token_exists THEN
        RAISE NOTICE '✅ 邮件确认token创建成功！';
        
        -- 显示token详情
        RAISE NOTICE 'Token详情:';
        RAISE NOTICE '  - Token类型: %', (SELECT token_type FROM public.email_confirmations WHERE user_id = test_user_id LIMIT 1);
        RAISE NOTICE '  - 过期时间: %', (SELECT expires_at FROM public.email_confirmations WHERE user_id = test_user_id LIMIT 1);
        RAISE NOTICE '  - 使用状态: %', (SELECT used_at FROM public.email_confirmations WHERE user_id = test_user_id LIMIT 1);
    ELSE
        RAISE NOTICE '❌ 邮件确认token创建失败！';
    END IF;
    
    -- 清理测试数据
    DELETE FROM public.email_confirmations WHERE user_id = test_user_id;
    DELETE FROM public.user_profiles WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE '测试数据已清理';
    
    -- 最终结果
    IF profile_exists AND token_exists THEN
        RAISE NOTICE '🎉 触发器测试完全成功！注册流程应该可以正常工作了。';
    ELSIF profile_exists THEN
        RAISE NOTICE '⚠️  配置文件创建成功，但token创建失败。';
    ELSIF token_exists THEN
        RAISE NOTICE '⚠️  Token创建成功，但配置文件创建失败。';
    ELSE
        RAISE NOTICE '❌ 触发器测试失败，需要进一步检查。';
    END IF;
    
END $$;
