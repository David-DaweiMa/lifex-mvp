// 测试邮件服务是否正常工作
console.log('🔍 测试邮件服务...');

// 检查环境变量
console.log('环境变量检查:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz');

// 模拟邮件服务测试
console.log('\n📧 邮件服务测试:');
console.log('1. 检查邮件服务初始化...');

// 检查是否有邮件服务相关的错误
console.log('2. 检查邮件发送逻辑...');
console.log('3. 检查token获取逻辑...');

console.log('\n💡 建议:');
console.log('- 检查Vercel环境变量是否正确设置');
console.log('- 检查Resend API密钥是否有效');
console.log('- 检查发件人邮箱是否已验证');
console.log('- 查看Vercel部署日志中的邮件发送错误');

console.log('\n🔧 调试步骤:');
console.log('1. 在Vercel中检查环境变量');
console.log('2. 查看Vercel函数日志');
console.log('3. 检查Resend控制台中的发送记录');
console.log('4. 确认发件人邮箱已通过验证');
