-- 检查user_profiles表结构的SQL查询
-- 请在Supabase SQL编辑器中运行这些查询

-- 1. 检查user_profiles表的所有字段
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查表是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public';

-- 3. 检查表的约束条件
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'user_profiles' 
AND tc.table_schema = 'public';

-- 4. 检查表的基本信息
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 5. 检查是否有数据
SELECT COUNT(*) as total_users FROM user_profiles;

-- 6. 查看前几条数据（如果有的话）
SELECT * FROM user_profiles LIMIT 3;
