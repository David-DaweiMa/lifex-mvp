-- 检查当前user_profiles表的外键约束
-- 请在Supabase SQL编辑器中运行

-- 1. 检查user_profiles表的所有外键约束
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_type
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

-- 2. 检查user_profiles表的所有约束（包括主键、唯一键等）
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. 验证测试用户数据
SELECT 
  id,
  email,
  username,
  full_name,
  business_name,
  created_at
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com'
ORDER BY created_at DESC;

-- 4. 统计测试用户数量
SELECT 
  COUNT(*) as total_test_users,
  'Test users in database' as status
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com';
