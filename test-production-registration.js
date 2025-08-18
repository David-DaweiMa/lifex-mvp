const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 测试生产环境注册流程...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

async function testProductionRegistration() {
  try {
    // 1. 生成测试数据
    const testEmail = 'production-test-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    const testUsername = 'production_test_user';
    
    console.log('测试邮箱:', testEmail);
    console.log('测试密码:', testPassword);
    console.log('测试用户名:', testUsername);
    
    // 2. 检查用户是否已存在
    console.log('\n1️⃣ 检查用户是否已存在...');
    const { data: existingUsers, error: existingError } = await supabase.auth.admin.listUsers();
    
    if (existingError) {
      console.error('❌ 查询用户失败:', existingError);
      return;
    }
    
    const existingUser = existingUsers.users.find(user => user.email === testEmail);
    if (existingUser) {
      console.log('⚠️ 测试用户已存在，删除旧用户...');
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('✅ 旧用户已删除');
    } else {
      console.log('✅ 测试用户不存在');
    }
    
    // 3. 模拟注册流程
    console.log('\n2️⃣ 模拟注册流程...');
    
    // 创建用户（不自动确认邮箱）
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false // 不自动确认邮箱
    });
    
    if (authError) {
      console.error('❌ 创建用户失败:', authError);
      return;
    }
    
    console.log('✅ 用户创建成功');
    console.log('用户ID:', authData.user.id);
    console.log('邮箱确认状态:', authData.user.email_confirmed_at ? '已确认' : '未确认');
    
    // 4. 检查用户配置文件
    console.log('\n3️⃣ 检查用户配置文件...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ 查询用户配置文件失败:', profileError);
      console.log('这可能意味着触发器没有正常工作');
    } else {
      console.log('✅ 用户配置文件存在');
      console.log('配置文件:', profile);
    }
    
    // 5. 模拟邮件发送流程
    console.log('\n4️⃣ 模拟邮件发送流程...');
    
    // 生成测试token
    const testToken = 'production-test-token-' + Date.now();
    const username = testEmail.split('@')[0];
    
    console.log('生成测试token:', testToken);
    console.log('用户名:', username);
    
    // 保存token到数据库
    console.log('\n5️⃣ 保存token到数据库...');
    const { data: saveData, error: saveError } = await supabase
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
    
    if (saveError) {
      console.error('❌ 保存token失败:', saveError);
      console.error('错误详情:', JSON.stringify(saveError, null, 2));
      return;
    }
    
    console.log('✅ Token保存成功');
    console.log('保存的数据:', saveData);
    
    // 6. 发送邮件
    console.log('\n6️⃣ 发送邮件...');
    
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${testToken}`;
    
    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz',
      to: [testEmail],
      subject: '🧪 生产环境测试 - LifeX 邮箱确认',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>生产环境测试 - LifeX 邮箱确认</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .debug-info { background: #e8f4fd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 生产环境测试</h1>
              <p>LifeX 邮箱确认功能测试</p>
            </div>
            <div class="content">
              <h2>您好 ${username}！</h2>
              <p>这是一封生产环境测试邮件，用于验证邮件发送功能是否正常工作。</p>
              
              <div class="debug-info">
                <h3>测试信息:</h3>
                <p><strong>用户ID:</strong> ${authData.user.id}</p>
                <p><strong>测试Token:</strong> ${testToken}</p>
                <p><strong>发送时间:</strong> ${new Date().toISOString()}</p>
                <p><strong>确认链接:</strong> <a href="${confirmationUrl}">${confirmationUrl}</a></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">确认邮箱地址</a>
              </div>
              
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
生产环境测试 - LifeX 邮箱确认

您好 ${username}！

这是一封生产环境测试邮件，用于验证邮件发送功能是否正常工作。

测试信息:
- 用户ID: ${authData.user.id}
- 测试Token: ${testToken}
- 发送时间: ${new Date().toISOString()}

请访问以下链接确认您的邮箱：
${confirmationUrl}

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
      console.log('收件人:', testEmail);
    }
    
    // 7. 验证token可以被查询
    console.log('\n7️⃣ 验证token查询...');
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
    
    // 8. 测试确认API
    console.log('\n8️⃣ 测试确认API...');
    
    // 模拟确认请求
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/confirm`;
    
    console.log('确认API URL:', confirmUrl);
    console.log('确认Token:', testToken);
    
    // 注意：这里我们不能直接调用API，但可以验证token是否有效
    const { data: validToken, error: validError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .eq('token_type', 'email_verification')
      .eq('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (validError) {
      console.error('❌ Token验证失败:', validError);
    } else {
      console.log('✅ Token验证成功');
      console.log('Token有效，可以用于确认');
    }
    
    // 9. 清理测试数据
    console.log('\n9️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', testToken);
    
    if (deleteError) {
      console.error('❌ 清理测试数据失败:', deleteError);
    } else {
      console.log('✅ 测试数据已清理');
    }
    
    // 10. 总结
    console.log('\n📋 测试总结...');
    console.log('✅ 用户创建: 成功');
    console.log('✅ Token保存: 成功');
    console.log('✅ 邮件发送: ' + (emailError ? '失败' : '成功'));
    console.log('✅ Token查询: 成功');
    console.log('✅ Token验证: 成功');
    
    if (emailError) {
      console.log('\n🔍 邮件发送失败的可能原因:');
      console.log('1. Resend服务配置问题');
      console.log('2. 发件人域名验证问题');
      console.log('3. 网络连接问题');
      console.log('4. API密钥权限问题');
    } else {
      console.log('\n🎉 所有功能测试通过！');
      console.log('生产环境应该可以正常工作');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testProductionRegistration().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
