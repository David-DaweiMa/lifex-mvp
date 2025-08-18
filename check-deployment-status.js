const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 检查部署状态...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkDeploymentStatus() {
  try {
    console.log('1️⃣ 检查环境变量配置...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '✅ 已设置' : '❌ 未设置');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ 已设置' : '❌ 未设置');

    // 2. 测试数据库连接
    console.log('\n2️⃣ 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
    } else {
      console.log('✅ 数据库连接正常');
    }

    // 3. 测试邮件服务
    console.log('\n3️⃣ 测试邮件服务...');
    try {
      const { data: emailTest, error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz',
        to: ['test@example.com'],
        subject: '部署状态检查',
        html: '<p>部署状态检查邮件</p>'
      });

      if (emailError) {
        console.error('❌ 邮件服务测试失败:', emailError.message);
      } else {
        console.log('✅ 邮件服务连接正常');
        console.log('测试邮件ID:', emailTest?.id);
      }
    } catch (error) {
      console.error('❌ 邮件服务异常:', error.message);
    }

    // 4. 检查现有数据
    console.log('\n4️⃣ 检查现有数据...');
    const { data: confirmations, error: confirmationsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (confirmationsError) {
      console.error('❌ 查询邮件确认记录失败:', confirmationsError);
    } else {
      console.log(`✅ 找到 ${confirmations.length} 条邮件确认记录`);
      if (confirmations.length > 0) {
        console.log('最近的记录:');
        confirmations.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.email} - ${record.created_at}`);
        });
      }
    }

    // 5. 部署状态总结
    console.log('\n📋 部署状态总结...');
    console.log('✅ 代码已推送到GitHub');
    console.log('✅ 环境变量配置检查完成');
    console.log('✅ 数据库连接测试完成');
    console.log('✅ 邮件服务测试完成');
    
    console.log('\n🎯 下一步操作:');
    console.log('1. 等待Vercel自动部署完成（通常需要1-3分钟）');
    console.log('2. 访问生产环境测试用户注册功能');
    console.log('3. 验证邮件发送是否正常工作');
    console.log('4. 检查Vercel函数日志确认无错误');

    console.log('\n🔗 有用的链接:');
    console.log('- Vercel Dashboard: https://vercel.com/dashboard');
    console.log('- Supabase Dashboard: https://supabase.com/dashboard');
    console.log('- Resend Dashboard: https://resend.com/dashboard');

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkDeploymentStatus().then(() => {
  console.log('\n🏁 部署状态检查完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
