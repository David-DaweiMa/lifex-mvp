const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 测试生产环境邮件发送功能...\n');

// 检查环境变量
console.log('1️⃣ 检查环境变量...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '✅ 已设置' : '❌ 未设置');

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 创建Resend客户端
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailSending() {
  try {
    // 2. 测试Resend连接
    console.log('\n2️⃣ 测试Resend连接...');
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz',
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });

      if (error) {
        console.error('❌ Resend测试失败:', error);
        console.log('错误详情:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Resend连接正常');
        console.log('邮件ID:', data?.id);
      }
    } catch (resendError) {
      console.error('❌ Resend连接异常:', resendError);
    }

    // 3. 模拟邮件发送流程
    console.log('\n3️⃣ 模拟邮件发送流程...');
    
    // 获取一个现有用户
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users.users.length) {
      console.error('❌ 无法获取用户列表:', usersError);
      return;
    }

    const testUser = users.users[0];
    console.log('使用测试用户:', testUser.email);

    // 生成测试token
    const testToken = 'test-production-token-' + Date.now();
    const username = testUser.email.split('@')[0];
    
    console.log('生成测试token:', testToken);
    console.log('用户名:', username);

    // 4. 保存token到数据库
    console.log('\n4️⃣ 保存token到数据库...');
    const { data: saveData, error: saveError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: testUser.id,
        email: testUser.email,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();

    if (saveError) {
      console.error('❌ 保存token失败:', saveError);
      return;
    }

    console.log('✅ Token保存成功');
    console.log('保存的数据:', saveData);

    // 5. 发送测试邮件
    console.log('\n5️⃣ 发送测试邮件...');
    
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${testToken}`;
    
    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz',
      to: [testUser.email],
      subject: '🧪 测试邮件 - LifeX 邮箱确认',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>测试邮件 - LifeX 邮箱确认</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 测试邮件</h1>
              <p>LifeX 邮箱确认测试</p>
            </div>
            <div class="content">
              <h2>您好 ${username}！</h2>
              <p>这是一封测试邮件，用于验证邮件发送功能是否正常工作。</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">确认邮箱地址</a>
              </div>
              
              <p><strong>测试Token:</strong> ${testToken}</p>
              <p><strong>确认链接:</strong> <a href="${confirmationUrl}">${confirmationUrl}</a></p>
              
              <p><strong>⏰ 时间限制：</strong> 此确认链接将在 24 小时后自动失效。</p>
            </div>
            <div class="footer">
              <p>此邮件由 LifeX 系统自动发送，请勿回复</p>
              <p>© 2024 LifeX. 保留所有权利。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
测试邮件 - LifeX 邮箱确认

您好 ${username}！

这是一封测试邮件，用于验证邮件发送功能是否正常工作。

请访问以下链接确认您的邮箱：
${confirmationUrl}

测试Token: ${testToken}

此链接将在 24 小时后失效。

© 2024 LifeX. 保留所有权利。
      `
    };

    const { data: emailResult, error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      console.error('❌ 邮件发送失败:', emailError);
      console.error('错误详情:', JSON.stringify(emailError, null, 2));
    } else {
      console.log('✅ 邮件发送成功！');
      console.log('邮件ID:', emailResult?.id);
      console.log('收件人:', testUser.email);
    }

    // 6. 清理测试数据
    console.log('\n6️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', testToken);

    if (deleteError) {
      console.error('❌ 清理测试数据失败:', deleteError);
    } else {
      console.log('✅ 测试数据已清理');
    }

    // 7. 总结
    console.log('\n7️⃣ 测试总结...');
    console.log('✅ Token保存功能: 正常');
    console.log('✅ 邮件发送功能: ' + (emailError ? '失败' : '正常'));
    
    if (emailError) {
      console.log('\n🔍 邮件发送失败的可能原因:');
      console.log('1. Resend API密钥无效或过期');
      console.log('2. 发件人域名未验证');
      console.log('3. 发件人邮箱地址无效');
      console.log('4. 网络连接问题');
      console.log('5. Resend服务暂时不可用');
      
      console.log('\n📋 建议的解决方案:');
      console.log('1. 检查Resend Dashboard中的API密钥状态');
      console.log('2. 验证发件人域名 (lifex.co.nz)');
      console.log('3. 检查Resend账户状态和配额');
      console.log('4. 查看Resend服务状态页面');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testEmailSending().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
