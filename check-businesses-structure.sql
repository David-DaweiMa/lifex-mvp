-- 检查businesses表的实际结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'businesses'
ORDER BY ordinal_position;

-- 查看businesses表的所有数据
SELECT * FROM public.businesses LIMIT 5;
