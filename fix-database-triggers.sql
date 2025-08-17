-- 数据库触发器修复脚本
-- 专门解决 handle_new_user 触发器问题

-- 1. 检查并删除现有的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除现有的触发器函数
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 删除现有的配额设置函数
DROP FUNCTION IF EXISTS public.setup_user_quotas(UUID);

-- 4. 创建新的配额设置函数（基于新的用户分类）
CREATE OR REPLACE FUNCTION public.setup_user_quotas(user_id UUID, user_type TEXT DEFAULT 'customer')
RETURNS void AS $$
BEGIN
  -- 根据用户类型设置不同的配额
  CASE user_type
    WHEN 'anonymous' THEN
      -- 匿名用户配额（实际上不应该通过触发器创建）
      NULL;
    WHEN 'free' THEN
      -- 免费用户配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 20, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 10, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 2, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 0, 'total', NULL),
        (user_id, 'stores', 0, 0, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    WHEN 'customer' THEN
      -- 普通用户配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 100, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 50, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 10, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 0, 'total', NULL),
        (user_id, 'stores', 0, 0, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    WHEN 'premium' THEN
      -- 高级用户配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 500, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 200, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 50, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 0, 'total', NULL),
        (user_id, 'stores', 0, 0, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    WHEN 'free_business' THEN
      -- 免费商家配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 20, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 10, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 2, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 20, 'total', NULL),
        (user_id, 'stores', 0, 2, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    WHEN 'professional_business' THEN
      -- 专业商家配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 100, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 50, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 10, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 50, 'total', NULL),
        (user_id, 'stores', 0, 3, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    WHEN 'enterprise_business' THEN
      -- 企业商家配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 500, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 200, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 50, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 200, 'total', NULL),
        (user_id, 'stores', 0, 10, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
    ELSE
      -- 默认使用 customer 配额
      INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
      VALUES 
        (user_id, 'chat', 0, 100, 'daily', CURRENT_DATE + INTERVAL '1 day'),
        (user_id, 'trending', 0, 50, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'ads', 0, 10, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
        (user_id, 'products', 0, 0, 'total', NULL),
        (user_id, 'stores', 0, 0, 'total', NULL)
      ON CONFLICT (user_id, quota_type) DO NOTHING;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建新的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- 从用户元数据中获取用户类型
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer');
  
  -- 为新用户创建配置文件
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    user_type,
    is_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    user_type,
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  
  -- 为新用户设置配额
  PERFORM public.setup_user_quotas(NEW.id, user_type);
  
  -- 记录触发器执行日志
  INSERT INTO public.trigger_logs (trigger_name, user_id, execution_time, status)
  VALUES ('handle_new_user', NEW.id, NOW(), 'success')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误日志
    INSERT INTO public.trigger_logs (trigger_name, user_id, execution_time, status, error_message)
    VALUES ('handle_new_user', NEW.id, NOW(), 'error', SQLERRM)
    ON CONFLICT DO NOTHING;
    
    -- 重新抛出错误
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建触发器日志表（如果不存在）
CREATE TABLE IF NOT EXISTS public.trigger_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_name TEXT NOT NULL,
  user_id UUID,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 为触发器日志表启用 RLS
ALTER TABLE public.trigger_logs ENABLE ROW LEVEL SECURITY;

-- 8. 为触发器日志表创建 RLS 策略
DROP POLICY IF EXISTS "Service role can manage trigger logs" ON public.trigger_logs;
CREATE POLICY "Service role can manage trigger logs" ON public.trigger_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 9. 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. 验证触发器创建
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 11. 验证函数创建
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'setup_user_quotas');

-- 12. 完成消息
SELECT 'Database triggers have been fixed successfully!' as status;
