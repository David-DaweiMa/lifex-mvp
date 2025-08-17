-- 快速触发器检查脚本
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 检查触发器函数是否存在
SELECT '1. 检查触发器函数' as step;
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'setup_user_quotas');

-- 2. 检查触发器是否正确绑定
SELECT '2. 检查触发器绑定' as step;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. 检查必要的表是否存在
SELECT '3. 检查表结构' as step;
SELECT table_name, 'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_quotas', 'trigger_logs')
ORDER BY table_name;

-- 4. 检查RLS策略
SELECT '4. 检查RLS策略' as step;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_quotas', 'trigger_logs')
ORDER BY tablename, policyname;

-- 5. 检查最近的触发器日志
SELECT '5. 检查触发器日志' as step;
SELECT 
  trigger_name,
  status,
  execution_time,
  error_message
FROM public.trigger_logs 
ORDER BY execution_time DESC 
LIMIT 5;

-- 6. 测试触发器函数（不创建实际用户）
SELECT '6. 测试触发器函数语法' as step;
-- 这里只是检查函数是否可以正常解析，不实际执行
SELECT 'handle_new_user function syntax OK' as test_result
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'handle_new_user'
);

SELECT 'setup_user_quotas function syntax OK' as test_result
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'setup_user_quotas'
);

-- 7. 总结
SELECT '7. 检查总结' as step;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
    THEN '✅ handle_new_user 函数存在'
    ELSE '❌ handle_new_user 函数不存在'
  END as handle_new_user_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'setup_user_quotas') 
    THEN '✅ setup_user_quotas 函数存在'
    ELSE '❌ setup_user_quotas 函数不存在'
  END as setup_user_quotas_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
    THEN '✅ on_auth_user_created 触发器存在'
    ELSE '❌ on_auth_user_created 触发器不存在'
  END as trigger_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trigger_logs') 
    THEN '✅ trigger_logs 表存在'
    ELSE '❌ trigger_logs 表不存在'
  END as logs_table_status;
