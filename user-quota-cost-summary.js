// 用户分类、配额和成本完整整理
const analyzeUserQuotaCost = () => {
  console.log('📊 用户分类、配额和成本完整整理');
  
  // OpenAI GPT-5 Nano 定价 (每100万tokens)
  const PRICING = {
    input: 0.05,      // $0.05 per 1M tokens
    output: 0.40,     // $0.40 per 1M tokens
    cached: 0.005     // $0.005 per 1M tokens
  };

  // 典型对话Token使用量
  const TOKEN_USAGE = {
    userInput: 50,    // 用户输入平均50 tokens
    aiOutput: 200,    // AI回复平均200 tokens
    systemPrompt: 100 // 系统提示100 tokens
  };

  // 计算单次对话成本
  const calculateChatCost = () => {
    const inputCost = (TOKEN_USAGE.userInput + TOKEN_USAGE.systemPrompt) * PRICING.input / 1000000;
    const outputCost = TOKEN_USAGE.aiOutput * PRICING.output / 1000000;
    const totalCost = inputCost + outputCost;
    
    return {
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: totalCost
    };
  };

  const chatCost = calculateChatCost();

  // 用户分类和配额配置
  const USER_CATEGORIES = {
    // 匿名用户 - 未注册访客
    anonymous: {
      name: '匿名用户',
      description: '未注册的访客用户',
      quota: {
        chat: { daily: 5 },
        trending: { monthly: 0 },
        ads: { monthly: 0 },
        products: { total: 0 },
        stores: { total: 0 }
      },
      features: ['AI聊天'],
      pricing: 0,
      conversionTarget: '注册用户'
    },
    
    // 免费用户 - 注册但未订阅
    free: {
      name: '免费用户',
      description: '注册但未订阅用户',
      quota: {
        chat: { daily: 20 },
        trending: { monthly: 10 },
        ads: { monthly: 2 },
        products: { total: 0 },
        stores: { total: 0 }
      },
      features: ['AI聊天', '趋势分析', '广告投放'],
      pricing: 0,
      conversionTarget: '付费用户'
    },
    
    // 普通付费用户 - 基础订阅
    customer: {
      name: '普通用户',
      description: '基础付费订阅用户',
      quota: {
        chat: { daily: 100 },
        trending: { monthly: 50 },
        ads: { monthly: 10 },
        products: { total: 0 },
        stores: { total: 0 }
      },
      features: ['AI聊天', '趋势分析', '广告投放'],
      pricing: 9.99,
      conversionTarget: '高级用户'
    },
    
    // 高级用户 - 高级订阅
    premium: {
      name: '高级用户',
      description: '高级付费订阅用户',
      quota: {
        chat: { daily: 500 },
        trending: { monthly: 200 },
        ads: { monthly: 50 },
        products: { total: 0 },
        stores: { total: 0 }
      },
      features: ['AI聊天', '趋势分析', '广告投放', '优先支持'],
      pricing: 29.99,
      conversionTarget: '商家用户'
    },

    // 免费商家 - 小规模商家
    free_business: {
      name: '免费商家',
      description: '小规模商家用户',
      quota: {
        chat: { daily: 20 },
        trending: { monthly: 10 },
        ads: { monthly: 2 },
        products: { total: 20 },
        stores: { total: 2 }
      },
      features: ['AI聊天', '趋势分析', '广告投放', '产品管理', '店铺管理'],
      pricing: 0,
      conversionTarget: '专业商家'
    },
    
    // 专业商家 - 中等规模商家
    professional_business: {
      name: '专业商家',
      description: '中等规模商家用户',
      quota: {
        chat: { daily: 100 },
        trending: { monthly: 50 },
        ads: { monthly: 10 },
        products: { total: 50 },
        stores: { total: 3 }
      },
      features: ['AI聊天', '趋势分析', '广告投放', '产品管理', '店铺管理', '数据分析'],
      pricing: 99.99,
      conversionTarget: '企业商家'
    },
    
    // 企业商家 - 大规模企业
    enterprise_business: {
      name: '企业商家',
      description: '大规模企业用户',
      quota: {
        chat: { daily: 500 },
        trending: { monthly: 200 },
        ads: { monthly: 50 },
        products: { total: 200 },
        stores: { total: 10 }
      },
      features: ['AI聊天', '趋势分析', '广告投放', '产品管理', '店铺管理', '数据分析', 'API访问', '专属支持'],
      pricing: 499.99,
      conversionTarget: '定制方案'
    }
  };

  console.log('\n📋 用户分类概览:');
  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 描述        │ 月费        │ 主要功能    │ 转化目标    │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(USER_CATEGORIES).forEach(([key, user]) => {
    const price = user.pricing === 0 ? '免费' : `$${user.pricing}`;
    const mainFeatures = user.features.slice(0, 2).join(', ');
    
    console.log(`│ ${user.name.padEnd(19)} │ ${user.description.padEnd(11)} │ ${price.padStart(11)} │ ${mainFeatures.padEnd(11)} │ ${user.conversionTarget.padEnd(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  console.log('\n📊 详细配额配置:');
  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ Chat/日     │ Trending/月 │ Ads/月      │ Products    │ Stores      │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(USER_CATEGORIES).forEach(([key, user]) => {
    const chat = user.quota.chat.daily;
    const trending = user.quota.trending.monthly;
    const ads = user.quota.ads.monthly;
    const products = user.quota.products.total;
    const stores = user.quota.stores.total;
    
    console.log(`│ ${user.name.padEnd(19)} │ ${chat.toString().padStart(11)} │ ${trending.toString().padStart(11)} │ ${ads.toString().padStart(11)} │ ${products.toString().padStart(11)} │ ${stores.toString().padStart(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  console.log('\n💰 成本分析:');
  console.log(`单次AI对话成本: $${chatCost.totalCost.toFixed(8)}`);
  console.log(`每1000次对话成本: $${(chatCost.totalCost * 1000).toFixed(3)}`);
  
  console.log('\n┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 每日成本    │ 每月成本    │ 月收入      │ 月利润      │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(USER_CATEGORIES).forEach(([key, user]) => {
    const dailyCost = user.quota.chat.daily * chatCost.totalCost;
    const monthlyCost = dailyCost * 30;
    const monthlyRevenue = user.pricing;
    const monthlyProfit = monthlyRevenue - monthlyCost;
    
    console.log(`│ ${user.name.padEnd(19)} │ $${dailyCost.toFixed(6).padStart(11)} │ $${monthlyCost.toFixed(4).padStart(11)} │ $${monthlyRevenue.toFixed(2).padStart(11)} │ $${monthlyProfit.toFixed(2).padStart(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  // 用户转化路径
  console.log('\n🔄 用户转化路径:');
  console.log('匿名用户 → 免费用户 → 普通用户 → 高级用户 → 免费商家 → 专业商家 → 企业商家');
  
  // 转化策略
  console.log('\n🎯 转化策略:');
  Object.entries(USER_CATEGORIES).forEach(([key, user]) => {
    if (user.conversionTarget !== '定制方案') {
      console.log(`• ${user.name}: ${user.conversionTarget} (通过${user.features.join(', ')})`);
    }
  });

  // 功能对比
  console.log('\n⚡ 功能对比:');
  const allFeatures = [...new Set(Object.values(USER_CATEGORIES).flatMap(u => u.features))];
  
  console.log('┌─────────────────────┬' + '─'.repeat(allFeatures.length * 12) + '┐');
  console.log('│ 用户类型            │' + allFeatures.map(f => f.padStart(11)).join('│') + '│');
  console.log('├─────────────────────┼' + '─'.repeat(allFeatures.length * 12) + '┤');

  Object.entries(USER_CATEGORIES).forEach(([key, user]) => {
    const featureRow = allFeatures.map(feature => 
      user.features.includes(feature) ? '✅'.padStart(11) : '❌'.padStart(11)
    ).join('│');
    
    console.log(`│ ${user.name.padEnd(19)} │${featureRow}│`);
  });
  
  console.log('└─────────────────────┴' + '─'.repeat(allFeatures.length * 12) + '┘');

  // 规模化分析
  console.log('\n📈 规模化分析 (1000用户):');
  const userDistribution = {
    anonymous: 0.3,           // 30% 匿名用户
    free: 0.25,              // 25% 免费用户
    customer: 0.2,           // 20% 普通用户
    premium: 0.15,           // 15% 高级用户
    free_business: 0.05,     // 5% 免费商家
    professional_business: 0.03, // 3% 专业商家
    enterprise_business: 0.02 // 2% 企业商家
  };

  let totalDailyCost = 0;
  let totalMonthlyRevenue = 0;
  let totalUsers = 0;

  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 用户数量    │ 每日成本    │ 月收入      │ 月利润      │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(userDistribution).forEach(([userType, percentage]) => {
    const users = Math.round(1000 * percentage);
    const user = USER_CATEGORIES[userType];
    const dailyCost = users * user.quota.chat.daily * chatCost.totalCost;
    const monthlyRevenue = users * user.pricing;
    const monthlyCost = dailyCost * 30;
    const monthlyProfit = monthlyRevenue - monthlyCost;
    
    totalDailyCost += dailyCost;
    totalMonthlyRevenue += monthlyRevenue;
    totalUsers += users;
    
    console.log(`│ ${user.name.padEnd(19)} │ ${users.toString().padStart(11)} │ $${dailyCost.toFixed(4).padStart(11)} │ $${monthlyRevenue.toFixed(2).padStart(11)} │ $${monthlyProfit.toFixed(2).padStart(11)} │`);
  });
  
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
  const totalMonthlyCost = totalDailyCost * 30;
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyCost;
  const overallProfitMargin = (totalMonthlyProfit / totalMonthlyRevenue * 100);
  
  console.log(`│ 总计                │ ${totalUsers.toString().padStart(11)} │ $${totalDailyCost.toFixed(4).padStart(11)} │ $${totalMonthlyRevenue.toFixed(2).padStart(11)} │ $${totalMonthlyProfit.toFixed(2).padStart(11)} │`);
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
  
  console.log(`整体利润率: ${overallProfitMargin.toFixed(1)}%`);

  // 配额比例关系
  console.log('\n📊 配额比例关系:');
  console.log('• 匿名:免费 = 1:4 (5:20)');
  console.log('• 免费:普通 = 1:5 (20:100)');
  console.log('• 普通:高级 = 1:5 (100:500)');
  console.log('• 免费商家:专业商家 = 1:5 (20:100)');
  console.log('• 专业商家:企业商家 = 1:5 (100:500)');

  // 优化建议
  console.log('\n💡 优化建议:');
  console.log('1. 匿名用户: 提供5次免费体验，引导注册');
  console.log('2. 免费用户: 提供20次基础功能，引导付费');
  console.log('3. 普通用户: 100次AI对话满足日常需求');
  console.log('4. 高级用户: 500次AI对话支持重度使用');
  console.log('5. 商家用户: 提供完整的商业解决方案');
  console.log('6. 企业用户: 定制化服务和专属支持');

  // 总结
  console.log('\n📋 总结:');
  console.log('✅ 7个用户类型，覆盖从访客到企业的完整用户群体');
  console.log('✅ 清晰的转化路径，引导用户逐步升级');
  console.log('✅ 合理的配额配置，平衡成本和收益');
  console.log('✅ 功能差异化，满足不同用户需求');
  console.log('✅ 可持续的商业模式，支持规模化发展');
};

// 运行分析
analyzeUserQuotaCost();
