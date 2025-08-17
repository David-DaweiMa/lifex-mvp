-- 创建检查RLS策略的函数
CREATE OR REPLACE FUNCTION public.check_rls_policies()
RETURNS TABLE(
    table_name TEXT,
    policy_name TEXT,
    policy_type TEXT,
    policy_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        p.policyname::TEXT,
        p.cmd::TEXT,
        CASE 
            WHEN p.cmd = 'SELECT' THEN p.qual
            WHEN p.cmd = 'INSERT' THEN p.with_check
            WHEN p.cmd = 'UPDATE' THEN p.with_check
            WHEN p.cmd = 'DELETE' THEN p.qual
            ELSE 'ALL'
        END::TEXT as policy_definition
    FROM pg_policies p
    JOIN information_schema.tables t ON p.tablename = t.table_name
    WHERE p.schemaname = 'public' 
    AND t.table_schema = 'public'
    AND t.table_name IN ('user_profiles', 'email_confirmations')
    ORDER BY t.table_name, p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建检查触发器的函数
CREATE OR REPLACE FUNCTION public.check_triggers()
RETURNS TABLE(
    trigger_name TEXT,
    table_name TEXT,
    event_manipulation TEXT,
    action_timing TEXT,
    action_statement TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        t.event_object_table::TEXT,
        t.event_manipulation::TEXT,
        t.action_timing::TEXT,
        t.action_statement::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public'
    AND t.event_object_table IN ('users')
    ORDER BY t.trigger_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建检查函数存在性的函数
CREATE OR REPLACE FUNCTION public.check_functions_exist()
RETURNS TABLE(
    function_name TEXT,
    function_exists BOOLEAN,
    security_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.routine_name::TEXT,
        TRUE::BOOLEAN,
        r.security_type::TEXT
    FROM information_schema.routines r
    WHERE r.routine_schema = 'public'
    AND r.routine_name IN (
        'handle_new_user',
        'generate_email_token',
        'verify_email_token',
        'mark_token_used',
        'setup_user_quotas',
        'cleanup_expired_users'
    )
    ORDER BY r.routine_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建检查表结构的函数
CREATE OR REPLACE FUNCTION public.check_table_structure()
RETURNS TABLE(
    table_name TEXT,
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.table_name::TEXT,
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name IN ('user_profiles', 'email_confirmations')
    ORDER BY c.table_name, c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证函数创建
SELECT 'Functions created successfully' as status;

-- 测试函数
SELECT 'Testing check_rls_policies function:' as test;
SELECT * FROM public.check_rls_policies();

SELECT 'Testing check_triggers function:' as test;
SELECT * FROM public.check_triggers();

SELECT 'Testing check_functions_exist function:' as test;
SELECT * FROM public.check_functions_exist();

SELECT 'Testing check_table_structure function:' as test;
SELECT * FROM public.check_table_structure();
