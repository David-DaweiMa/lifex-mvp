-- 修复 user_profiles 表的 RLS 策略问题
-- 确保触发器可以正常插入用户配置文件

-- ========================================
-- 第一步：删除现有的 RLS 策略
-- ========================================

-- 删除 user_profiles 表的所有现有 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

-- ========================================
-- 第二步：重新创建正确的 RLS 策略
-- ========================================

-- 确保 RLS 已启用
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建新的 RLS 策略，确保触发器可以正常工作

-- 1. 允许用户查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 2. 允许用户更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. 允许用户插入自己的配置文件（用于触发器）
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. 允许服务角色管理所有配置文件（包括触发器操作）
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 5. 允许触发器函数插入（关键修复）
CREATE POLICY "Allow trigger function insert" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- 6. 允许触发器函数更新
CREATE POLICY "Allow trigger function update" ON public.user_profiles
    FOR UPDATE USING (true) WITH CHECK (true);

-- ========================================
-- 第三步：验证修复
-- ========================================

-- 检查 RLS 策略是否创建成功
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
WHERE schemaname = 'public' AND tablename = 'user_profiles'
ORDER BY policyname;

-- 检查触发器是否存在
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 检查触发器函数是否存在
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- ========================================
-- 第四步：测试触发器（可选）
-- ========================================

/*
-- 取消注释以执行测试
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    test_email := 'test-rls-fix-' || extract(epoch from now()) || '@example.com';
    
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
        '{"username": "testrlsfix", "full_name": "Test RLS Fix User", "user_type": "free"}'::jsonb,
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Test user created: %', test_user_id;
    
    -- 等待触发器执行
    PERFORM pg_sleep(2);
    
    -- 检查用户配置文件是否创建成功
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ 用户配置文件创建成功！RLS 策略修复有效。';
    ELSE
        RAISE NOTICE '❌ 用户配置文件创建失败！需要进一步检查。';
    END IF;
    
    -- 清理测试数据
    DELETE FROM auth.users WHERE id = test_user_id;
    
END $$;
*/
