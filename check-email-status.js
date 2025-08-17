// 检查邮件发送状态
const { Resend } = require('resend');

async function checkEmailStatus() {
  console.log('🔍 检查邮件发送状态...');
  
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
    
    // 尝试发送测试邮件来检查状态
    console.log('📧 发送测试邮件检查状态...');
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['test@example.com'],
      subject: '邮件服务状态检查 - ' + new Date().toISOString(),
      html: '<p>这是一封状态检查邮件</p>',
      text: '这是一封状态检查邮件'
    });
    
    if (error) {
      console.error('❌ 邮件发送失败:', error.message);
      
      // 检查是否是频率限制
      if (error.message.includes('rate limit') || 
          error.message.includes('too many requests') ||
          error.message.includes('quota') ||
          error.message.includes('limit')) {
        console.log('⚠️ 检测到邮件发送频率限制！');
        console.log('💡 建议:');
        console.log('   - 等待一段时间后再试');
        console.log('   - 检查Resend控制台中的使用量');
        console.log('   - 考虑升级Resend计划');
      } else if (error.message.includes('unauthorized') || 
                 error.message.includes('invalid')) {
        console.log('⚠️ API密钥可能无效');
      } else if (error.message.includes('domain') || 
                 error.message.includes('from')) {
        console.log('⚠️ 发件人邮箱可能未验证');
      }
      
      return;
    }
    
    console.log('✅ 邮件发送成功!');
    console.log('邮件ID:', data?.id);
    console.log('💡 邮件服务正常工作');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkEmailStatus();
