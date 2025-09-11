-- 最小化修复user_profiles表字段的SQL脚本
-- 只添加当前代码中实际使用的字段

-- 1. 添加avatar_url字段（用于用户头像显示）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 添加location字段（用于位置推荐和地理功能）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location JSONB;

-- 3. 添加phone字段（用于联系信息）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. 添加website字段（用于商家网站链接）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS website TEXT;

-- 验证字段是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('avatar_url', 'location', 'phone', 'website')
ORDER BY column_name;
