const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 生产环境邮件调试工具\n');

// 检查环境变量
console.log('1️⃣ 检查环境变量...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '✅ 已设置' : '❌ 未设置');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugProductionEmail() {
  try {
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

    // 5. 检查触发器日志
    console.log('\n5️⃣ 检查触发器日志...');
    const { data: triggerLogs, error: triggerLogsError } = await supabase
      .from('trigger_logs')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(5);

    if (triggerLogsError) {
      console.error('❌ 查询触发器日志失败:', triggerLogsError);
    } else {
      console.log(`✅ 找到 ${triggerLogs.length} 条触发器日志`);
      if (triggerLogs.length > 0) {
        console.log('最近的触发器日志:');
        triggerLogs.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.function_name} - ${log.status} - ${log.execution_time}`);
          if (log.error_message) {
            console.log(`      错误: ${log.error_message}`);
          }
        });
      }
    }

    // 6. 分析问题
    console.log('\n6️⃣ 问题分析...');
    
    if (confirmations && confirmations.length === 0) {
      console.log('🔍 问题1: 没有邮件确认记录');
      console.log('   可能原因:');
      console.log('   - 邮件发送失败');
      console.log('   - Token保存失败');
      console.log('   - 注册流程没有触发邮件发送');
    }

    if (profiles && profiles.length > 0) {
      const unverifiedProfiles = profiles.filter(p => !p.email_verified);
      if (unverifiedProfiles.length > 0) {
        console.log('🔍 问题2: 有未验证邮箱的用户配置文件');
        console.log(`   未验证用户数量: ${unverifiedProfiles.length}`);
        console.log('   可能原因:');
        console.log('   - 邮件发送失败');
        console.log('   - 用户没有点击确认链接');
        console.log('   - 确认链接失效');
      }
    }

    if (triggerLogs && triggerLogs.length > 0) {
      const failedLogs = triggerLogs.filter(log => log.status === 'error');
      if (failedLogs.length > 0) {
        console.log('🔍 问题3: 有触发器执行失败');
        console.log(`   失败数量: ${failedLogs.length}`);
        console.log('   可能原因:');
        console.log('   - 数据库权限问题');
        console.log('   - 触发器函数错误');
        console.log('   - RLS策略阻止操作');
      }
    }

    // 7. 建议的解决方案
    console.log('\n7️⃣ 建议的解决方案...');
    console.log('1. 检查Vercel函数日志:');
    console.log('   - 访问Vercel Dashboard');
    console.log('   - 查看函数执行日志');
    console.log('   - 查找邮件发送相关的错误');
    
    console.log('\n2. 检查邮件服务配置:');
    console.log('   - 验证Resend API密钥');
    console.log('   - 检查发件人域名验证');
    console.log('   - 测试邮件发送功能');
    
    console.log('\n3. 检查数据库权限:');
    console.log('   - 验证RLS策略配置');
    console.log('   - 检查服务角色权限');
    console.log('   - 确认表结构正确');

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 运行调试
debugProductionEmail().then(() => {
  console.log('\n🏁 调试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 调试失败:', error);
  process.exit(1);
});
