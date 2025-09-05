import { typedSupabase, typedSupabaseAdmin } from './supabase';

/**
 * 类型安全的Supabase查询助手
 * 解决TypeScript never类型推断问题
 */

export async function safeUserProfileQuery(
  email: string,
  fields: string = '*'
) {
  try {
    const { data, error } = await typedSupabaseAdmin
      .from('user_profiles')
      .select(fields)
      .eq('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('User profile query error:', error);
      return { data: null, error: error.message };
    }

    return { 
      data: data as any, // 临时类型断言解决 never 问题
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error in user profile query:', err);
    return { 
      data: null, 
      error: 'Database query failed' 
    };
  }
}

export async function safeAnonymousUsageQuery(
  sessionId: string,
  quotaType: string,
  date: string
) {
  try {
    const { data, error } = await typedSupabase
      .from('anonymous_usage')
      .select('usage_count')
      .eq('session_id', sessionId)
      .eq('quota_type', quotaType)
      .eq('usage_date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Anonymous usage query error:', error);
      return { data: null, error: error.message };
    }

    return { 
      data: data as any,
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error in anonymous usage query:', err);
    return { 
      data: null, 
      error: 'Database query failed' 
    };
  }
}

export async function safeInsertChatMessage(
  messageData: {
    user_id: string;
    session_id: string;
    message_type: 'user' | 'ai' | 'system';
    content: string;
    metadata?: any;
    created_at?: string;
  }
) {
  try {
    const { data, error } = await (typedSupabase as any)
      .from('chat_messages')
      .insert({
        ...messageData,
        created_at: messageData.created_at || new Date().toISOString()
      });

    if (error) {
      console.error('Chat message insert error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in chat message insert:', err);
    return { 
      data: null, 
      error: 'Database insert failed' 
    };
  }
}

export async function safeInsertAnonymousUsage(
  usageData: {
    session_id: string;
    quota_type: string;
    usage_date: string;
    usage_count?: number;
    created_at?: string;
    updated_at?: string;
  }
) {
  try {
    const { data, error } = await (typedSupabase as any)
      .from('anonymous_usage')
      .insert({
        ...usageData,
        usage_count: usageData.usage_count || 1,
        created_at: usageData.created_at || new Date().toISOString(),
        updated_at: usageData.updated_at || new Date().toISOString()
      });

    if (error) {
      console.error('Anonymous usage insert error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in anonymous usage insert:', err);
    return { 
      data: null, 
      error: 'Database insert failed' 
    };
  }
}

export async function safeUpdateAnonymousUsage(
  sessionId: string,
  quotaType: string,
  date: string
) {
  try {
    const { data, error } = await (typedSupabase as any)
      .from('anonymous_usage')
      .update({ 
        usage_count: (typedSupabase as any).rpc('increment_usage_count'),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('quota_type', quotaType)
      .eq('usage_date', date);

    if (error) {
      console.error('Anonymous usage update error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in anonymous usage update:', err);
    return { 
      data: null, 
      error: 'Database update failed' 
    };
  }
}
