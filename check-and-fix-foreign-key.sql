-- 检查并修复外键约束问题的完整脚本
-- 请在Supabase SQL编辑器中运行

-- 1. 检查外键约束详情
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public';

-- 2. 检查是否存在auth.users表
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'users' 
AND table_schema IN ('auth', 'public');

-- 3. 如果外键约束存在，删除它
-- 注意：请根据上面查询结果中的constraint_name来执行
-- 常见的约束名称可能是：user_profiles_id_fkey, user_profiles_user_id_fkey 等
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- 4. 验证约束已删除
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. 现在可以安全地清理和创建测试数据
DELETE FROM user_profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 6. 创建测试用户
INSERT INTO user_profiles (
  id,
  email,
  username,
  full_name,
  user_type,
  email_verified,
  is_active,
  business_name,
  subscription_level,
  has_business_features,
  verification_status,
  avatar_url,
  location,
  phone,
  website
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'test.user1@lifex.com',
  'testuser1',
  'Test User 1',
  'free_business',
  true,
  true,
  'Test Business 1',
  'free',
  false,
  'none',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  '09-123-4567',
  'https://testbusiness1.com'
),
(
  '22222222-2222-2222-2222-222222222222',
  'test.user2@lifex.com',
  'testuser2',
  'Test User 2',
  'free_business',
  true,
  true,
  'Test Business 2',
  'free',
  false,
  'none',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8585, "lng": 174.7533}}',
  '09-234-5678',
  'https://testbusiness2.com'
),
(
  '33333333-3333-3333-3333-333333333333',
  'test.user3@lifex.com',
  'testuser3',
  'Test User 3',
  'free_business',
  true,
  true,
  'Test Business 3',
  'free',
  false,
  'none',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8385, "lng": 174.7733}}',
  '09-345-6789',
  'https://testbusiness3.com'
),
(
  '44444444-4444-4444-4444-444444444444',
  'test.user4@lifex.com',
  'testuser4',
  'Test User 4',
  'free_business',
  true,
  true,
  'Test Business 4',
  'free',
  false,
  'none',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  '09-456-7890',
  'https://testbusiness4.com'
),
(
  '55555555-5555-5555-5555-555555555555',
  'test.user5@lifex.com',
  'testuser5',
  'Test User 5',
  'free_business',
  true,
  true,
  'Test Business 5',
  'free',
  false,
  'none',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8785, "lng": 174.7633}}',
  '09-567-8901',
  'https://testbusiness5.com'
);

-- 7. 验证数据创建成功
SELECT 
  id,
  email,
  username,
  full_name,
  business_name,
  avatar_url,
  phone,
  website,
  location
FROM user_profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 8. 显示创建结果统计
SELECT 
  COUNT(*) as total_test_users,
  'Test users created successfully' as message
FROM user_profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

