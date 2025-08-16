-- 检查 LifeX 数据库状态
-- 这个脚本会显示当前数据库的表结构和 RLS 状态

-- 1. 检查存在的表
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. 检查 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 检查触发器
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. 检查函数
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 5. 检查用户配置文件表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 6. 检查用户配额表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_quotas'
ORDER BY ordinal_position;

-- 7. 检查是否有数据
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as row_count
FROM public.user_profiles
UNION ALL
SELECT 
  'user_quotas' as table_name,
  COUNT(*) as row_count
FROM public.user_quotas
UNION ALL
SELECT 
  'usage_statistics' as table_name,
  COUNT(*) as row_count
FROM public.usage_statistics
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*) as row_count
FROM public.subscriptions
UNION ALL
SELECT 
  'businesses' as table_name,
  COUNT(*) as row_count
FROM public.businesses
UNION ALL
SELECT 
  'products' as table_name,
  COUNT(*) as row_count
FROM public.products;
