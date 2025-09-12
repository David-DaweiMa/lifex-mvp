-- 删除user_profiles表的外键约束（如果存在）
-- 请在Supabase SQL编辑器中运行

-- 1. 检查是否存在外键约束
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

-- 2. 删除外键约束（如果存在）
-- 注意：请根据上面查询结果中的constraint_name来替换
-- ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 3. 验证约束已删除
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';

