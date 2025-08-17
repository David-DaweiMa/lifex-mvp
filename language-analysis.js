// 中英文用户语言使用分析
const analyzeLanguageUsage = () => {
  console.log('🌍 中英文用户语言使用分析');
  
  // 用户语言分布假设
  const LANGUAGE_DISTRIBUTION = {
    chinese: 0.7,    // 70% 中文用户
    english: 0.3     // 30% 英文用户
  };

  // 不同语言的Token使用量差异
  const TOKEN_USAGE_BY_LANGUAGE = {
    chinese: {
      userInput: 30,     // 中文输入平均30 tokens (更简洁)
      aiOutput: 150,     // 中文回复平均150 tokens
      systemPrompt: 100  // 系统提示相同
    },
    english: {
      userInput: 50,     // 英文输入平均50 tokens
      aiOutput: 200,     // 英文回复平均200 tokens
      systemPrompt: 100  // 系统提示相同
    }
  };

  // OpenAI定价
  const PRICING = {
    input: 0.05,      // $0.05 per 1M tokens
    output: 0.40,     // $0.40 per 1M tokens
    cached: 0.005     // $0.005 per 1M tokens
  };

  // 计算不同语言的成本
  const calculateLanguageCost = (language) => {
    const usage = TOKEN_USAGE_BY_LANGUAGE[language];
    const inputCost = (usage.userInput + usage.systemPrompt) * PRICING.input / 1000000;
    const outputCost = usage.aiOutput * PRICING.output / 1000000;
    const totalCost = inputCost + outputCost;
    
    return {
      inputCost,
      outputCost,
      totalCost,
      usage
    };
  };

  const chineseCost = calculateLanguageCost('chinese');
  const englishCost = calculateLanguageCost('english');

  console.log('\n📊 语言成本对比:');
  console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 语言        │ 输入Tokens  │ 输出Tokens  │ 单次成本    │ 成本比例    │');
  console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
  console.log(`│ 中文        │ ${chineseCost.usage.userInput.toString().padStart(11)} │ ${chineseCost.usage.aiOutput.toString().padStart(11)} │ $${chineseCost.totalCost.toFixed(8).padStart(11)} │ ${(chineseCost.totalCost/englishCost.totalCost*100).toFixed(1).padStart(9)}% │`);
  console.log(`│ 英文        │ ${englishCost.usage.userInput.toString().padStart(11)} │ ${englishCost.usage.aiOutput.toString().padStart(11)} │ $${englishCost.totalCost.toFixed(8).padStart(11)} │ ${(englishCost.totalCost/englishCost.totalCost*100).toFixed(1).padStart(9)}% │`);
  console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  // 配额配置
  const QUOTA_CONFIG = {
    anonymous: 5,
    customer: 20,
    premium: 50,
    free_business: 20,
    professional_business: 50,
    enterprise_business: 200
  };

  console.log('\n💰 各用户类型语言成本分析:');
  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 中文月成本  │ 英文月成本  │ 混合月成本  │ 成本差异    │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(QUOTA_CONFIG).forEach(([userType, dailyQuota]) => {
    const chineseMonthlyCost = dailyQuota * chineseCost.totalCost * 30;
    const englishMonthlyCost = dailyQuota * englishCost.totalCost * 30;
    const mixedMonthlyCost = dailyQuota * (chineseCost.totalCost * 0.7 + englishCost.totalCost * 0.3) * 30;
    const costDifference = englishMonthlyCost - chineseMonthlyCost;
    
    console.log(`│ ${userType.padEnd(19)} │ $${chineseMonthlyCost.toFixed(4).padStart(11)} │ $${englishMonthlyCost.toFixed(4).padStart(11)} │ $${mixedMonthlyCost.toFixed(4).padStart(11)} │ $${costDifference.toFixed(4).padStart(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  // 用户行为差异
  console.log('\n📈 中英文用户行为差异:');
  
  const USER_BEHAVIOR = {
    chinese: {
      avgSessionLength: 3,      // 平均每次会话3轮对话
      dailyActiveRate: 0.8,     // 80% 日活跃率
      conversionRate: 0.15,     // 15% 转化率 (匿名→注册)
      preferredFeatures: ['推荐', '搜索', '聊天']
    },
    english: {
      avgSessionLength: 5,      // 平均每次会话5轮对话
      dailyActiveRate: 0.6,     // 60% 日活跃率
      conversionRate: 0.25,     // 25% 转化率 (匿名→注册)
      preferredFeatures: ['recommendations', 'search', 'chat']
    }
  };

  console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户群体    │ 会话长度    │ 日活跃率    │ 转化率      │ 偏好功能    │');
  console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
  console.log(`│ 中文用户    │ ${USER_BEHAVIOR.chinese.avgSessionLength} 轮对话    │ ${(USER_BEHAVIOR.chinese.dailyActiveRate*100).toFixed(0)}%        │ ${(USER_BEHAVIOR.chinese.conversionRate*100).toFixed(0)}%        │ 推荐/搜索    │`);
  console.log(`│ 英文用户    │ ${USER_BEHAVIOR.english.avgSessionLength} 轮对话    │ ${(USER_BEHAVIOR.english.dailyActiveRate*100).toFixed(0)}%        │ ${(USER_BEHAVIOR.english.conversionRate*100).toFixed(0)}%        │ 推荐/搜索    │`);
  console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

  // 实际使用量预测
  console.log('\n🎯 实际使用量预测 (考虑用户行为):');
  
  const predictActualUsage = (userType, language) => {
    const baseQuota = QUOTA_CONFIG[userType];
    const behavior = USER_BEHAVIOR[language];
    const actualUsage = baseQuota * behavior.dailyActiveRate * behavior.avgSessionLength / 3; // 假设3轮对话用1次配额
    return Math.min(actualUsage, baseQuota); // 不超过配额
  };

  console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 用户类型            │ 中文实际    │ 英文实际    │ 混合实际    │');
  console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┤');

  Object.entries(QUOTA_CONFIG).forEach(([userType, dailyQuota]) => {
    const chineseActual = predictActualUsage(userType, 'chinese');
    const englishActual = predictActualUsage(userType, 'english');
    const mixedActual = chineseActual * 0.7 + englishActual * 0.3;
    
    console.log(`│ ${userType.padEnd(19)} │ ${chineseActual.toFixed(1).padStart(11)} │ ${englishActual.toFixed(1).padStart(11)} │ ${mixedActual.toFixed(1).padStart(11)} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┘');

  // 优化建议
  console.log('\n💡 中英文用户优化建议:');
  console.log('1. 中文用户: 成本较低，可适当增加配额或降低价格');
  console.log('2. 英文用户: 成本较高，但转化率更好，可提供更多高级功能');
  console.log('3. 混合策略: 根据用户语言自动调整配额和功能');
  console.log('4. 本地化: 为不同语言用户提供定制化的AI回复风格');

  // 定价策略建议
  console.log('\n💰 差异化定价策略:');
  console.log('┌─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│ 套餐类型    │ 中文价格    │ 英文价格    │ 说明        │');
  console.log('├─────────────┼─────────────┼─────────────┼─────────────┤');
  console.log('│ 基础套餐    │ $8.99       │ $9.99       │ 英文用户成本高 │');
  console.log('│ 高级套餐    │ $24.99      │ $29.99      │ 英文用户功能多 │');
  console.log('│ 商家套餐    │ $89.99      │ $99.99      │ 英文用户服务好 │');
  console.log('└─────────────┴─────────────┴─────────────┴─────────────┘');

  // 总结
  console.log('\n📋 总结:');
  console.log('✅ 中文用户: 成本低 20%，使用频率高，适合基础功能');
  console.log('✅ 英文用户: 成本高 25%，转化率高，适合高级功能');
  console.log('✅ 混合策略: 根据语言自动调整，最大化用户体验');
  console.log('✅ 统一配额: 当前配额配置适合两种语言用户');
};

// 运行分析
analyzeLanguageUsage();
