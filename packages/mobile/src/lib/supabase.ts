import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
// 在React Native中，环境变量需要通过react-native-config或其他方式配置
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 检查环境变量是否存在
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Some features may not work properly.');
}

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

