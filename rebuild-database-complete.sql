-- 完整的数据库重建脚本
-- 解决RLS策略问题并重新整理注册流程
-- 包含邮件确认机制和用户分类对应

-- ========================================
-- 第一步：清理现有数据
-- ========================================

-- 删除触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 删除函数（如果存在）- 先删除所有函数
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.setup_user_quotas(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.setup_user_quotas(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_email_token(uuid, text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.generate_email_token(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.verify_email_token(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.mark_token_used(text) CASCADE;
DROP FUNCTION IF EXISTS public.check_functions_exist() CASCADE;

-- 删除依赖表（如果存在）
DROP TABLE IF EXISTS public.trigger_logs CASCADE;
DROP TABLE IF EXISTS public.user_quotas CASCADE;
DROP TABLE IF EXISTS public.anonymous_usage CASCADE;
DROP TABLE IF EXISTS public.email_confirmations CASCADE;

-- 删除其他可能依赖user_profiles的表
DROP TABLE IF EXISTS public.usage_statistics CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.advertisements CASCADE;
DROP TABLE IF EXISTS public.trending_posts CASCADE;
DROP TABLE IF EXISTS public.ad_impressions CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.user_actions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 最后删除user_profiles表（现在应该没有依赖了）
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- ========================================
-- 第二步：重新创建表结构
-- ========================================

-- 1. 用户配置文件表
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT,
    full_name TEXT,
    user_type TEXT NOT NULL DEFAULT 'free' CHECK (user_type IN ('anonymous', 'free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户配额表
CREATE TABLE public.user_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL CHECK (quota_type IN ('chat', 'trending', 'ads', 'products', 'stores')),
    current_usage INTEGER DEFAULT 0,
    max_limit INTEGER NOT NULL,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quota_type, reset_date)
);

-- 3. 匿名用户使用记录表
CREATE TABLE public.anonymous_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    device_fingerprint TEXT,
    quota_type TEXT NOT NULL CHECK (quota_type IN ('chat', 'trending', 'ads')),
    usage_date DATE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, quota_type, usage_date)
);

-- 4. 触发器日志表
CREATE TABLE public.trigger_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_name TEXT NOT NULL,
    user_id UUID,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('started', 'success', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 邮件确认表
CREATE TABLE public.email_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    token_type TEXT NOT NULL CHECK (token_type IN ('email_verification', 'password_reset')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 重新创建其他必要的表（如果需要的话）
-- 聊天消息表
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    message TEXT NOT NULL,
    response TEXT,
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'assistant', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE IF NOT EXISTS public.usage_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name, usage_date)
);

-- 订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第三步：创建索引
-- ========================================

-- 用户配置文件索引
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX idx_user_profiles_email_verified ON public.user_profiles(email_verified);

-- 用户配额索引
CREATE INDEX idx_user_quotas_user_id ON public.user_quotas(user_id);
CREATE INDEX idx_user_quotas_reset_date ON public.user_quotas(reset_date);

-- 匿名使用索引
CREATE INDEX idx_anonymous_usage_session_id ON public.anonymous_usage(session_id);
CREATE INDEX idx_anonymous_usage_usage_date ON public.anonymous_usage(usage_date);

-- 触发器日志索引
CREATE INDEX idx_trigger_logs_user_id ON public.trigger_logs(user_id);
CREATE INDEX idx_trigger_logs_execution_time ON public.trigger_logs(execution_time);

-- 邮件确认索引
CREATE INDEX idx_email_confirmations_token ON public.email_confirmations(token);
CREATE INDEX idx_email_confirmations_user_id ON public.email_confirmations(user_id);
CREATE INDEX idx_email_confirmations_expires_at ON public.email_confirmations(expires_at);

-- 聊天消息索引
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- 使用统计索引
CREATE INDEX idx_usage_statistics_user_id ON public.usage_statistics(user_id);
CREATE INDEX idx_usage_statistics_usage_date ON public.usage_statistics(usage_date);

-- 订阅索引
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ========================================
-- 第四步：创建函数
-- ========================================

-- 1. 设置用户配额函数
CREATE FUNCTION public.setup_user_quotas(user_id UUID, user_type TEXT)
RETURNS VOID AS $$
DECLARE
    quota_config RECORD;
BEGIN
    -- 根据用户类型设置配额
    CASE user_type
        WHEN 'anonymous' THEN
            -- 匿名用户：5次聊天/天
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES (user_id, 'chat', 5, CURRENT_DATE);
            
        WHEN 'free' THEN
            -- 免费用户：20次聊天/天, 10次趋势/月, 2次广告/月
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 20, CURRENT_DATE),
                (user_id, 'trending', 10, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 2, DATE_TRUNC('month', CURRENT_DATE)::DATE);
                
        WHEN 'customer' THEN
            -- 普通付费用户：100次聊天/天, 50次趋势/月, 10次广告/月
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 100, CURRENT_DATE),
                (user_id, 'trending', 50, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 10, DATE_TRUNC('month', CURRENT_DATE)::DATE);
                
        WHEN 'premium' THEN
            -- 高级用户：500次聊天/天, 200次趋势/月, 50次广告/月
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 500, CURRENT_DATE),
                (user_id, 'trending', 200, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 50, DATE_TRUNC('month', CURRENT_DATE)::DATE);
                
        WHEN 'free_business' THEN
            -- 免费商家：20次聊天/天, 10次趋势/月, 2次广告/月, 20个产品, 2个店铺
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 20, CURRENT_DATE),
                (user_id, 'trending', 10, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 2, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'products', 20, NULL),
                (user_id, 'stores', 2, NULL);
                
        WHEN 'professional_business' THEN
            -- 专业商家：100次聊天/天, 50次趋势/月, 10次广告/月, 50个产品, 3个店铺
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 100, CURRENT_DATE),
                (user_id, 'trending', 50, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 10, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'products', 50, NULL),
                (user_id, 'stores', 3, NULL);
                
        WHEN 'enterprise_business' THEN
            -- 企业商家：500次聊天/天, 200次趋势/月, 50次广告/月, 200个产品, 10个店铺
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 500, CURRENT_DATE),
                (user_id, 'trending', 200, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 50, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'products', 200, NULL),
                (user_id, 'stores', 10, NULL);
                
        ELSE
            -- 默认免费用户
            INSERT INTO public.user_quotas (user_id, quota_type, max_limit, reset_date)
            VALUES 
                (user_id, 'chat', 20, CURRENT_DATE),
                (user_id, 'trending', 10, DATE_TRUNC('month', CURRENT_DATE)::DATE),
                (user_id, 'ads', 2, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 生成邮件确认token函数
CREATE FUNCTION public.generate_email_token(user_id UUID, email TEXT, token_type TEXT, expires_in_hours INTEGER DEFAULT 24)
RETURNS TEXT AS $$
DECLARE
    token TEXT;
BEGIN
    -- 生成随机token
    token := encode(gen_random_bytes(32), 'hex');
    
    -- 删除旧的未使用token
    DELETE FROM public.email_confirmations 
    WHERE user_id = $1 AND token_type = $3 AND used_at IS NULL;
    
    -- 插入新token
    INSERT INTO public.email_confirmations (user_id, email, token, token_type, expires_at)
    VALUES ($1, $2, token, $3, NOW() + INTERVAL '1 hour' * $4);
    
    RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 验证邮件token函数
CREATE FUNCTION public.verify_email_token(token TEXT, token_type TEXT)
RETURNS TABLE(user_id UUID, email TEXT, valid BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ec.user_id,
        ec.email,
        CASE 
            WHEN ec.used_at IS NOT NULL THEN FALSE
            WHEN ec.expires_at < NOW() THEN FALSE
            ELSE TRUE
        END as valid
    FROM public.email_confirmations ec
    WHERE ec.token = $1 AND ec.token_type = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 标记token为已使用函数
CREATE FUNCTION public.mark_token_used(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.email_confirmations 
    SET used_at = NOW()
    WHERE token = $1 AND used_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 检查函数存在性函数
CREATE FUNCTION public.check_functions_exist()
RETURNS TABLE(function_name TEXT, function_exists BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'handle_new_user'::TEXT as function_name,
        EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') as function_exists
    UNION ALL
    SELECT 
        'setup_user_quotas'::TEXT,
        EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'setup_user_quotas')
    UNION ALL
    SELECT 
        'generate_email_token'::TEXT,
        EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_email_token')
    UNION ALL
    SELECT 
        'verify_email_token'::TEXT,
        EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'verify_email_token');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 清理过期用户函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_users()
RETURNS void AS $$
BEGIN
    -- 删除超过24小时的未验证用户配置文件
    DELETE FROM public.user_profiles 
    WHERE email_verified = false 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    -- 删除过期的确认token
    DELETE FROM public.email_confirmations 
    WHERE expires_at < NOW();
    
    -- 删除孤立的配额记录
    DELETE FROM public.user_quotas 
    WHERE user_id NOT IN (SELECT id FROM public.user_profiles);
    
    -- 删除孤立的触发器日志
    DELETE FROM public.trigger_logs 
    WHERE user_id NOT IN (SELECT id FROM public.user_profiles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 第五步：创建触发器
-- ========================================

-- 用户创建触发器函数
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    email_token TEXT;
    existing_profile_id UUID;
BEGIN
    -- 记录触发器执行开始
    INSERT INTO public.trigger_logs (
        trigger_name,
        user_id,
        status
    ) VALUES (
        'handle_new_user',
        NEW.id,
        'started'
    );
    
    -- 检查是否存在未验证的相同邮箱账户
    SELECT id INTO existing_profile_id
    FROM public.user_profiles 
    WHERE email = NEW.email 
    AND email_verified = false;
    
    -- 如果存在未验证的账户，删除它
    IF existing_profile_id IS NOT NULL THEN
        DELETE FROM public.user_profiles WHERE id = existing_profile_id;
        DELETE FROM public.email_confirmations WHERE user_id = existing_profile_id;
        DELETE FROM public.user_quotas WHERE user_id = existing_profile_id;
    END IF;
    
    -- 创建用户配置文件（未验证状态）
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        full_name,
        user_type,
        email_verified,
        email_verification_token,
        email_verification_expires_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'free'),
        FALSE,
        public.generate_email_token(NEW.id, NEW.email, 'email_verification', 24),
        NOW() + INTERVAL '24 hours'
    );
    
    -- 设置用户配额（临时配额，验证后更新）
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
            status,
            error_message
        ) VALUES (
            'handle_new_user',
            NEW.id,
            'error',
            SQLERRM
        );
    END IF;
    
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 第六步：设置RLS策略
-- ========================================

-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户配置文件RLS策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 关键：允许触发器函数插入（解决RLS阻止问题）
CREATE POLICY "Allow trigger function insert" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 用户配额RLS策略
CREATE POLICY "Users can view own quotas" ON public.user_quotas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON public.user_quotas
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all quotas" ON public.user_quotas
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 匿名使用RLS策略
CREATE POLICY "Anyone can manage anonymous usage" ON public.anonymous_usage
    FOR ALL USING (true) WITH CHECK (true);

-- 触发器日志RLS策略
CREATE POLICY "Service role can view all logs" ON public.trigger_logs
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert logs" ON public.trigger_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 邮件确认RLS策略
CREATE POLICY "Users can view own confirmations" ON public.email_confirmations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all confirmations" ON public.email_confirmations
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 聊天消息RLS策略
CREATE POLICY "Users can view own messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all messages" ON public.chat_messages
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 使用统计RLS策略
CREATE POLICY "Users can view own statistics" ON public.usage_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all statistics" ON public.usage_statistics
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 订阅RLS策略
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 第七步：验证重建结果
-- ========================================

-- 检查表是否创建成功
SELECT 'Tables' as component, count(*) as count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'user_quotas', 'anonymous_usage', 'trigger_logs', 'email_confirmations', 'chat_messages', 'usage_statistics', 'subscriptions')

UNION ALL

-- 检查函数是否创建成功
SELECT 'Functions' as component, count(*) as count FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'setup_user_quotas', 'generate_email_token', 'verify_email_token', 'mark_token_used', 'check_functions_exist')

UNION ALL

-- 检查触发器是否创建成功
SELECT 'Triggers' as component, count(*) as count FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

-- 检查RLS策略是否创建成功
SELECT 'RLS Policies' as component, count(*) as count FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- ========================================
-- 第八步：测试数据（可选）
-- ========================================

/*
-- 取消注释以执行测试
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    test_email := 'test-rebuild-' || extract(epoch from now()) || '@example.com';
    
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
        NULL, -- 不自动确认，需要邮件验证
        '{"username": "testrebuild", "full_name": "Test Rebuild User", "user_type": "free"}'::jsonb,
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Test user created: %', test_user_id;
    RAISE NOTICE 'Email verification required for: %', test_email;
    
    -- 等待触发器执行
    PERFORM pg_sleep(2);
    
    -- 检查结果
    RAISE NOTICE 'Database rebuild completed successfully!';
END $$;
*/
