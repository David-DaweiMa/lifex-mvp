// 直接测试邮件发送
const { Resend } = require('resend');

async function testDirectEmail() {
  console.log('🔍 直接测试邮件发送...');
  
  // 检查环境变量
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz';
  
  console.log('API密钥:', apiKey ? '已设置' : '未设置');
  console.log('发件人邮箱:', fromEmail);
  
  if (!apiKey) {
    console.log('❌ 缺少RESEND_API_KEY，无法测试');
    return;
  }
  
  try {
    const resend = new Resend(apiKey);
    console.log('✅ Resend客户端创建成功');
    
    // 发送测试邮件
    console.log('📧 发送测试邮件...');
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['test@example.com'], // 使用测试邮箱
      subject: 'LifeX 邮件服务测试',
      html: '<p>这是一封测试邮件，用于验证邮件服务是否正常工作。</p>',
      text: '这是一封测试邮件，用于验证邮件服务是否正常工作。'
    });
    
    if (error) {
      console.error('❌ 邮件发送失败:', error);
      console.error('错误详情:', error.message);
      return;
    }
    
    console.log('✅ 邮件发送成功!');
    console.log('邮件ID:', data?.id);
    
  } catch (error) {
    console.error('❌ 邮件发送异常:', error);
  }
}

testDirectEmail();
