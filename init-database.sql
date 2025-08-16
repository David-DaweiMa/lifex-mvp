-- LifeX 数据库初始化脚本
-- 只包含注册流程所需的基本表

-- 1. 用户配置文件表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  location JSONB, -- {city, country, coordinates}
  bio TEXT,
  website TEXT,
  social_links JSONB, -- {instagram, twitter, facebook, etc.}
  user_type TEXT NOT NULL DEFAULT 'customer' CHECK (user_type IN ('guest', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户配额表
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quota_type TEXT NOT NULL CHECK (quota_type IN ('chat', 'trending', 'products', 'ads', 'stores')),
  current_usage INTEGER DEFAULT 0,
  max_limit INTEGER NOT NULL,
  reset_period TEXT DEFAULT 'monthly' CHECK (reset_period IN ('daily', 'monthly', 'yearly')),
  reset_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quota_type)
);

-- 3. 使用统计表
CREATE TABLE IF NOT EXISTS public.usage_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('chat', 'trending', 'products', 'ads')),
  usage_count INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_type, date)
);

-- 4. 订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('premium', 'professional_business', 'enterprise_business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  start_date DATE NOT NULL,
  end_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT TRUE,
  trial_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 商家表
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL,
  subcategories TEXT[],
  contact_info JSONB, -- {phone, email, website}
  address JSONB, -- {street, city, state, country, coordinates}
  business_hours JSONB, -- {monday: {open: "09:00", close: "18:00"}, ...}
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 商品表
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  images TEXT[],
  specifications JSONB,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 8. 创建触发器函数
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

-- 10. 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 11. 创建 RLS 策略
-- 用户配置文件策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 用户配额策略
DROP POLICY IF EXISTS "Users can view own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can update own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can insert own quotas" ON public.user_quotas;

CREATE POLICY "Users can view own quotas" ON public.user_quotas
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quotas" ON public.user_quotas
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own quotas" ON public.user_quotas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 使用统计策略
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_statistics;

CREATE POLICY "Users can view own usage" ON public.usage_statistics
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own usage" ON public.usage_statistics
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own usage" ON public.usage_statistics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 订阅策略
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 商家策略
DROP POLICY IF EXISTS "Users can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;

CREATE POLICY "Users can view all businesses" ON public.businesses
  FOR SELECT USING (true);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- 商品策略
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Business owners can manage products" ON public.products;

CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
      AND businesses.owner_id::text = auth.uid()::text
    )
  );

-- 完成消息
SELECT 'Database initialized successfully!' as status;
