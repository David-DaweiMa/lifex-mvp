-- 临时禁用RLS进行测试
-- 运行此脚本后，用户注册应该能正常工作

-- 禁用用户相关表的RLS
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 完成消息
SELECT 'RLS disabled for testing. Remember to re-enable in production!' as status;
