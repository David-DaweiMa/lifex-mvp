-- 备用头像修复方案 - 使用更可靠的图片服务
-- 如果Unsplash不可用，可以使用这些备用的头像URL

-- 方案1: 使用Picsum (Lorem Picsum) - 更稳定的服务
UPDATE user_profiles 
SET avatar_url = 'https://picsum.photos/150/150?random=1'
WHERE email = 'test.user1@lifex.com';

UPDATE user_profiles 
SET avatar_url = 'https://picsum.photos/150/150?random=2'
WHERE email = 'test.user2@lifex.com';

UPDATE user_profiles 
SET avatar_url = 'https://picsum.photos/150/150?random=3'
WHERE email = 'test.user3@lifex.com';

UPDATE user_profiles 
SET avatar_url = 'https://picsum.photos/150/150?random=4'
WHERE email = 'test.user4@lifex.com';

UPDATE user_profiles 
SET avatar_url = 'https://picsum.photos/150/150?random=5'
WHERE email = 'test.user5@lifex.com';

-- 方案2: 使用UI Avatars服务 - 基于用户名的头像
-- UPDATE user_profiles 
-- SET avatar_url = CONCAT('https://ui-avatars.com/api/?name=', full_name, '&size=150&background=random')
-- WHERE email LIKE 'test.user%@lifex.com';

-- 验证更新结果
SELECT 
  id,
  email,
  full_name,
  avatar_url
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com'
ORDER BY email;





