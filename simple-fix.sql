-- 简单修复：解决schema cache问题

-- 1. 删除可能存在的category列（如果存在）
ALTER TABLE public.businesses DROP COLUMN IF EXISTS category;

-- 2. 确保category_id列存在
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category_id TEXT;

-- 3. 强制刷新schema cache
SELECT pg_reload_conf();

-- 4. 验证表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 测试查询
SELECT COUNT(*) FROM public.businesses LIMIT 1;

