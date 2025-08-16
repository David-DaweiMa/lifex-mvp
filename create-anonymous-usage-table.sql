-- 创建匿名用户使用记录表
CREATE TABLE IF NOT EXISTS anonymous_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    usage_date DATE NOT NULL,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建唯一索引，确保每个会话每天每个功能只有一条记录
CREATE UNIQUE INDEX IF NOT EXISTS idx_anonymous_usage_unique 
ON anonymous_usage (session_id, feature, usage_date);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_session 
ON anonymous_usage (session_id);

CREATE INDEX IF NOT EXISTS idx_anonymous_usage_date 
ON anonymous_usage (usage_date);

-- 创建增量函数（如果不存在）
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN usage_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 添加RLS策略（如果需要）
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

-- 允许服务角色访问
CREATE POLICY "Service role can manage anonymous usage" ON anonymous_usage
    FOR ALL USING (auth.role() = 'service_role');

-- 清理旧数据的函数（可选）
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_usage()
RETURNS void AS $$
BEGIN
    DELETE FROM anonymous_usage 
    WHERE usage_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（可选）
-- SELECT cron.schedule('cleanup-anonymous-usage', '0 2 * * *', 'SELECT cleanup_old_anonymous_usage();');
