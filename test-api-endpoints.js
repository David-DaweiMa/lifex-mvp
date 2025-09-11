// 测试API端点 - 验证迁移后的功能
// 在浏览器控制台中运行此脚本

const API_BASE_URL = 'http://localhost:3000/api';

// 测试函数
async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint}:`, {
      status: response.status,
      success: response.ok,
      data: data
    });
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始测试API端点...\n');
  
  // 1. 测试商家API
  console.log('📋 测试商家相关API:');
  await testAPIEndpoint('/businesses');
  await testAPIEndpoint('/businesses/test');
  
  // 2. 测试AI API
  console.log('\n🤖 测试AI相关API:');
  await testAPIEndpoint('/ai', 'POST', {
    message: '推荐一些好的咖啡店',
    sessionId: 'test-session-123'
  });
  
  // 3. 测试认证API
  console.log('\n🔐 测试认证相关API:');
  await testAPIEndpoint('/auth/me');
  
  // 4. 测试Trending API
  console.log('\n📈 测试Trending相关API:');
  await testAPIEndpoint('/trending/posts');
  
  // 5. 测试商业设置API
  console.log('\n🏢 测试商业相关API:');
  await testAPIEndpoint('/business/setup', 'POST', {
    userId: 'test-user-id',
    businessData: {
      name: '测试商家',
      description: '这是一个测试商家',
      category: 'food',
      address: '测试地址'
    }
  });
  
  console.log('\n✅ 所有API测试完成！');
}

// 测试数据库连接
async function testDatabaseConnection() {
  console.log('🔗 测试数据库连接...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/businesses/test`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 数据库连接正常:', data);
    } else {
      console.log('❌ 数据库连接失败:', data);
    }
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
  }
}

// 测试新功能
async function testNewFeatures() {
  console.log('🆕 测试新功能...');
  
  // 测试配额系统
  console.log('📊 测试配额系统:');
  await testAPIEndpoint('/business/quota', 'GET');
  
  // 测试AI助手使用跟踪
  console.log('🤖 测试AI助手使用跟踪:');
  await testAPIEndpoint('/ai/usage', 'GET');
  
  console.log('✅ 新功能测试完成！');
}

// 运行所有测试
async function runMigrationTests() {
  console.log('🧪 开始数据库迁移测试...\n');
  
  await testDatabaseConnection();
  console.log('\n');
  await testNewFeatures();
  console.log('\n');
  await runAllTests();
  
  console.log('\n🎉 所有迁移测试完成！');
}

// 导出测试函数
window.testMigration = {
  runAllTests,
  testDatabaseConnection,
  testNewFeatures,
  runMigrationTests,
  testAPIEndpoint
};

console.log('📝 测试脚本已加载！');
console.log('💡 使用方法:');
console.log('  - testMigration.runMigrationTests() - 运行所有测试');
console.log('  - testMigration.testDatabaseConnection() - 测试数据库连接');
console.log('  - testMigration.runAllTests() - 测试所有API端点');
