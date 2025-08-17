-- 修复 generate_email_token 函数中的列引用歧义问题
-- 错误: column reference "user_id" is ambiguous

-- ========================================
-- 第一步：删除有问题的函数
-- ========================================

DROP FUNCTION IF EXISTS public.generate_email_token(uuid, text, text, integer) CASCADE;

-- ========================================
-- 第二步：重新创建修复后的函数
-- ========================================

CREATE FUNCTION public.generate_email_token(p_user_id UUID, p_email TEXT, p_token_type TEXT, p_expires_in_hours INTEGER DEFAULT 24)
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
BEGIN
    -- 生成随机token
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- 删除旧的未使用token（使用表别名避免歧义）
    DELETE FROM public.email_confirmations ec
    WHERE ec.user_id = p_user_id AND ec.token_type = p_token_type AND ec.used_at IS NULL;
    
    -- 插入新token
    INSERT INTO public.email_confirmations (user_id, email, token, token_type, expires_at)
    VALUES (p_user_id, p_email, v_token, p_token_type, NOW() + INTERVAL '1 hour' * p_expires_in_hours);
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 第三步：验证函数创建
-- ========================================

-- 检查函数是否创建成功
SELECT 
    routine_name,
    routine_type,
    security_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'generate_email_token' 
AND routine_schema = 'public';

-- ========================================
-- 第四步：测试修复后的函数
-- ========================================

/*
-- 取消注释以测试函数
DO $$
DECLARE
    test_user_id UUID;
    test_token TEXT;
BEGIN
    test_user_id := gen_random_uuid();
    
    -- 测试生成token
    test_token := public.generate_email_token(test_user_id, 'test@example.com', 'email_verification', 24);
    
    RAISE NOTICE 'Token generated successfully: %', test_token;
    
    -- 检查token是否插入到数据库
    IF EXISTS (SELECT 1 FROM public.email_confirmations WHERE token = test_token) THEN
        RAISE NOTICE '✅ Token inserted successfully!';
    ELSE
        RAISE NOTICE '❌ Token insertion failed!';
    END IF;
    
    -- 清理测试数据
    DELETE FROM public.email_confirmations WHERE token = test_token;
    
END $$;
*/
