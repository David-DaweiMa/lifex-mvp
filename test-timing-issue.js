const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('⏰ 测试用户创建和Token保存的时序问题...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTimingIssue() {
  try {
    console.log('1️⃣ 测试用户创建和立即Token保存...');
    
    const testEmail = 'timing-test-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    
    console.log('测试邮箱:', testEmail);
    
    // 创建用户
    console.log('\n创建用户...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false
    });
    
    if (authError) {
      console.error('❌ 用户创建失败:', authError);
      return;
    }
    
    console.log('✅ 用户创建成功');
    console.log('用户ID:', authData.user.id);
    console.log('创建时间:', authData.user.created_at);
    
    // 立即尝试保存Token
    console.log('\n立即尝试保存Token...');
    const testToken = 'timing-test-token-' + Date.now();
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (tokenError) {
      console.error('❌ 立即Token保存失败:', tokenError);
      console.error('错误详情:', JSON.stringify(tokenError, null, 2));
      
      // 检查用户是否真的存在
      console.log('\n检查用户是否真的存在...');
      const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(authData.user.id);
      
      if (userCheckError) {
        console.error('❌ 用户查询失败:', userCheckError);
      } else {
        console.log('✅ 用户查询成功');
        console.log('用户存在:', userCheck.user);
      }
      
      // 检查user_profiles
      console.log('\n检查user_profiles...');
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileCheckError) {
        console.error('❌ user_profiles查询失败:', profileCheckError);
      } else {
        console.log('✅ user_profiles存在');
        console.log('配置文件:', profileCheck);
      }
      
    } else {
      console.log('✅ 立即Token保存成功');
      console.log('Token数据:', tokenData);
    }
    
    // 等待一段时间后再次尝试
    console.log('\n2️⃣ 等待2秒后再次尝试Token保存...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testToken2 = 'timing-test-token-2-' + Date.now();
    
    const { data: tokenData2, error: tokenError2 } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        token: testToken2,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (tokenError2) {
      console.error('❌ 延迟Token保存也失败:', tokenError2);
    } else {
      console.log('✅ 延迟Token保存成功');
      console.log('Token数据:', tokenData2);
    }
    
    // 清理测试数据
    console.log('\n3️⃣ 清理测试数据...');
    
    // 删除Token记录
    const { error: deleteTokenError } = await supabase
      .from('email_confirmations')
      .delete()
      .in('token', [testToken, testToken2]);
    
    if (deleteTokenError) {
      console.error('❌ 删除Token记录失败:', deleteTokenError);
    } else {
      console.log('✅ Token记录已清理');
    }
    
    // 删除用户
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteUserError) {
      console.error('❌ 删除用户失败:', deleteUserError);
    } else {
      console.log('✅ 用户已删除');
    }
    
    // 总结
    console.log('\n📋 时序问题测试总结...');
    console.log('如果立即Token保存失败，但延迟保存成功，说明存在时序问题');
    console.log('如果都失败，说明是其他问题（如外键约束）');
    console.log('如果都成功，说明时序没有问题');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testTimingIssue().then(() => {
  console.log('\n🏁 时序问题测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
