-- 检查邮件相关的数据库函数
SELECT 
  '=== 检查邮件相关函数 ===' as info;

-- 检查 verify_email_token 函数
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'verify_email_token' 
  AND routine_schema = 'public';

-- 检查 mark_token_used 函数
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'mark_token_used' 
  AND routine_schema = 'public';

-- 检查 email_confirmations 表结构
SELECT 
  '=== 检查 email_confirmations 表 ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'email_confirmations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查最近的 email_confirmations 记录
SELECT 
  '=== 最近的 email_confirmations 记录 ===' as info;

SELECT 
  user_id,
  token,
  token_type,
  expires_at,
  created_at,
  used_at
FROM email_confirmations 
ORDER BY created_at DESC 
LIMIT 5;
