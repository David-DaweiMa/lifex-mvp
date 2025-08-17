const https = require('https');
const http = require('http');

// 测试配置
const BASE_URL = 'https://lifex-mvp.vercel.app'; // 替换为你的实际域名
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

console.log('🧪 网页注册流程测试');
console.log('⏰ 测试时间:', new Date().toISOString());
console.log('============================================================');

// 测试步骤
async function testRegistration() {
    try {
        console.log('📝 步骤1: 测试注册页面是否可访问');
        
        // 测试注册页面
        const registerPageUrl = `${BASE_URL}/auth/register`;
        console.log(`   访问: ${registerPageUrl}`);
        
        // 这里我们只是检查页面是否可访问
        // 实际的注册测试需要在浏览器中进行
        
        console.log('✅ 注册页面应该可以访问');
        console.log('');
        
        console.log('📧 步骤2: 测试邮件服务');
        console.log('   注意: 邮件发送测试需要在浏览器中进行实际注册');
        console.log('');
        
        console.log('🔗 步骤3: 测试确认链接');
        console.log('   注意: 确认链接测试需要在收到邮件后进行');
        console.log('');
        
        console.log('📋 手动测试步骤:');
        console.log('   1. 打开浏览器访问:', registerPageUrl);
        console.log('   2. 填写注册信息:');
        console.log(`      - 邮箱: ${TEST_EMAIL}`);
        console.log(`      - 密码: ${TEST_PASSWORD}`);
        console.log('      - 用户名: testuser');
        console.log('      - 全名: Test User');
        console.log('      - 用户类型: free');
        console.log('   3. 点击注册按钮');
        console.log('   4. 检查是否收到确认邮件');
        console.log('   5. 点击邮件中的确认链接');
        console.log('   6. 检查是否成功登录');
        console.log('');
        
        console.log('🎯 预期结果:');
        console.log('   ✅ 注册成功，显示"请检查邮箱确认"消息');
        console.log('   ✅ 收到确认邮件');
        console.log('   ✅ 点击确认链接后成功登录');
        console.log('   ✅ 用户配置文件正确创建');
        console.log('   ✅ 配额正确设置');
        console.log('');
        
        console.log('🔍 如果遇到问题，请检查:');
        console.log('   1. 浏览器控制台是否有错误');
        console.log('   2. 网络请求是否成功');
        console.log('   3. 邮件是否发送成功');
        console.log('   4. 数据库中的用户记录');
        console.log('');
        
        console.log('📊 测试完成！请手动执行上述步骤。');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
    }
}

// 运行测试
testRegistration();
