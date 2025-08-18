const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🌐 检查生产环境配置...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductionConfig() {
  try {
    console.log('1️⃣ 检查环境变量...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '未设置');
    
    // 2. 检查数据库连接
    console.log('\n2️⃣ 检查数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError);
      return;
    } else {
      console.log('✅ 数据库连接正常');
    }
    
    // 3. 检查email_confirmations表
    console.log('\n3️⃣ 检查email_confirmations表...');
    const { data: confirmations, error: confirmationsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (confirmationsError) {
      console.error('❌ 查询email_confirmations失败:', confirmationsError);
    } else {
      console.log(`✅ 找到 ${confirmations.length} 条email_confirmations记录`);
      if (confirmations.length > 0) {
        console.log('最近的记录:');
        confirmations.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.email} - ${record.token} - ${record.created_at}`);
        });
      } else {
        console.log('⚠️ email_confirmations表为空');
      }
    }
    
    // 4. 检查用户数据
    console.log('\n4️⃣ 检查用户数据...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError);
    } else {
      console.log(`✅ 找到 ${users.users.length} 个用户`);
      const recentUsers = users.users
        .filter(user => new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) // 最近24小时
        .slice(0, 5);
      
      if (recentUsers.length > 0) {
        console.log('最近24小时注册的用户:');
        recentUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} - ${user.created_at} - 邮箱确认: ${user.email_confirmed_at ? '是' : '否'}`);
        });
      }
    }
    
    // 5. 检查用户配置文件
    console.log('\n5️⃣ 检查用户配置文件...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (profilesError) {
      console.error('❌ 查询用户配置文件失败:', profilesError);
    } else {
      console.log(`✅ 找到 ${profiles.length} 个用户配置文件`);
      if (profiles.length > 0) {
        console.log('最近的配置文件:');
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} - 邮箱验证: ${profile.email_verified ? '是' : '否'} - ${profile.created_at}`);
        });
      }
    }
    
    // 6. 分析问题
    console.log('\n📋 问题分析...');
    
    if (confirmations && confirmations.length === 0) {
      console.log('🔍 发现: email_confirmations表为空');
      console.log('   这表明生产环境可能:');
      console.log('   1. 使用了不同的数据库');
      console.log('   2. 环境变量配置错误');
      console.log('   3. 邮件发送时Token保存失败');
    }
    
    if (users && users.users.length > 0) {
      const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at);
      if (unconfirmedUsers.length > 0) {
        console.log(`🔍 发现: ${unconfirmedUsers.length} 个未确认邮箱的用户`);
        console.log('   这表明用户注册成功，但邮箱确认流程有问题');
      }
    }
    
    // 7. 建议解决方案
    console.log('\n🎯 建议解决方案...');
    console.log('1. 检查Vercel环境变量:');
    console.log('   - 确认 NEXT_PUBLIC_SUPABASE_URL 设置正确');
    console.log('   - 确认 SUPABASE_SERVICE_ROLE_KEY 设置正确');
    console.log('   - 确认 RESEND_API_KEY 设置正确');
    
    console.log('\n2. 检查Supabase项目:');
    console.log('   - 确认使用的是正确的Supabase项目');
    console.log('   - 检查RLS策略配置');
    
    console.log('\n3. 测试Token保存:');
    console.log('   - 在生产环境中测试Token保存功能');
    console.log('   - 检查Vercel函数日志');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkProductionConfig().then(() => {
  console.log('\n🏁 检查完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
