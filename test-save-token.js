// 测试保存token到数据库
const { createClient } = require('@supabase/supabase-js');

async function testSaveToken() {
  console.log('🔍 测试保存token到数据库...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 缺少环境变量');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '已设置' : '未设置');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 生成测试token
    const testToken = 'test-token-' + Date.now();
    const testUserId = '00000000-0000-0000-0000-000000000000'; // 测试用户ID
    
    console.log('🔑 测试token:', testToken);
    console.log('👤 测试用户ID:', testUserId);
    
    // 尝试保存token
    console.log('💾 尝试保存token到数据库...');
    const { data, error } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: testUserId,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('❌ 保存token失败:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ 保存token成功!');
      console.log('保存的数据:', data);
    }
    
    // 检查是否真的保存了
    console.log('🔍 检查是否真的保存了...');
    const { data: checkData, error: checkError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .single();
    
    if (checkError) {
      console.error('❌ 查询失败:', checkError);
    } else {
      console.log('✅ 查询成功:', checkData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSaveToken();

