// 测试配额配置
const testQuotaConfig = () => {
  console.log('🧪 测试配额配置系统...');
  
  // 模拟配额配置
  const QUOTA_CONFIG = {
    guest: { chat: { daily: 5 } },
    customer: { chat: { daily: 20 } },
    premium: { chat: { daily: 50 } },
    free_business: { chat: { daily: 20 } },
    professional_business: { chat: { daily: 50 } },
    enterprise_business: { chat: { daily: 200 } }
  };

  const ANONYMOUS_QUOTA = { chat: { daily: 5 } };

  console.log('\n📊 配额配置表:');
  console.log('┌─────────────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ Chat (每日) │ 比例        │');
  console.log('├─────────────────────┼─────────────┼─────────────┤');
  
  Object.entries(QUOTA_CONFIG).forEach(([userType, quota]) => {
    const ratio = (quota.chat.daily / 5).toFixed(1);
    console.log(`│ ${userType.padEnd(19)} │ ${quota.chat.daily.toString().padStart(11)} │ ${ratio.padStart(11)}x │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┘');

  // 测试配额计算
  console.log('\n🔢 配额计算验证:');
  const baseQuota = 5;
  const ratios = {
    guest: 1,
    customer: 4,
    premium: 10,
    free_business: 4,
    professional_business: 10,
    enterprise_business: 40
  };

  Object.entries(ratios).forEach(([userType, ratio]) => {
    const calculated = Math.round(baseQuota * ratio);
    const actual = QUOTA_CONFIG[userType].chat.daily;
    const match = calculated === actual ? '✅' : '❌';
    console.log(`${match} ${userType}: ${baseQuota} × ${ratio} = ${calculated} (实际: ${actual})`);
  });

  // 测试用户类型判断
  console.log('\n👥 用户类型判断测试:');
  const testUsers = [
    'anonymous',
    'demo-user',
    'admin',
    'customer-123',
    'premium-456'
  ];

  const isUnlimitedUser = (userId) => {
    return userId === 'demo-user' || userId === 'admin';
  };

  testUsers.forEach(userId => {
    const isUnlimited = isUnlimitedUser(userId);
    const quota = isUnlimited ? '无限制' : (userId === 'anonymous' ? '5次' : '按用户类型');
    console.log(`${isUnlimited ? '🔓' : '🔒'} ${userId}: ${quota}`);
  });

  // 配额使用场景测试
  console.log('\n📈 配额使用场景分析:');
  const scenarios = [
    { userType: 'guest', dailyUsage: 3, description: '轻度使用' },
    { userType: 'guest', dailyUsage: 5, description: '达到限制' },
    { userType: 'customer', dailyUsage: 15, description: '中度使用' },
    { userType: 'premium', dailyUsage: 30, description: '重度使用' },
    { userType: 'enterprise_business', dailyUsage: 150, description: '企业级使用' }
  ];

  scenarios.forEach(scenario => {
    const maxQuota = QUOTA_CONFIG[scenario.userType]?.chat.daily || ANONYMOUS_QUOTA.chat.daily;
    const remaining = Math.max(0, maxQuota - scenario.dailyUsage);
    const usagePercent = ((scenario.dailyUsage / maxQuota) * 100).toFixed(1);
    const status = scenario.dailyUsage >= maxQuota ? '🔴 已达上限' : 
                   scenario.dailyUsage >= maxQuota * 0.8 ? '🟡 接近上限' : '🟢 正常使用';
    
    console.log(`${status} ${scenario.userType} (${scenario.description}): ${scenario.dailyUsage}/${maxQuota} (${usagePercent}%) - 剩余: ${remaining}`);
  });

  // 成本分析
  console.log('\n💰 成本分析 (假设每次AI调用成本为$0.01):');
  const costPerCall = 0.01;
  
  Object.entries(QUOTA_CONFIG).forEach(([userType, quota]) => {
    const dailyCost = quota.chat.daily * costPerCall;
    const monthlyCost = dailyCost * 30;
    console.log(`💵 ${userType}: 每日$${dailyCost.toFixed(2)} | 每月$${monthlyCost.toFixed(2)}`);
  });

  console.log('\n📋 配额配置总结:');
  console.log('✅ 匿名用户: 5次/天 (基础体验)');
  console.log('✅ 普通用户: 20次/天 (个人使用)');
  console.log('✅ 高级用户: 50次/天 (重度使用)');
  console.log('✅ 免费商家: 20次/天 (小规模经营)');
  console.log('✅ 专业商家: 50次/天 (中等规模)');
  console.log('✅ 企业商家: 200次/天 (大规模经营)');
  console.log('✅ Demo/Admin: 无限制 (测试/管理)');
};

// 运行测试
testQuotaConfig();
