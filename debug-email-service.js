// 调试邮件服务问题
console.log('🔍 调试邮件服务问题...');

// 模拟邮件服务初始化
console.log('\n1. 检查邮件服务初始化:');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz';
console.log('发件人邮箱:', fromEmail);

if (process.env.RESEND_API_KEY) {
  console.log('✅ RESEND_API_KEY 已配置');
  try {
    // 这里不实际初始化Resend，只是检查配置
    console.log('✅ Resend 配置看起来正确');
  } catch (error) {
    console.error('❌ Resend 初始化失败:', error);
  }
} else {
  console.log('❌ RESEND_API_KEY 未配置');
}

console.log('\n2. 检查邮件发送逻辑:');
console.log('- 邮件服务检查: this.resend 存在');
console.log('- 环境变量检查: RESEND_API_KEY 存在');
console.log('- 发件人邮箱检查: fromEmail 存在');

console.log('\n3. 可能的问题:');
console.log('❌ 问题1: Vercel环境变量未正确设置');
console.log('❌ 问题2: Resend API密钥无效或过期');
console.log('❌ 问题3: 发件人邮箱未在Resend中验证');
console.log('❌ 问题4: 邮件发送被Resend限制');

console.log('\n4. 调试建议:');
console.log('🔧 在Vercel中检查以下环境变量:');
console.log('   - RESEND_API_KEY');
console.log('   - RESEND_FROM_EMAIL');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');

console.log('\n🔧 在Resend控制台中检查:');
console.log('   - API密钥是否有效');
console.log('   - 发件人邮箱是否已验证');
console.log('   - 发送记录和错误日志');

console.log('\n🔧 在Vercel函数日志中查找:');
console.log('   - "邮件服务未配置或初始化失败"');
console.log('   - "RESEND_API_KEY 未配置"');
console.log('   - "Resend 邮件发送失败"');

console.log('\n5. 临时解决方案:');
console.log('💡 如果邮件服务完全不可用，可以考虑:');
console.log('   - 暂时跳过邮件确认，直接激活账户');
console.log('   - 使用其他邮件服务（如SendGrid）');
console.log('   - 实现短信验证作为备选方案');
