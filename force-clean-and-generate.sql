-- 强制清理并重新生成测试数据的脚本
-- 请在Supabase SQL编辑器中运行

-- 1. 强制删除所有测试数据
DELETE FROM user_profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 2. 强制删除auth.users表中的测试用户
DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 3. 等待确保删除完成
SELECT 'Force cleaning completed, waiting...' as status;

-- 4. 检查是否还有残留数据
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as remaining_count
FROM user_profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)

UNION ALL

SELECT 
  'auth.users' as table_name,
  COUNT(*) as remaining_count
FROM auth.users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 5. 如果还有残留数据，使用不同的ID
-- 生成新的UUID作为测试用户ID
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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

-- 6. 验证新创建的测试用户
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
WHERE email LIKE 'test.user%@lifex.com'
ORDER BY created_at DESC
LIMIT 5;

-- 7. 显示创建结果统计
SELECT 
  COUNT(*) as total_test_users,
  'New test users created with random UUIDs' as message
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com';
