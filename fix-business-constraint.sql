-- 修复business用户注册约束问题
-- 这个脚本会删除或修改导致business用户注册失败的约束

-- 1. 首先检查是否存在这个约束
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_business_name_required';

-- 2. 如果存在，删除这个约束（因为它阻止了business用户注册）
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_business_name_required;

-- 3. 如果需要，可以创建一个更合理的约束
-- 例如：只有当user_type包含'business'时才要求business_name
-- 但首先让我们删除有问题的约束，让注册能够正常工作

-- 4. 检查user_profiles表的结构，确保没有其他有问题的约束
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 如果需要，可以添加一个更合理的约束
-- 这个约束只对business用户类型要求business_name
-- ALTER TABLE public.user_profiles 
-- ADD CONSTRAINT check_business_name_required 
-- CHECK (
--   (user_type NOT LIKE '%business%') OR 
--   (user_type LIKE '%business%' AND business_name IS NOT NULL)
-- );
