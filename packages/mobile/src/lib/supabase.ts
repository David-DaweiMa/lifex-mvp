import { createClient } from '@supabase/supabase-js';

// 从环境变量或配置文件获取Supabase配置
// 注意：在生产环境中，这些值应该从环境变量获取
const supabaseUrl = 'http://localhost:54321'; // 本地开发
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新token
    autoRefreshToken: true,
    // 持久化session
    persistSession: true,
    // 检测URL中的auth回调
    detectSessionInUrl: false,
  },
});

// 导出类型
export type { User, Session, AuthError } from '@supabase/supabase-js';

