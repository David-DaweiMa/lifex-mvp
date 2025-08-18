const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTokenSave() {
  console.log('🔍 最终测试token保存功能...\n');

  try {
    // 1. 检查现有数据
    console.log('1️⃣ 检查现有数据...');
    const { data: existingData, error: existingError } = await supabase
      .from('email_confirmations')
      .select('*')
      .limit(5);

    if (existingError) {
      console.error('❌ 查询失败:', existingError);
      return;
    }
    
    console.log(`✅ 现有数据数量: ${existingData.length}`);
    if (existingData.length > 0) {
      console.log('最近的数据:');
      existingData.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.email} - ${record.token_type} - ${record.created_at}`);
      });
    }

    // 2. 创建一个测试用户（如果不存在）
    console.log('\n2️⃣ 创建测试用户...');
    const testEmail = 'test-token-save@example.com';
    const testPassword = 'testpassword123';
    
    // 尝试注册测试用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ 测试用户已存在');
        // 尝试登录获取用户ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (signInError) {
          console.error('❌ 登录测试用户失败:', signInError);
          return;
        }
        
        var testUserId = signInData.user.id;
      } else {
        console.error('❌ 创建测试用户失败:', authError);
        return;
      }
    } else {
      console.log('✅ 测试用户创建成功');
      var testUserId = authData.user.id;
    }

    console.log('测试用户ID:', testUserId);

    // 3. 尝试插入token
    console.log('\n3️⃣ 测试token保存...');
    const testToken = 'test-token-' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: testUserId,
        email: testEmail,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ 插入token失败:', insertError);
      console.error('错误详情:', JSON.stringify(insertError, null, 2));
      return;
    }

    console.log('✅ Token保存成功！');
    console.log('插入的数据:', insertData);

    // 4. 验证token可以被查询
    console.log('\n4️⃣ 验证token查询...');
    const { data: queryData, error: queryError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .single();

    if (queryError) {
      console.error('❌ 查询token失败:', queryError);
    } else {
      console.log('✅ Token查询成功');
      console.log('查询结果:', queryData);
    }

    // 5. 清理测试数据
    console.log('\n5️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', testToken);

    if (deleteError) {
      console.error('❌ 清理测试数据失败:', deleteError);
    } else {
      console.log('✅ 测试数据已清理');
    }

    // 6. 最终验证
    console.log('\n6️⃣ 最终验证...');
    const { data: finalData, error: finalError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken);

    if (finalError) {
      console.error('❌ 最终验证失败:', finalError);
    } else {
      console.log(`✅ 最终验证成功，剩余数据: ${finalData.length}`);
    }

    console.log('\n🎉 测试完成！Token保存功能正常工作！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testTokenSave().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
