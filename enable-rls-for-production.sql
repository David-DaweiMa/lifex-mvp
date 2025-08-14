-- 重新启用 Row Level Security (RLS)
-- 生产环境使用

-- 启用用户相关表的RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 创建更完善的 RLS 策略
-- 用户配置文件策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- 聊天消息策略
CREATE POLICY "Users can access own chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 用户配额策略
CREATE POLICY "Users can access own quotas" ON public.user_quotas
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 使用统计策略
CREATE POLICY "Users can access own usage statistics" ON public.usage_statistics
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 订阅策略
CREATE POLICY "Users can access own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 广告策略（广告主可以管理自己的广告）
CREATE POLICY "Advertisers can manage own ads" ON public.advertisements
  FOR ALL USING (auth.uid()::text = advertiser_id::text);

-- 热门帖子策略（公开可读，作者可编辑）
CREATE POLICY "Trending posts are publicly viewable" ON public.trending_posts
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage own posts" ON public.trending_posts
  FOR ALL USING (auth.uid()::text = author_id::text);

-- 搜索历史策略
CREATE POLICY "Users can access own search history" ON public.search_history
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 用户行为策略
CREATE POLICY "Users can access own actions" ON public.user_actions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 通知策略
CREATE POLICY "Users can access own notifications" ON public.notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 完成消息
SELECT 'RLS enabled with comprehensive policies for production!' as status;
