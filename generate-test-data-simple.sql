-- 简化的测试数据生成脚本
-- 只使用确实存在的字段来创建测试数据

-- 1. 清理现有的测试数据
DELETE FROM user_profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- 2. 创建测试用户（只使用基本字段）
INSERT INTO user_profiles (
  id,
  email,
  username,
  full_name,
  bio,
  user_type,
  is_verified,
  is_active
) VALUES 
-- 用户1: 咖啡爱好者
(
  '11111111-1111-1111-1111-111111111111',
  'coffee.lover@example.com',
  'coffee_lover',
  'Sarah Chen',
  'Coffee enthusiast and Auckland local. Love discovering new cafes and sharing hidden gems! ☕️',
  'customer',
  false,
  true
),

-- 用户2: 健身达人
(
  '22222222-2222-2222-2222-222222222222',
  'fitness.guru@example.com',
  'fitness_guru',
  'Mike Johnson',
  'Personal trainer and fitness enthusiast. Helping people achieve their health goals! 💪',
  'customer',
  false,
  true
),

-- 用户3: 美食博主
(
  '33333333-3333-3333-3333-333333333333',
  'food.blogger@example.com',
  'food_blogger',
  'Emma Wilson',
  'Food blogger and restaurant reviewer. Always on the hunt for the best eats in Auckland! 🍽️',
  'customer',
  false,
  true
),

-- 用户4: 美容专家
(
  '44444444-4444-4444-4444-444444444444',
  'beauty.expert@example.com',
  'beauty_expert',
  'Lisa Park',
  'Beauty therapist and skincare specialist. Sharing tips for healthy, glowing skin! ✨',
  'customer',
  false,
  true
),

-- 用户5: 科技爱好者
(
  '55555555-5555-5555-5555-555555555555',
  'tech.enthusiast@example.com',
  'tech_enthusiast',
  'David Kim',
  'Tech enthusiast and early adopter. Love exploring new technologies and smart home solutions! 🤖',
  'customer',
  false,
  true
);

-- 3. 验证用户创建成功
SELECT 
  id,
  email,
  username,
  full_name,
  bio,
  user_type,
  is_verified,
  is_active,
  created_at
FROM user_profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
ORDER BY created_at;

-- 4. 统计创建的用户数量
SELECT COUNT(*) as total_test_users 
FROM user_profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);
