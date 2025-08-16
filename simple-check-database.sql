-- 简化的数据库状态检查
-- 检查基本表是否存在和 RLS 状态

-- 1. 检查基本表是否存在
SELECT 
  'user_profiles' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') as exists
UNION ALL
SELECT 
  'user_quotas' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_quotas') as exists
UNION ALL
SELECT 
  'usage_statistics' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_statistics') as exists
UNION ALL
SELECT 
  'subscriptions' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') as exists
UNION ALL
SELECT 
  'businesses' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') as exists
UNION ALL
SELECT 
  'products' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') as exists;

-- 2. 检查 RLS 是否启用
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_quotas', 'usage_statistics', 'subscriptions', 'businesses', 'products')
ORDER BY tablename;

-- 3. 检查触发器是否存在
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';

-- 4. 检查函数是否存在
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'setup_user_quotas')
ORDER BY routine_name;

-- 5. 检查用户配置文件表的数据
SELECT 
  COUNT(*) as user_count
FROM public.user_profiles;

-- 6. 检查用户配额表的数据
SELECT 
  COUNT(*) as quota_count
FROM public.user_quotas;
