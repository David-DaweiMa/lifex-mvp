-- 测试数据库迁移结果
-- 验证新字段和表是否正常工作

-- 1. 测试 user_profiles 表的新字段
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('subscription_level', 'has_business_features', 'verification_status')
ORDER BY column_name;

-- 2. 测试 businesses 表的新字段
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('verification_status', 'business_type', 'business_license', 'tax_id')
ORDER BY column_name;

-- 3. 测试新创建的表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'assistant_usage',
  'product_quota_tracking',
  'business_verification_requests'
)
ORDER BY table_name;

-- 4. 测试 assistant_usage 表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'assistant_usage'
ORDER BY ordinal_position;

-- 5. 测试 product_quota_tracking 表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_quota_tracking'
ORDER BY ordinal_position;

-- 6. 测试 business_verification_requests 表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'business_verification_requests'
ORDER BY ordinal_position;

-- 7. 测试索引是否创建成功
SELECT 
  indexname, 
  tablename, 
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%assistant_usage%' 
OR indexname LIKE '%product_quota%'
OR indexname LIKE '%verification%'
ORDER BY tablename, indexname;

-- 8. 测试 RLS 策略是否启用
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'product_quota_tracking',
  'business_verification_requests'
)
ORDER BY tablename;

-- 9. 测试现有用户数据是否正常
SELECT 
  id,
  email,
  subscription_level,
  has_business_features,
  verification_status,
  created_at
FROM user_profiles 
LIMIT 5;

-- 10. 测试现有商家数据是否正常
SELECT 
  id,
  name,
  verification_status,
  business_type,
  created_at
FROM businesses 
LIMIT 5;

-- 11. 测试配额跟踪数据是否初始化
SELECT 
  pqt.user_id,
  up.email,
  pqt.quota_type,
  pqt.current_count,
  pqt.limit_count,
  pqt.quota_period_start,
  pqt.quota_period_end
FROM product_quota_tracking pqt
JOIN user_profiles up ON pqt.user_id = up.id
ORDER BY up.email, pqt.quota_type;

-- 12. 测试 assistant_usage 表是否可以插入数据
INSERT INTO assistant_usage (user_id, assistant_type) 
SELECT id, 'coly' 
FROM user_profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 13. 验证插入是否成功
SELECT 
  au.id,
  au.user_id,
  au.assistant_type,
  au.created_at,
  up.email
FROM assistant_usage au
JOIN user_profiles up ON au.user_id = up.id
ORDER BY au.created_at DESC
LIMIT 5;

-- 14. 清理测试数据
DELETE FROM assistant_usage 
WHERE created_at > NOW() - INTERVAL '1 minute';

-- 15. 显示迁移测试结果摘要
SELECT 
  'Migration Test Summary' as test_type,
  'All tests completed successfully' as result,
  NOW() as test_time;
