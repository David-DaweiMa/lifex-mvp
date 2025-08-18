const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🌐 检查生产环境部署状态...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductionDeployment() {
  try {
    console.log('1️⃣ 检查环境配置...');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '未设置');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
    
    // 2. 检查最近的邮件确认记录
    console.log('\n2️⃣ 检查最近的邮件确认记录...');
    const { data: confirmations, error: confirmationsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (confirmationsError) {
      console.error('❌ 查询邮件确认记录失败:', confirmationsError);
    } else {
      console.log(`✅ 找到 ${confirmations.length} 条邮件确认记录`);
      if (confirmations.length > 0) {
        console.log('最近的记录:');
        confirmations.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.email} - ${record.token_type} - ${record.created_at} - 已使用: ${record.used_at ? '是' : '否'}`);
        });
      } else {
        console.log('⚠️ 没有找到任何邮件确认记录');
      }
    }

    // 3. 检查最近的用户注册记录
    console.log('\n3️⃣ 检查最近的用户注册记录...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ 查询用户记录失败:', usersError);
    } else {
      console.log(`✅ 找到 ${users.users.length} 个用户`);
      const recentUsers = users.users
        .filter(user => new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 最近7天
        .slice(0, 5);
      
      if (recentUsers.length > 0) {
        console.log('最近注册的用户:');
        recentUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} - ${user.created_at} - 邮箱确认: ${user.email_confirmed_at ? '是' : '否'}`);
        });
      } else {
        console.log('⚠️ 最近7天没有新用户注册');
      }
    }

    // 4. 检查用户配置文件
    console.log('\n4️⃣ 检查用户配置文件...');
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
          console.log(`   ${index + 1}. ${profile.email} - ${profile.user_type} - 邮箱验证: ${profile.email_verified ? '是' : '否'} - ${profile.created_at}`);
        });
      }
    }

    // 5. 部署状态分析
    console.log('\n📋 部署状态分析...');
    
    if (confirmations && confirmations.length === 0) {
      console.log('🔍 问题分析: 没有邮件确认记录');
      console.log('   可能原因:');
      console.log('   1. 生产环境还没有部署最新的代码');
      console.log('   2. 用户注册时邮件发送功能没有正常工作');
      console.log('   3. 注册流程没有触发邮件发送');
    } else {
      console.log('✅ 邮件确认记录存在，说明邮件发送功能正常工作');
    }

    if (profiles && profiles.length > 0) {
      const unverifiedProfiles = profiles.filter(p => !p.email_verified);
      if (unverifiedProfiles.length > 0) {
        console.log(`🔍 发现 ${unverifiedProfiles.length} 个未验证邮箱的用户`);
        console.log('   这表明用户注册成功，但邮箱验证流程可能有问题');
      }
    }

    // 6. 建议的解决方案
    console.log('\n🎯 建议的解决方案...');
    console.log('1. 确认Vercel部署状态:');
    console.log('   - 访问 https://vercel.com/dashboard');
    console.log('   - 检查项目的最新部署是否成功');
    console.log('   - 确认部署时间是否在代码推送之后');
    
    console.log('\n2. 测试生产环境注册:');
    console.log('   - 访问生产环境注册页面');
    console.log('   - 完成用户注册流程');
    console.log('   - 检查是否收到确认邮件');
    
    console.log('\n3. 检查Vercel函数日志:');
    console.log('   - 在Vercel Dashboard中查看函数日志');
    console.log('   - 查找邮件发送相关的错误信息');
    
    console.log('\n4. 验证环境变量:');
    console.log('   - 确认生产环境中的环境变量配置正确');
    console.log('   - 特别是 SUPABASE_SERVICE_ROLE_KEY 和 RESEND_API_KEY');

    // 7. 生产环境URL
    const productionUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (productionUrl) {
      console.log('\n🔗 生产环境链接:');
      console.log(`- 主页: ${productionUrl}`);
      console.log(`- 注册页面: ${productionUrl}/auth/register`);
      console.log(`- 登录页面: ${productionUrl}/auth/login`);
    } else {
      console.log('\n⚠️ 未设置生产环境URL (NEXT_PUBLIC_APP_URL)');
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkProductionDeployment().then(() => {
  console.log('\n🏁 生产环境部署状态检查完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
