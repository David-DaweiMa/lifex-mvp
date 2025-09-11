-- 强制删除外键约束的脚本
-- 请在Supabase SQL编辑器中运行

-- 1. 检查所有可能的外键约束名称
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public';

-- 2. 尝试删除所有可能的外键约束名称
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_pkey;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_id;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_user_id;

-- 3. 使用更通用的方法删除所有外键约束
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'user_profiles'
        AND table_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- 4. 验证所有外键约束已删除
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. 显示结果
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'All foreign key constraints removed successfully'
    ELSE 'Some constraints still exist: ' || COUNT(*) || ' remaining'
  END as status
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';
