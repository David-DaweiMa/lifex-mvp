-- 修复user_profiles表缺失字段的SQL脚本
-- 请在Supabase SQL编辑器中运行这些查询

-- 注意：请先运行 check-user-profiles-table.sql 来检查当前表结构
-- 然后根据检查结果，只运行需要的ALTER TABLE语句

-- 1. 添加avatar_url字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 添加phone字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. 添加date_of_birth字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 4. 添加gender字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- 5. 添加location字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location JSONB;

-- 6. 添加website字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS website TEXT;

-- 7. 添加social_links字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB;

-- 8. 添加subscription_level字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_level TEXT DEFAULT 'free';

-- 9. 添加has_business_features字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS has_business_features BOOLEAN DEFAULT false;

-- 10. 添加verification_status字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));

-- 11. 验证修复结果
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. 测试插入一个用户（可选）
-- 注意：这会插入一个测试用户，请根据需要删除
INSERT INTO user_profiles (
  id,
  email,
  username,
  full_name,
  avatar_url,
  bio,
  subscription_level,
  has_business_features,
  verification_status,
  user_type,
  is_verified,
  is_active
) VALUES (
  'test-user-12345',
  'test@example.com',
  'test_user',
  'Test User',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'Test user for validation',
  'free',
  false,
  'none',
  'customer',
  false,
  true
) ON CONFLICT (id) DO NOTHING;

-- 13. 检查测试用户是否插入成功
SELECT * FROM user_profiles WHERE id = 'test-user-12345';

-- 14. 删除测试用户（可选）
-- DELETE FROM user_profiles WHERE id = 'test-user-12345';
