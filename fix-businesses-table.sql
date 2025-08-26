-- 修复businesses表的列名不一致问题
-- 将category列重命名为category_id以匹配代码

-- 1. 检查当前表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 如果存在category列，重命名为category_id
ALTER TABLE public.businesses 
RENAME COLUMN IF EXISTS category TO category_id;

-- 3. 如果category_id列不存在，添加它
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS category_id TEXT;

-- 4. 确保categories表存在
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

-- 5. 插入默认类别（如果不存在）
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

-- 6. 验证修复后的表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. 验证categories表
SELECT id, name, description
FROM public.categories
ORDER BY name;
