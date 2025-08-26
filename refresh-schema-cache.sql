-- 刷新Supabase的schema cache以解决列名问题

-- 1. 检查当前businesses表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查是否有category列（不应该有）
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
AND column_name = 'category';

-- 3. 确认category_id列存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
AND column_name = 'category_id';

-- 4. 强制刷新schema cache（通过执行一个简单的查询）
SELECT COUNT(*) FROM public.businesses LIMIT 1;

-- 5. 检查RLS策略
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'businesses';

-- 6. 验证表权限
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'businesses' 
AND table_schema = 'public';

