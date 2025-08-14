-- 测试触发器是否正常工作
-- 这个脚本会手动测试用户创建流程

-- 1. 检查当前用户数量
SELECT 'Current user profiles count:' as info, COUNT(*) as count FROM public.user_profiles;

-- 2. 检查 auth.users 表
SELECT 'Current auth users count:' as info, COUNT(*) as count FROM auth.users;

-- 3. 检查触发器状态
SELECT 
  'Trigger status:' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. 检查函数状态
SELECT 
  'Function status:' as info,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. 检查 RLS 策略
SELECT 
  'RLS policies:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';
