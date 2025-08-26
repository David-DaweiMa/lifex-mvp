-- 创建trigger_logs表用于记录触发器执行日志

-- 1. 创建trigger_logs表
CREATE TABLE IF NOT EXISTS public.trigger_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_id ON public.trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_status ON public.trigger_logs(status);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_execution_time ON public.trigger_logs(execution_time);

-- 3. 启用RLS
ALTER TABLE public.trigger_logs ENABLE ROW LEVEL SECURITY;

-- 4. 创建RLS策略（只允许管理员访问）
CREATE POLICY "Admin can view all trigger logs" ON public.trigger_logs
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can insert trigger logs" ON public.trigger_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 5. 验证表创建成功
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trigger_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;
