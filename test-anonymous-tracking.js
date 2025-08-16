// 测试匿名用户识别机制
const testAnonymousTracking = async () => {
  console.log('🧪 测试匿名用户识别机制...');
  
  try {
    // 模拟同一个匿名用户的多次请求
    const sessionId = `test_anon_${Date.now()}`;
    
    console.log('\n📝 测试同一个匿名用户的多次请求...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- 第 ${i} 次请求 ---`);
      
      const response = await fetch('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `测试消息 ${i}`,
          userId: 'anonymous',
          sessionId: sessionId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 请求 ${i} 成功`);
        console.log(`配额信息:`, result.data.quota);
        console.log(`剩余次数: ${result.data.quota.remaining}`);
      } else {
        console.log(`❌ 请求 ${i} 失败:`, response.status);
        const error = await response.text();
        console.log('错误信息:', error);
      }
    }

    // 测试不同匿名用户
    console.log('\n👥 测试不同匿名用户...');
    
    const sessionId2 = `test_anon_2_${Date.now()}`;
    
    const response2 = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '来自另一个匿名用户的消息',
        userId: 'anonymous',
        sessionId: sessionId2
      })
    });

    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ 不同匿名用户请求成功');
      console.log(`配额信息:`, result2.data.quota);
      console.log(`剩余次数: ${result2.data.quota.remaining}`);
    } else {
      console.log('❌ 不同匿名用户请求失败:', response2.status);
      const error = await response2.text();
      console.log('错误信息:', error);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
};

// 运行测试
testAnonymousTracking();
