-- 重新添加外键约束的完整脚本
-- 请在Supabase SQL编辑器中运行

-- 第一步：检查是否存在auth.users表
SELECT 
  table_name, 
  table_schema,
  'auth.users table exists' as status
FROM information_schema.tables 
WHERE table_name = 'users' 
AND table_schema IN ('auth', 'public');

-- 第二步：检查auth.users表的结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 第三步：检查当前user_profiles表的外键约束
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 第四步：检查测试用户数据
SELECT 
  id,
  email,
  username,
  'Test user data' as note
FROM user_profiles 
WHERE email LIKE 'test.user%@lifex.com'
ORDER BY email;

-- 第五步：在auth.users表中创建对应的测试用户记录
-- 注意：这需要管理员权限
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) 
SELECT 
  up.id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  up.email,
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  json_build_object('full_name', up.full_name),
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
FROM user_profiles up
WHERE up.email LIKE 'test.user%@lifex.com'
AND NOT EXISTS (
  SELECT 1 FROM auth.users au WHERE au.id = up.id
);

-- 第六步：验证auth.users表中的记录已创建
SELECT 
  id,
  email,
  created_at,
  'Auth user created' as status
FROM auth.users 
WHERE id IN (
  SELECT id FROM user_profiles WHERE email LIKE 'test.user%@lifex.com'
)
ORDER BY email;

-- 第七步：添加外键约束
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 第八步：验证外键约束已添加
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  'Foreign key constraint added successfully' as status
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

-- 第九步：最终验证
SELECT 
  'Foreign key constraint setup completed successfully' as final_status,
  COUNT(*) as test_users_with_auth_records
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email LIKE 'test.user%@lifex.com';
