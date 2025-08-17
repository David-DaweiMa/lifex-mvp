-- 简单触发器测试 - 使用SELECT显示结果
-- 这个测试会创建用户并直接查询结果

-- ========================================
-- 第一步：创建测试用户
-- ========================================

-- 创建测试用户并获取ID
WITH test_user AS (
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
        'test-' || extract(epoch from now()) || '@example.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NULL,
        '{"username": "testuser", "full_name": "Test User", "user_type": "free"}'::jsonb,
        now(),
        now()
    ) RETURNING id, email
)
SELECT 
    '用户创建成功' as status,
    id as user_id,
    email as user_email
FROM test_user;

-- ========================================
-- 第二步：等待2秒让触发器执行
-- ========================================

SELECT pg_sleep(2) as waiting;

-- ========================================
-- 第三步：检查用户配置文件是否创建
-- ========================================

SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.user_profiles WHERE id = (
            SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1
        )) THEN '✅ 用户配置文件创建成功'
        ELSE '❌ 用户配置文件创建失败'
    END as profile_status,
    
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.email_confirmations WHERE user_id = (
            SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1
        )) THEN '✅ 邮件确认token创建成功'
        ELSE '❌ 邮件确认token创建失败'
    END as token_status;

-- ========================================
-- 第四步：显示配置文件详情
-- ========================================

SELECT 
    up.id,
    up.email,
    up.username,
    up.user_type,
    up.email_verified,
    up.email_verification_expires_at,
    '配置文件详情' as info_type
FROM public.user_profiles up
WHERE up.id = (
    SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1
);

-- ========================================
-- 第五步：显示token详情
-- ========================================

SELECT 
    ec.user_id,
    ec.email,
    ec.token_type,
    ec.expires_at,
    ec.used_at,
    'Token详情' as info_type
FROM public.email_confirmations ec
WHERE ec.user_id = (
    SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1
);

-- ========================================
-- 第六步：清理测试数据
-- ========================================

-- 删除测试数据
DELETE FROM public.email_confirmations 
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1);

DELETE FROM public.user_profiles 
WHERE id = (SELECT id FROM auth.users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1);

DELETE FROM auth.users 
WHERE email LIKE 'test-%' AND created_at > now() - interval '5 minutes';

SELECT '测试数据已清理' as cleanup_status;
