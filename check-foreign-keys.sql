-- 检查user_profiles表的外键约束
-- 请在Supabase SQL编辑器中运行

-- 1. 检查user_profiles表的所有外键约束
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

-- 3. 检查auth.users表的结构（如果存在）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

