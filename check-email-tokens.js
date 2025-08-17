const { createClient } = require('@supabase/supabase-js');

async function checkEmailTokens() {
  console.log('🔍 检查邮件确认token...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ 缺少Supabase环境变量');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 检查最近的用户
    console.log('\n📋 检查最近的用户...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, created_at, email_verified')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (usersError) {
      console.error('❌ 获取用户失败:', usersError);
      return;
    }
    
    console.log('👥 最近的用户:', users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      email_verified: u.email_verified
    })));
    
    // 检查每个用户的邮件确认token
    for (const user of users) {
      console.log(`\n🔍 检查用户 ${user.email} 的token...`);
      
      const { data: tokens, error: tokensError } = await supabase
        .from('email_confirmations')
        .select('*')
        .eq('user_id', user.id)
        .eq('token_type', 'email_verification')
        .order('created_at', { ascending: false });
      
      if (tokensError) {
        console.error(`❌ 获取用户 ${user.email} 的token失败:`, tokensError);
        continue;
      }
      
      console.log(`📧 用户 ${user.email} 的邮件确认token:`, tokens);
      
      if (tokens.length === 0) {
        console.log(`⚠️ 用户 ${user.email} 没有邮件确认token！`);
        console.log('可能的原因:');
        console.log('- 触发器没有正常工作');
        console.log('- token被删除了');
        console.log('- 用户创建时没有触发token生成');
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkEmailTokens();
