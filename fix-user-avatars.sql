-- 修复测试用户头像URL
-- 使用更可靠的Unsplash头像URL

-- 更新Test User 1的头像（女性头像）
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format'
WHERE email = 'test.user1@lifex.com';

-- 更新Test User 2的头像（男性头像）
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format'
WHERE email = 'test.user2@lifex.com';

-- 更新Test User 3的头像（女性头像）
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format'
WHERE email = 'test.user3@lifex.com';

-- 更新Test User 4的头像（女性头像）
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format'
WHERE email = 'test.user4@lifex.com';

-- 更新Test User 5的头像（男性头像）
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'
WHERE email = 'test.user5@lifex.com';

-- 验证更新结果
SELECT 
  id,
  email,
  full_name,
  avatar_url
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com'
ORDER BY email;
