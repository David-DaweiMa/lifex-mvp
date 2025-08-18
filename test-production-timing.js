const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🌐 测试生产环境时序问题...\n');

// 使用生产环境的配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', serviceRoleKey ? '已设置' : '未设置');

// 创建客户端
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testProductionTiming() {
  try {
    console.log('1️⃣ 模拟生产环境用户创建...');
    
    const testEmail = 'prod-timing-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    
    console.log('测试邮箱:', testEmail);
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 创建用户
    console.log('\n创建用户...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false
    });
    
    const userCreateTime = Date.now() - startTime;
    console.log(`用户创建耗时: ${userCreateTime}ms`);
    
    if (authError) {
      console.error('❌ 用户创建失败:', authError);
      return;
    }
    
    console.log('✅ 用户创建成功');
    console.log('用户ID:', authData.user.id);
    console.log('创建时间:', authData.user.created_at);
    
    // 测试不同延迟下的Token保存
    const delays = [0, 100, 500, 1000, 2000]; // 0ms, 100ms, 500ms, 1s, 2s
    
    for (const delay of delays) {
      console.log(`\n2️⃣ 测试 ${delay}ms 延迟后的Token保存...`);
      
      if (delay > 0) {
        console.log(`等待 ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const tokenStartTime = Date.now();
      const testToken = `prod-timing-token-${delay}-${Date.now()}`;
      
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
      
      const tokenSaveTime = Date.now() - tokenStartTime;
      console.log(`Token保存耗时: ${tokenSaveTime}ms`);
      
      if (tokenError) {
        console.error(`❌ ${delay}ms延迟Token保存失败:`, tokenError);
        console.error('错误详情:', JSON.stringify(tokenError, null, 2));
        
        // 如果是外键约束错误，检查用户状态
        if (tokenError.code === '23503') {
          console.log('\n检查用户状态...');
          
          // 检查用户是否存在
          const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(authData.user.id);
          
          if (userCheckError) {
            console.error('❌ 用户查询失败:', userCheckError);
          } else {
            console.log('✅ 用户查询成功');
            console.log('用户状态:', userCheck.user.confirmed_at ? '已确认' : '未确认');
            console.log('用户创建时间:', userCheck.user.created_at);
          }
          
          // 检查user_profiles
          const { data: profileCheck, error: profileCheckError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          if (profileCheckError) {
            console.error('❌ user_profiles查询失败:', profileCheckError);
          } else {
            console.log('✅ user_profiles存在');
            console.log('配置文件创建时间:', profileCheck.created_at);
          }
        }
        
        // 如果是时序问题，继续测试下一个延迟
        continue;
        
      } else {
        console.log(`✅ ${delay}ms延迟Token保存成功`);
        console.log('Token数据:', tokenData);
        
        // 清理这个Token
        const { error: deleteError } = await supabase
          .from('email_confirmations')
          .delete()
          .eq('token', testToken);
        
        if (deleteError) {
          console.error('❌ 清理Token失败:', deleteError);
        } else {
          console.log('✅ Token已清理');
        }
      }
    }
    
    // 模拟并发请求
    console.log('\n3️⃣ 模拟并发请求测试...');
    
    const concurrentTokens = [];
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      const testToken = `concurrent-token-${i}-${Date.now()}`;
      concurrentTokens.push(testToken);
      
      const promise = supabase
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
      
      promises.push(promise);
    }
    
    console.log('同时发送3个Token保存请求...');
    const results = await Promise.all(promises);
    
    let successCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      if (result.error) {
        console.error(`❌ 并发请求${index + 1}失败:`, result.error);
        errorCount++;
      } else {
        console.log(`✅ 并发请求${index + 1}成功`);
        successCount++;
      }
    });
    
    console.log(`并发测试结果: ${successCount}成功, ${errorCount}失败`);
    
    // 清理并发测试数据
    if (concurrentTokens.length > 0) {
      const { error: deleteError } = await supabase
        .from('email_confirmations')
        .delete()
        .in('token', concurrentTokens);
      
      if (deleteError) {
        console.error('❌ 清理并发测试数据失败:', deleteError);
      } else {
        console.log('✅ 并发测试数据已清理');
      }
    }
    
    // 清理用户
    console.log('\n4️⃣ 清理测试用户...');
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteUserError) {
      console.error('❌ 删除用户失败:', deleteUserError);
    } else {
      console.log('✅ 用户已删除');
    }
    
    // 总结
    console.log('\n📋 生产环境时序测试总结...');
    console.log('总耗时:', Date.now() - startTime, 'ms');
    console.log('如果某些延迟下Token保存失败，说明存在时序问题');
    console.log('如果并发请求有失败，说明存在竞争条件');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testProductionTiming().then(() => {
  console.log('\n🏁 生产环境时序测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
