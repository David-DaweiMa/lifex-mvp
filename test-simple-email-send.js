// 最简单的邮件发送测试
const { Resend } = require('resend');

async function testSimpleEmailSend() {
  console.log('🔍 最简单的邮件发送测试...');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz';
  
  console.log('API密钥:', apiKey ? '已设置' : '未设置');
  console.log('发件人邮箱:', fromEmail);
  
  if (!apiKey) {
    console.log('❌ 缺少RESEND_API_KEY');
    return;
  }
  
  try {
    const resend = new Resend(apiKey);
    console.log('✅ Resend客户端创建成功');
    
    // 发送最简单的测试邮件
    console.log('📧 发送测试邮件...');
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['test@example.com'],
      subject: '测试邮件 - ' + new Date().toISOString(),
      html: '<p>这是一封测试邮件</p>',
      text: '这是一封测试邮件'
    });
    
    if (error) {
      console.error('❌ 邮件发送失败:', error.message);
      return;
    }
    
    console.log('✅ 邮件发送成功!');
    console.log('邮件ID:', data?.id);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSimpleEmailSend();
