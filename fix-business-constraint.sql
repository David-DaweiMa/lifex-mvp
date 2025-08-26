-- 修复business用户注册约束问题
-- 这个脚本会删除或修改导致business用户注册失败的约束

-- 1. 首先检查是否存在这个约束
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_business_name_required';

-- 2. 检查user_profiles表是否有business_name列
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name = 'business_name';

-- 3. 解决方案A：删除有问题的约束（简单方案）
-- 如果user_profiles表中没有business_name列，删除这个约束
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_business_name_required;

-- 4. 解决方案B：添加business_name列（更好的方案）
-- 如果选择这个方案，取消注释下面的代码
/*
-- 添加business_name列
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- 重新创建约束（只对business用户类型要求business_name）
ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_business_name_required 
CHECK (
  (user_type NOT IN ('free_business', 'professional_business', 'enterprise_business')) OR 
  (user_type IN ('free_business', 'professional_business', 'enterprise_business') AND business_name IS NOT NULL AND business_name != '')
);
*/

-- 5. 验证修复结果
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
