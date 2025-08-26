-- 快速修复：暂时删除约束让business用户注册能够正常工作

-- 1. 删除有问题的约束
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_business_name_required;

-- 2. 验证约束已删除
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_business_name_required';

-- 3. 检查user_profiles表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. 测试：检查触发器是否正常工作
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles' 
AND event_object_schema = 'public';
