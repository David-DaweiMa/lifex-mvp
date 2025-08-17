const { createClient } = require('@supabase/supabase-js');

// 测试邮件token创建
async function testEmailToken() {
  console.log('🔍 测试邮件token创建...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ 缺少环境变量');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 检查最近的用户
    console.log('📋 检查最近的用户...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (usersError) {
      console.error('❌ 获取用户失败:', usersError);
      return;
    }
    
    console.log('👥 最近的用户:', users);
    
    if (users.length > 0) {
      const latestUser = users[0];
      console.log('🔍 检查用户token:', latestUser.email);
      
      // 检查该用户的邮件确认token
      const { data: tokens, error: tokensError } = await supabase
        .from('email_confirmations')
        .select('*')
        .eq('user_id', latestUser.id)
        .eq('token_type', 'email_verification')
        .order('created_at', { ascending: false });
      
      if (tokensError) {
        console.error('❌ 获取token失败:', tokensError);
        return;
      }
      
      console.log('🔑 邮件确认token:', tokens);
      
      if (tokens.length > 0) {
        const latestToken = tokens[0];
        console.log('✅ 找到token:', {
          token: latestToken.token,
          expires_at: latestToken.expires_at,
          used_at: latestToken.used_at,
          is_expired: new Date(latestToken.expires_at) < new Date()
        });
        
        // 测试确认链接
        const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${latestToken.token}`;
        console.log('🔗 确认链接:', confirmationUrl);
      } else {
        console.log('❌ 未找到邮件确认token');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testEmailToken();
