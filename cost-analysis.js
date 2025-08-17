// 基于OpenAI实际定价的成本分析
const analyzeCosts = () => {
  console.log('💰 基于OpenAI实际定价的成本分析');
  
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
  
  console.log('\n📊 单次对话成本分析:');
  console.log(`用户输入 (${TOKEN_USAGE.userInput} tokens): $${chatCost.inputCost.toFixed(8)}`);
  console.log(`系统提示 (${TOKEN_USAGE.systemPrompt} tokens): $${chatCost.inputCost.toFixed(8)}`);
  console.log(`AI回复 (${TOKEN_USAGE.aiOutput} tokens): $${chatCost.outputCost.toFixed(8)}`);
  console.log(`总成本: $${chatCost.totalCost.toFixed(8)} ≈ $${(chatCost.totalCost * 1000).toFixed(3)} per 1K chats`);

  // 配额配置
  const QUOTA_CONFIG = {
    anonymous: 5,
    guest: 5,
    customer: 20,
    premium: 50,
    free_business: 20,
    professional_business: 50,
    enterprise_business: 200
  };

  console.log('\n📈 各用户类型成本分析:');
  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 每日配额    │ 每日成本    │ 每月成本    │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(QUOTA_CONFIG).forEach(([userType, dailyQuota]) => {
    const dailyCost = dailyQuota * chatCost.totalCost;
    const monthlyCost = dailyCost * 30;
    
    console.log(`│ ${userType.padEnd(19)} │ ${dailyQuota.toString().padStart(11)} │ $${dailyCost.toFixed(6).padStart(11)} │ $${monthlyCost.toFixed(4).padStart(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┘');

  // 收益分析
  console.log('\n💵 收益分析 (假设定价策略):');
  
  const PRICING_STRATEGIES = {
    free: { name: '免费用户', price: 0, description: '吸引用户注册' },
    basic: { name: '基础套餐', price: 9.99, description: '个人用户' },
    premium: { name: '高级套餐', price: 29.99, description: '重度用户' },
    business: { name: '商家套餐', price: 99.99, description: '小规模商家' },
    professional: { name: '专业套餐', price: 199.99, description: '中等规模商家' },
    enterprise: { name: '企业套餐', price: 499.99, description: '大规模企业' }
  };

  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 套餐类型            │ 月费        │ 月成本      │ 月利润      │ 利润率      │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  // 套餐与配额映射
  const PACKAGE_QUOTA_MAP = {
    free: 'customer',
    basic: 'customer', 
    premium: 'premium',
    business: 'free_business',
    professional: 'professional_business',
    enterprise: 'enterprise_business'
  };

  Object.entries(PRICING_STRATEGIES).forEach(([key, strategy]) => {
    const quotaKey = PACKAGE_QUOTA_MAP[key];
    const monthlyCost = QUOTA_CONFIG[quotaKey] * chatCost.totalCost * 30;
    
    if (key === 'free') {
      console.log(`│ ${strategy.name.padEnd(19)} │ $${strategy.price.toFixed(2).padStart(11)} │ $${monthlyCost.toFixed(4).padStart(11)} │ -${monthlyCost.toFixed(4).padStart(10)} │ 亏损        │`);
    } else {
      const monthlyProfit = strategy.price - monthlyCost;
      const profitMargin = (monthlyProfit / strategy.price * 100);
      
      console.log(`│ ${strategy.name.padEnd(19)} │ $${strategy.price.toFixed(2).padStart(11)} │ $${monthlyCost.toFixed(4).padStart(11)} │ $${monthlyProfit.toFixed(4).padStart(11)} │ ${profitMargin.toFixed(1).padStart(9)}% │`);
    }
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  // 成本优化建议
  console.log('\n💡 成本优化建议:');
  console.log('1. 缓存系统提示词 (使用 cached input): 节省 90% 的系统提示成本');
  console.log('2. 优化AI回复长度: 减少输出tokens可显著降低成本');
  console.log('3. 实现智能缓存: 相似查询可复用之前的回复');
  console.log('4. 分级响应: 简单查询使用更便宜的模型');

  // 缓存优化效果
  const cachedSystemCost = TOKEN_USAGE.systemPrompt * PRICING.cached / 1000000;
  const originalSystemCost = TOKEN_USAGE.systemPrompt * PRICING.input / 1000000;
  const savings = originalSystemCost - cachedSystemCost;
  
  console.log(`\n🔄 缓存优化效果:`);
  console.log(`原始系统提示成本: $${originalSystemCost.toFixed(8)}`);
  console.log(`缓存后系统提示成本: $${cachedSystemCost.toFixed(8)}`);
  console.log(`每次对话节省: $${savings.toFixed(8)} (${(savings/originalSystemCost*100).toFixed(1)}%)`);

  // 规模化分析
  console.log('\n📊 规模化分析 (1000用户):');
  const userCount = 1000;
  const userDistribution = {
    anonymous: 0.4,    // 40% 匿名用户
    customer: 0.3,     // 30% 普通用户
    premium: 0.2,      // 20% 高级用户
    free_business: 0.1 // 10% 商家用户
  };

  let totalDailyCost = 0;
  let totalMonthlyRevenue = 0;

  Object.entries(userDistribution).forEach(([userType, percentage]) => {
    const users = Math.round(userCount * percentage);
    const dailyCost = users * QUOTA_CONFIG[userType] * chatCost.totalCost;
    totalDailyCost += dailyCost;
    
    if (userType !== 'anonymous') {
      // 根据用户类型确定对应的套餐价格
      let packagePrice = 0;
      if (userType === 'customer') packagePrice = PRICING_STRATEGIES.basic.price;
      else if (userType === 'premium') packagePrice = PRICING_STRATEGIES.premium.price;
      else if (userType === 'free_business') packagePrice = PRICING_STRATEGIES.business.price;
      
      const monthlyRevenue = users * packagePrice;
      totalMonthlyRevenue += monthlyRevenue;
    }
    
    console.log(`${userType}: ${users} 用户, 每日成本 $${dailyCost.toFixed(4)}`);
  });

  const totalMonthlyCost = totalDailyCost * 30;
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyCost;
  const overallProfitMargin = (totalMonthlyProfit / totalMonthlyRevenue * 100);

  console.log(`\n总计:`);
  console.log(`每日总成本: $${totalDailyCost.toFixed(4)}`);
  console.log(`每月总成本: $${totalMonthlyCost.toFixed(2)}`);
  console.log(`每月总收入: $${totalMonthlyRevenue.toFixed(2)}`);
  console.log(`每月净利润: $${totalMonthlyProfit.toFixed(2)}`);
  console.log(`整体利润率: ${overallProfitMargin.toFixed(1)}%`);
};

// 运行分析
analyzeCosts();
