// 简单邮件发送测试
const { Resend } = require('resend');

async function testSimpleEmail() {
  console.log('🔍 简单邮件发送测试...');
  
  // 检查环境变量
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz';
  
  console.log('API密钥:', apiKey ? '已设置' : '未设置');
  console.log('发件人邮箱:', fromEmail);
  
  if (!apiKey) {
    console.log('❌ 缺少RESEND_API_KEY');
    console.log('💡 请在Vercel中检查环境变量设置');
    return;
  }
  
  try {
    const resend = new Resend(apiKey);
    console.log('✅ Resend客户端创建成功');
    
    // 发送简单测试邮件
    console.log('📧 发送简单测试邮件...');
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['test@example.com'],
      subject: 'LifeX 邮件服务测试 - ' + new Date().toISOString(),
      html: `
        <h2>LifeX 邮件服务测试</h2>
        <p>这是一封测试邮件，用于验证邮件服务是否正常工作。</p>
        <p>发送时间: ${new Date().toISOString()}</p>
        <p>如果您收到这封邮件，说明邮件服务正常工作。</p>
      `,
      text: `
LifeX 邮件服务测试

这是一封测试邮件，用于验证邮件服务是否正常工作。
发送时间: ${new Date().toISOString()}

如果您收到这封邮件，说明邮件服务正常工作。
      `
    });
    
    if (error) {
      console.error('❌ 邮件发送失败:', error);
      console.error('错误详情:', error.message);
      
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        console.log('⚠️ 邮件发送频率限制');
      } else if (error.message.includes('unauthorized') || error.message.includes('invalid')) {
        console.log('⚠️ API密钥可能无效');
      } else if (error.message.includes('domain') || error.message.includes('from')) {
        console.log('⚠️ 发件人邮箱可能未验证');
      }
      
      return;
    }
    
    console.log('✅ 邮件发送成功!');
    console.log('邮件ID:', data?.id);
    console.log('💡 请检查收件箱和垃圾邮件文件夹');
    
  } catch (error) {
    console.error('❌ 邮件发送异常:', error);
  }
}

testSimpleEmail();
