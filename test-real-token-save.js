const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 测试真实Token保存...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRealTokenSave() {
  try {
    // 1. 获取现有用户
    console.log('1️⃣ 获取现有用户...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ 获取用户失败:', usersError);
      return;
    }
    
    if (users.users.length === 0) {
      console.log('⚠️ 没有找到用户，创建测试用户...');
      
      // 创建测试用户
      const testEmail = 'real-test-' + Date.now() + '@example.com';
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: false
      });
      
      if (createError) {
        console.error('❌ 创建测试用户失败:', createError);
        return;
      }
      
      console.log('✅ 创建测试用户成功:', newUser.user.id);
      const testUserId = newUser.user.id;
      
      // 测试token保存
      await testTokenSave(testUserId, testEmail);
      
      // 清理测试用户
      await supabase.auth.admin.deleteUser(testUserId);
      
    } else {
      console.log(`✅ 找到 ${users.users.length} 个用户`);
      
      // 使用第一个用户进行测试
      const testUser = users.users[0];
      console.log('使用用户进行测试:', testUser.email);
      
      await testTokenSave(testUser.id, testUser.email);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

async function testTokenSave(userId, userEmail) {
  console.log('\n2️⃣ 测试Token保存...');
  console.log('用户ID:', userId);
  console.log('用户邮箱:', userEmail);
  
  // 生成测试token
  const testToken = 'real-test-token-' + Date.now();
  console.log('测试Token:', testToken);
  
  // 尝试保存token
  const { data: saveData, error: saveError } = await supabase
    .from('email_confirmations')
    .insert({
      user_id: userId,
      email: userEmail,
      token: testToken,
      token_type: 'email_verification',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    })
    .select();
  
  if (saveError) {
    console.error('❌ Token保存失败:', saveError);
    console.error('错误详情:', JSON.stringify(saveError, null, 2));
    
    // 分析错误类型
    if (saveError.code === '23505') {
      console.log('🔍 错误分析: 唯一约束冲突');
    } else if (saveError.code === '23503') {
      console.log('🔍 错误分析: 外键约束失败');
    } else if (saveError.code === '23502') {
      console.log('🔍 错误分析: 非空约束失败');
    } else if (saveError.code === '42501') {
      console.log('🔍 错误分析: 权限不足');
    } else {
      console.log('🔍 错误分析: 其他数据库错误');
    }
    
    return false;
  } else {
    console.log('✅ Token保存成功');
    console.log('保存的数据:', saveData);
    
    // 验证保存的数据
    console.log('\n3️⃣ 验证保存的数据...');
    const { data: queryData, error: queryError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .single();
    
    if (queryError) {
      console.error('❌ 查询保存的数据失败:', queryError);
    } else {
      console.log('✅ 查询成功');
      console.log('查询结果:', queryData);
    }
    
    // 清理测试数据
    console.log('\n4️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', testToken);
    
    if (deleteError) {
      console.error('❌ 清理测试数据失败:', deleteError);
    } else {
      console.log('✅ 测试数据已清理');
    }
    
    return true;
  }
}

// 运行测试
testRealTokenSave().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
