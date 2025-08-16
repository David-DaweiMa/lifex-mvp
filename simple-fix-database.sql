-- 简化的 LifeX 数据库修复脚本
-- 这个脚本只处理基本表，避免复杂的 PL/pgSQL 代码块

-- 1. 启用基本表的 RLS（只处理存在的表）
-- 用户配置文件表
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户配额表
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

-- 使用统计表
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;

-- 订阅表
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 商家表
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 商品表（如果存在）
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. 为用户配置文件表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 3. 为用户配额表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can update own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can insert own quotas" ON public.user_quotas;

CREATE POLICY "Users can view own quotas" ON public.user_quotas
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quotas" ON public.user_quotas
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own quotas" ON public.user_quotas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 4. 为使用统计表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_statistics;

CREATE POLICY "Users can view own usage" ON public.usage_statistics
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own usage" ON public.usage_statistics
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own usage" ON public.usage_statistics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 5. 为订阅表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 6. 为商家表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;

CREATE POLICY "Users can view all businesses" ON public.businesses
  FOR SELECT USING (true);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- 7. 创建函数来设置用户配额
CREATE OR REPLACE FUNCTION public.setup_user_quotas(user_id UUID)
RETURNS void AS $$
BEGIN
  -- 为 Customer 用户设置配额
  INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
  VALUES 
    (user_id, 'chat', 0, 10, 'daily', CURRENT_DATE + INTERVAL '1 day'),
    (user_id, 'trending', 0, 5, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'ads', 0, 1, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'products', 0, 0, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'stores', 0, 0, 'monthly', CURRENT_DATE + INTERVAL '1 month')
  ON CONFLICT (user_id, quota_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 更新触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 为新用户创建配置文件
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    user_type,
    is_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  
  -- 为新用户设置配额
  PERFORM public.setup_user_quotas(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建触发器（如果不存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. 完成消息
SELECT 'Database RLS policies have been updated successfully!' as status;
