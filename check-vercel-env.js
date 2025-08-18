const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

console.log('🔍 检查Vercel环境变量配置...\n');

// 检查环境变量（这些应该来自Vercel环境）
console.log('1️⃣ 检查环境变量...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '✅ 已设置' : '❌ 未设置');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ 已设置' : '❌ 未设置');

// 检查环境变量值的前几个字符（用于验证但不暴露完整值）
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('   Supabase URL 前缀:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...');
}
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('   Service Role Key 前缀:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...');
}
if (process.env.RESEND_API_KEY) {
  console.log('   Resend API Key 前缀:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
}

// 2. 测试Supabase连接
console.log('\n2️⃣ 测试Supabase连接...');
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 测试连接
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase连接失败:', error.message);
    } else {
      console.log('✅ Supabase连接正常');
    }
  } catch (error) {
    console.error('❌ Supabase连接异常:', error.message);
  }
} else {
  console.log('⚠️ 缺少Supabase环境变量，跳过连接测试');
}

// 3. 测试Resend连接
console.log('\n3️⃣ 测试Resend连接...');
if (process.env.RESEND_API_KEY) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // 测试连接（不实际发送邮件）
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz',
      to: ['test@example.com'],
      subject: 'Connection Test',
      html: '<p>Test</p>'
    });

    if (error) {
      console.error('❌ Resend连接失败:', error.message);
    } else {
      console.log('✅ Resend连接正常');
    }
  } catch (error) {
    console.error('❌ Resend连接异常:', error.message);
  }
} else {
  console.log('⚠️ 缺少Resend环境变量，跳过连接测试');
}

// 4. 检查应用URL配置
console.log('\n4️⃣ 检查应用URL配置...');
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
console.log('应用URL:', appUrl);

if (appUrl.includes('localhost')) {
  console.log('⚠️ 使用本地开发URL，生产环境应该使用实际域名');
} else {
  console.log('✅ 使用生产环境URL');
}

// 5. 环境检测
console.log('\n5️⃣ 环境检测...');
console.log('NODE_ENV:', process.env.NODE_ENV || '未设置');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || '未设置');
console.log('VERCEL_URL:', process.env.VERCEL_URL || '未设置');

// 6. 建议
console.log('\n6️⃣ 建议...');
console.log('如果这是Vercel环境，请确保以下环境变量已正确配置：');
console.log('1. NEXT_PUBLIC_SUPABASE_URL');
console.log('2. SUPABASE_SERVICE_ROLE_KEY');
console.log('3. RESEND_API_KEY');
console.log('4. RESEND_FROM_EMAIL');
console.log('5. NEXT_PUBLIC_APP_URL (生产环境域名)');

console.log('\n如果环境变量配置正确但仍有问题，请检查：');
console.log('1. Vercel函数日志');
console.log('2. Supabase Dashboard中的API使用情况');
console.log('3. Resend Dashboard中的邮件发送记录');

console.log('\n🏁 环境检查完成');
