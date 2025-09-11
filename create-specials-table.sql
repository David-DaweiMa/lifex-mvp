-- 创建 Specials 优惠表
-- 用于存储商家的优惠和折扣信息

-- 1. Specials 优惠表
CREATE TABLE public.specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  discount_percent INTEGER,
  category TEXT NOT NULL CHECK (category IN ('food', 'fitness', 'beauty', 'shopping', 'services', 'entertainment')),
  location TEXT,
  distance TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  claimed INTEGER DEFAULT 0,
  max_claims INTEGER,
  tags TEXT[],
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Special Claims 优惠领取记录表
CREATE TABLE public.special_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id UUID REFERENCES public.specials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'used', 'expired', 'cancelled')),
  used_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(special_id, user_id)
);

-- 3. Special Views 优惠浏览记录表
CREATE TABLE public.special_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id UUID REFERENCES public.specials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT, -- 'search', 'category', 'recommended', 'direct'
  session_id TEXT
);

-- 创建索引
CREATE INDEX idx_specials_business_id ON public.specials(business_id);
CREATE INDEX idx_specials_category ON public.specials(category);
CREATE INDEX idx_specials_valid_until ON public.specials(valid_until);
CREATE INDEX idx_specials_is_active ON public.specials(is_active);
CREATE INDEX idx_specials_created_at ON public.specials(created_at DESC);
CREATE INDEX idx_special_claims_special_id ON public.special_claims(special_id);
CREATE INDEX idx_special_claims_user_id ON public.special_claims(user_id);
CREATE INDEX idx_special_views_special_id ON public.special_views(special_id);
CREATE INDEX idx_special_views_user_id ON public.special_views(user_id);

-- 创建触发器
CREATE TRIGGER update_specials_updated_at BEFORE UPDATE ON public.specials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security (RLS)
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_views ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- Specials 表：所有人都可以查看活跃的优惠
CREATE POLICY "Anyone can view active specials" ON public.specials FOR SELECT USING (is_active = true);

-- 商家可以管理自己的优惠
CREATE POLICY "Business owners can manage their specials" ON public.specials FOR ALL USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Special Claims 表：用户可以查看自己的领取记录
CREATE POLICY "Users can view their own claims" ON public.special_claims FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的领取记录
CREATE POLICY "Users can claim specials" ON public.special_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的领取记录状态
CREATE POLICY "Users can update their own claims" ON public.special_claims FOR UPDATE USING (auth.uid() = user_id);

-- Special Views 表：用户可以查看自己的浏览记录
CREATE POLICY "Users can view their own views" ON public.special_views FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的浏览记录
CREATE POLICY "Users can create view records" ON public.special_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建函数：更新优惠的浏览数和领取数
CREATE OR REPLACE FUNCTION update_special_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'special_views' THEN
    UPDATE public.specials 
    SET views = views + 1 
    WHERE id = NEW.special_id;
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'special_claims' THEN
    UPDATE public.specials 
    SET claimed = claimed + 1 
    WHERE id = NEW.special_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器：自动更新统计
CREATE TRIGGER update_special_views_count 
  AFTER INSERT ON public.special_views 
  FOR EACH ROW EXECUTE FUNCTION update_special_stats();

CREATE TRIGGER update_special_claims_count 
  AFTER INSERT ON public.special_claims 
  FOR EACH ROW EXECUTE FUNCTION update_special_stats();

-- 插入一些测试数据
INSERT INTO public.specials (
  business_id,
  title,
  description,
  original_price,
  discount_price,
  discount_percent,
  category,
  location,
  distance,
  rating,
  review_count,
  image_url,
  valid_from,
  valid_until,
  is_verified,
  views,
  claimed,
  max_claims,
  tags
) VALUES 
(
  (SELECT id FROM public.businesses LIMIT 1), -- 使用第一个商家ID
  '50% Off All Coffee Drinks',
  'Enjoy our premium coffee blends at half price. Perfect for your morning routine!',
  8.50,
  4.25,
  50,
  'food',
  '118 Ponsonby Road, Auckland',
  '0.3km',
  4.8,
  234,
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '15 days',
  true,
  1250,
  89,
  200,
  ARRAY['Coffee', 'Breakfast', 'Workspace']
),
(
  (SELECT id FROM public.businesses LIMIT 1),
  'Buy 2 Get 1 Free Sushi Rolls',
  'Fresh sushi made daily. Get your third roll free with any two roll purchase.',
  15.00,
  10.00,
  33,
  'food',
  '45 Queen Street, Auckland',
  '0.8km',
  4.6,
  189,
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '20 days',
  true,
  980,
  156,
  300,
  ARRAY['Sushi', 'Japanese', 'Lunch']
),
(
  (SELECT id FROM public.businesses LIMIT 1),
  'Free 7-Day Trial + 20% Off Membership',
  'Start your fitness journey with a free week trial, then get 20% off your first month.',
  89.00,
  71.20,
  20,
  'fitness',
  '78 Newmarket Road, Auckland',
  '1.2km',
  4.4,
  312,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '25 days',
  true,
  2100,
  45,
  100,
  ARRAY['Fitness', 'Gym', 'Health']
);