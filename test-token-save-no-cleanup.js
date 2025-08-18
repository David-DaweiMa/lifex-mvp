const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 测试Token保存（不清理数据）...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTokenSaveNoCleanup() {
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
      const testEmail = 'no-cleanup-test-' + Date.now() + '@example.com';
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
      
    } else {
      console.log(`✅ 找到 ${users.users.length} 个用户`);
      
      // 使用第一个用户进行测试
      const testUser = users.users[0];
      console.log('使用用户进行测试:', testUser.email);
      
      await testTokenSave(testUser.id, testUser.email);
    }
    
    // 2. 显示当前数据库中的所有email_confirmations记录
    console.log('\n📊 显示当前数据库中的所有email_confirmations记录...');
    const { data: allRecords, error: allRecordsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allRecordsError) {
      console.error('❌ 查询所有记录失败:', allRecordsError);
    } else {
      console.log(`✅ 数据库中共有 ${allRecords.length} 条email_confirmations记录`);
      if (allRecords.length > 0) {
        console.log('所有记录:');
        allRecords.forEach((record, index) => {
          console.log(`   ${index + 1}. ID: ${record.id}`);
          console.log(`      用户ID: ${record.user_id}`);
          console.log(`      邮箱: ${record.email}`);
          console.log(`      Token: ${record.token}`);
          console.log(`      类型: ${record.token_type}`);
          console.log(`      创建时间: ${record.created_at}`);
          console.log(`      过期时间: ${record.expires_at}`);
          console.log(`      已使用: ${record.used_at ? '是' : '否'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ 数据库中没有email_confirmations记录');
      }
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
  const testToken = 'no-cleanup-test-token-' + Date.now();
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
    
    console.log('\n💡 注意：测试数据不会被清理，你可以直接在数据库中查看');
    return true;
  }
}

// 运行测试
testTokenSaveNoCleanup().then(() => {
  console.log('\n🏁 测试完成');
  console.log('📝 现在你可以检查数据库中的email_confirmations表，应该能看到测试数据');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
