-- LifeX MVP 数据库修复脚本
-- 添加缺失的触发器和字段

-- 1. 确保user_profiles表有email_verified字段
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. 创建用户配置文件自动创建触发器函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    user_type,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建触发器，当新用户注册时自动创建配置文件
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. 创建用户配置文件更新触发器函数
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles SET
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建触发器，当用户信息更新时同步更新配置文件
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- 6. 确保businesses表有正确的字段
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Auckland',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'New Zealand',
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

-- 7. 创建categories表（如果不存在）
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 插入默认类别
INSERT INTO public.categories (id, name, description, icon, color) VALUES
  ('fea943e5-08f2-493a-9f36-8cbf50d3024f', 'Dining', 'Restaurants and food services', '🍽️', '#FF6B6B'),
  ('bd303355-2e83-4565-98e5-917e742fe10d', 'Bars & Pubs', 'Bars, pubs and nightlife', '🍺', '#4ECDC4'),
  ('abcbe7a9-b7ec-427f-9a3a-010e922e5bd8', 'Entertainment', 'Entertainment and recreation', '🎭', '#45B7D1'),
  ('fe0194cd-5c25-470e-ace7-3d5e5a1a47a4', 'Fitness', 'Fitness and wellness', '💪', '#96CEB4'),
  ('bd96d407-5f7b-45ef-b8d5-637a316dbd25', 'Shopping', 'Retail and shopping', '🛍️', '#FFEAA7'),
  ('df52a25b-e863-4455-bfd6-a746220984c9', 'Accommodation', 'Hotels and accommodation', '🏨', '#DDA0DD'),
  ('84102d22-f0a8-49a9-bf2b-489868529d93', 'Beauty', 'Beauty and personal care', '💄', '#FFB6C1'),
  ('929e40f3-67ce-46e0-9509-9b63d345dd7c', 'Health', 'Health and medical services', '🏥', '#98D8C8'),
  ('29aef3f0-4fd9-425e-a067-f6c7ba7f71ff', 'Home', 'Home services and maintenance', '🏠', '#F7DC6F'),
  ('db6140ee-dabe-4948-aafb-c5c0757f36a0', 'Education', 'Education and training', '📚', '#BB8FCE'),
  ('82c30023-ecef-495b-a651-a5bd615d114b', 'Professional Services', 'Professional and business services', '💼', '#85C1E9'),
  ('aa411129-9c7c-431d-a66a-0e61fd79deeb', 'Other', 'Other services', '🔧', '#BDC3C7')
ON CONFLICT (id) DO NOTHING;

-- 9. 为categories表添加触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 启用RLS并创建策略
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 11. 创建categories的RLS策略
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories can be managed by authenticated users" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- 12. 修复businesses表的RLS策略
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON public.businesses;
CREATE POLICY "Businesses are viewable by everyone" ON public.businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business owners can manage their businesses" ON public.businesses;
CREATE POLICY "Business owners can manage their businesses" ON public.businesses 
FOR ALL USING (auth.uid() = owner_id);

-- 13. 修复user_profiles表的RLS策略
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 14. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON public.user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- 15. 验证修复
SELECT 'Database schema fix completed successfully!' as status;
