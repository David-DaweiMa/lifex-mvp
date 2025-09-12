-- 最终修复Test User 1头像的SQL脚本
-- 使用多种可靠的图片服务作为备选方案

-- 方案1: 使用UI Avatars服务 - 基于用户名的头像生成
UPDATE user_profiles 
SET avatar_url = 'https://ui-avatars.com/api/?name=Test+User+1&size=150&background=6366f1&color=ffffff&bold=true'
WHERE email = 'test.user1@lifex.com';

-- 如果方案1不工作，可以尝试以下备选方案：

-- 方案2: 使用DiceBear API - 生成一致的头像
-- UPDATE user_profiles 
-- SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser1&size=150&backgroundColor=6366f1'
-- WHERE email = 'test.user1@lifex.com';

-- 方案3: 使用RoboHash - 机器人头像
-- UPDATE user_profiles 
-- SET avatar_url = 'https://robohash.org/testuser1?size=150x150&bgset=bg1'
-- WHERE email = 'test.user1@lifex.com';

-- 方案4: 使用Picsum但固定图片
-- UPDATE user_profiles 
-- SET avatar_url = 'https://picsum.photos/150/150?random=100'
-- WHERE email = 'test.user1@lifex.com';

-- 验证更新结果
SELECT 
  id,
  email,
  full_name,
  avatar_url,
  'Updated avatar for Test User 1' as status
FROM user_profiles 
WHERE email = 'test.user1@lifex.com';



