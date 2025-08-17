// 检查邮件确认token是否在数据库中
const { createClient } = require('@supabase/supabase-js');

async function checkToken() {
  console.log('🔍 检查邮件确认token...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 缺少环境变量');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 检查最近的email_confirmations记录
    console.log('📋 检查最近的email_confirmations记录...');
    const { data: confirmations, error: confirmationsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (confirmationsError) {
      console.error('❌ 查询email_confirmations失败:', confirmationsError);
      return;
    }
    
    console.log('✅ email_confirmations记录:');
    console.log(JSON.stringify(confirmations, null, 2));
    
    if (confirmations && confirmations.length > 0) {
      const latestToken = confirmations[0];
      console.log('🔑 最新的token:', latestToken.token);
      
      // 尝试调用verify_email_token函数
      console.log('🔍 测试verify_email_token函数...');
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_email_token', { 
          token: latestToken.token, 
          token_type: 'email_verification' 
        });
      
      if (verifyError) {
        console.error('❌ verify_email_token函数调用失败:', verifyError);
      } else {
        console.log('✅ verify_email_token函数结果:', verifyResult);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkToken();
