-- 检查数据库完整架构 - 所有相关表的结构
-- 这个脚本会显示所有重要表的字段信息

-- 1. 检查所有表名
SELECT '数据库中的所有表:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. 检查 businesses 表结构
SELECT 'Businesses表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'businesses'
ORDER BY ordinal_position;

-- 3. 检查 specials 表结构
SELECT 'Specials表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'specials'
ORDER BY ordinal_position;

-- 4. 检查 user_profiles 表结构
SELECT 'User_profiles表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. 检查 trending_posts 表结构
SELECT 'Trending_posts表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'trending_posts'
ORDER BY ordinal_position;

-- 6. 检查 post_likes 表结构
SELECT 'Post_likes表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_likes'
ORDER BY ordinal_position;

-- 7. 检查 post_shares 表结构
SELECT 'Post_shares表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_shares'
ORDER BY ordinal_position;

-- 8. 检查 post_comments 表结构
SELECT 'Post_comments表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_comments'
ORDER BY ordinal_position;

-- 9. 检查 special_claims 表结构
SELECT 'Special_claims表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'special_claims'
ORDER BY ordinal_position;

-- 10. 检查 special_views 表结构
SELECT 'Special_views表结构:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'special_views'
ORDER BY ordinal_position;

-- 11. 检查外键约束
SELECT '外键约束信息:' as info;
SELECT 
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
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
