// 网页端注册测试脚本
// 模拟完整的用户注册流程，包括前端界面和后端API

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 测试结果记录
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

// 记录测试结果
const recordTest = (name, status, details = null, error = null) => {
  const test = {
    name,
    status,
    timestamp: new Date().toISOString(),
    details,
    error: error ? error.message : null
  };
  
  testResults.tests.push(test);
  testResults.summary.total++;
  
  if (status === 'passed') {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
    if (error) {
      testResults.summary.errors.push(`${name}: ${error.message}`);
    }
  }
  
  console.log(`${status === 'passed' ? '✅' : '❌'} ${name}: ${status}`);
  if (details) {
    console.log(`   📝 ${details}`);
  }
  if (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
};

// 保存测试结果
const saveTestResults = () => {
  const resultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const filename = `web-registration-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 测试结果已保存到: ${filepath}`);
  
  return filepath;
};

// 生成测试报告
const generateTestReport = (results) => {
  const report = `# 网页端注册测试报告

## 测试概览
- **测试时间**: ${results.timestamp}
- **总测试数**: ${results.summary.total}
- **通过**: ${results.summary.passed}
- **失败**: ${results.summary.failed}
- **成功率**: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%

## 详细结果

${results.tests.map(test => `
### ${test.name}
- **状态**: ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}
- **时间**: ${test.timestamp}
- **详情**: ${test.details || '无'}
${test.error ? `- **错误**: ${test.error}` : ''}
`).join('')}

## 错误汇总
${results.summary.errors.length > 0 ? 
  results.summary.errors.map(error => `- ${error}`).join('\n') : 
  '无错误'
}

## 结论
${results.summary.failed === 0 ? 
  '🎉 所有测试通过！网页端注册功能工作正常。' : 
  '⚠️ 部分测试失败，需要进一步检查和修复。'
}
`;

  return report;
};

// 主测试函数
const runWebRegistrationTests = async () => {
  console.log('🧪 网页端注册完整测试开始');
  console.log(`⏰ 测试时间: ${testResults.timestamp}`);
  console.log('=' .repeat(60));
  
  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    recordTest('环境变量检查', 'failed', null, new Error('缺少必要的环境变量'));
    console.log('\n❌ 无法继续测试，请设置以下环境变量:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    saveTestResults();
    return;
  }
  
  recordTest('环境变量检查', 'passed', '所有必要的环境变量已配置');
  
  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 测试1: 检查注册页面可访问性
    console.log('\n📋 测试1: 检查注册页面可访问性');
    
    // 模拟检查注册页面是否存在
    const registerPagePath = path.join(__dirname, 'src/app/auth/register/page.tsx');
    if (fs.existsSync(registerPagePath)) {
      recordTest('注册页面检查', 'passed', '注册页面文件存在');
    } else {
      recordTest('注册页面检查', 'failed', null, new Error('注册页面文件不存在'));
    }
    
    // 测试2: 检查注册API端点
    console.log('\n📋 测试2: 检查注册API端点');
    
    const registerApiPath = path.join(__dirname, 'src/app/api/auth/register/route.ts');
    if (fs.existsSync(registerApiPath)) {
      recordTest('注册API检查', 'passed', '注册API端点存在');
    } else {
      recordTest('注册API检查', 'failed', null, new Error('注册API端点不存在'));
    }
    
    // 测试3: 检查数据库连接
    console.log('\n📋 测试3: 检查数据库连接');
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      recordTest('数据库连接', 'failed', null, connectionError);
      throw connectionError;
    }
    
    recordTest('数据库连接', 'passed', '成功连接到Supabase数据库');
    
    // 测试4: 检查表结构
    console.log('\n📋 测试4: 检查表结构');
    
    const requiredTables = ['user_profiles', 'user_quotas', 'trigger_logs'];
    for (const tableName of requiredTables) {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (tableError) {
        recordTest(`表结构检查 - ${tableName}`, 'failed', null, tableError);
      } else {
        recordTest(`表结构检查 - ${tableName}`, 'passed', '表存在且可访问');
      }
    }
    
    // 测试5: 模拟前端注册表单数据
    console.log('\n📋 测试5: 模拟前端注册表单数据');
    
    const testUsers = [
      {
        email: `test-customer-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        username: 'testcustomer',
        fullName: 'Test Customer User',
        userType: 'customer'
      },
      {
        email: `test-free-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        username: 'testfree',
        fullName: 'Test Free User',
        userType: 'free'
      },
      {
        email: `test-premium-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        username: 'testpremium',
        fullName: 'Test Premium User',
        userType: 'premium'
      }
    ];
    
    recordTest('注册表单数据准备', 'passed', `准备了 ${testUsers.length} 个测试用户数据`);
    
    // 测试6: 模拟注册API调用
    console.log('\n📋 测试6: 模拟注册API调用');
    
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n🔄 测试用户 ${i + 1}: ${user.userType}`);
      
      // 模拟前端发送注册请求
      const registrationData = {
        email: user.email,
        password: user.password,
        username: user.username,
        fullName: user.fullName,
        userType: user.userType
      };
      
      console.log(`📧 邮箱: ${user.email}`);
      console.log(`👤 用户类型: ${user.userType}`);
      
      // 使用Supabase Admin API创建用户（模拟注册API）
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          username: user.username,
          full_name: user.fullName,
          user_type: user.userType
        },
        email_confirm: true
      });
      
      if (authError) {
        recordTest(`用户注册 - ${user.userType}`, 'failed', null, authError);
        continue;
      }
      
      recordTest(`用户注册 - ${user.userType}`, 'passed', `用户ID: ${authUser.user.id}`);
      
      // 等待触发器执行
      console.log('⏳ 等待触发器执行...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 测试7: 验证用户配置文件创建
      console.log('\n📋 测试7: 验证用户配置文件创建');
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
      
      if (profileError) {
        recordTest(`配置文件创建 - ${user.userType}`, 'failed', null, profileError);
      } else {
        recordTest(`配置文件创建 - ${user.userType}`, 'passed', `用户类型: ${profile.user_type}, 邮箱: ${profile.email}`);
      }
      
      // 测试8: 验证用户配额设置
      console.log('\n📋 测试8: 验证用户配额设置');
      
      const { data: userQuotas, error: quotaError } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', authUser.user.id);
      
      if (quotaError) {
        recordTest(`配额设置 - ${user.userType}`, 'failed', null, quotaError);
      } else if (userQuotas.length === 0) {
        recordTest(`配额设置 - ${user.userType}`, 'failed', null, new Error('用户配额未设置'));
      } else {
        const quotaDetails = userQuotas.map(q => `${q.quota_type}: ${q.current_usage}/${q.max_limit}`).join(', ');
        recordTest(`配额设置 - ${user.userType}`, 'passed', `配额数量: ${userQuotas.length}, 详情: ${quotaDetails}`);
      }
      
      // 测试9: 检查触发器执行日志
      console.log('\n📋 测试9: 检查触发器执行日志');
      
      const { data: triggerLogs, error: logError } = await supabase
        .from('trigger_logs')
        .select('*')
        .eq('user_id', authUser.user.id)
        .order('execution_time', { ascending: false });
      
      if (logError) {
        recordTest(`触发器日志 - ${user.userType}`, 'failed', null, logError);
      } else if (triggerLogs.length === 0) {
        recordTest(`触发器日志 - ${user.userType}`, 'failed', null, new Error('未找到触发器执行日志'));
      } else {
        const logDetails = triggerLogs.map(log => `${log.trigger_name}: ${log.status}`).join(', ');
        recordTest(`触发器日志 - ${user.userType}`, 'passed', `日志数量: ${triggerLogs.length}, 详情: ${logDetails}`);
      }
      
      // 测试10: 模拟前端登录验证
      console.log('\n📋 测试10: 模拟前端登录验证');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (signInError) {
        recordTest(`登录验证 - ${user.userType}`, 'failed', null, signInError);
      } else {
        recordTest(`登录验证 - ${user.userType}`, 'passed', '用户登录成功');
      }
      
      // 测试11: 清理测试数据
      console.log('\n📋 测试11: 清理测试数据');
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id);
      
      if (deleteError) {
        recordTest(`数据清理 - ${user.userType}`, 'failed', null, deleteError);
      } else {
        recordTest(`数据清理 - ${user.userType}`, 'passed', '测试用户已删除');
      }
      
      console.log(`✅ 用户 ${user.userType} 测试完成\n`);
    }
    
    // 测试12: 验证前端组件
    console.log('\n📋 测试12: 验证前端组件');
    
    const frontendComponents = [
      'src/components/LifeXApp.tsx',
      'src/lib/authService.ts',
      'src/lib/quotaConfig.ts',
      'src/hooks/useAuth.ts'
    ];
    
    for (const componentPath of frontendComponents) {
      const fullPath = path.join(__dirname, componentPath);
      if (fs.existsSync(fullPath)) {
        recordTest(`前端组件检查 - ${componentPath}`, 'passed', '组件文件存在');
      } else {
        recordTest(`前端组件检查 - ${componentPath}`, 'failed', null, new Error(`组件文件不存在: ${componentPath}`));
      }
    }
    
  } catch (error) {
    recordTest('测试执行', 'failed', null, error);
  }
  
  // 生成测试报告
  console.log('\n' + '=' .repeat(60));
  console.log('📊 网页端注册测试结果总结');
  console.log('=' .repeat(60));
  
  console.log(`总测试数: ${testResults.summary.total}`);
  console.log(`通过: ${testResults.summary.passed}`);
  console.log(`失败: ${testResults.summary.failed}`);
  console.log(`成功率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    testResults.summary.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }
  
  // 保存测试结果
  const resultsFile = saveTestResults();
  
  // 生成测试报告
  const reportFile = resultsFile.replace('.json', '.md');
  const report = generateTestReport(testResults);
  fs.writeFileSync(reportFile, report);
  console.log(`📄 测试报告已保存到: ${reportFile}`);
  
  // 最终结论
  if (testResults.summary.failed === 0) {
    console.log('\n🎉 所有测试通过！网页端注册功能工作正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误详情。');
  }
  
  // 显示下一步操作
  console.log('\n🎯 下一步操作:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问注册页面: http://localhost:3000/auth/register');
  console.log('3. 在浏览器中手动测试注册流程');
  console.log('4. 检查注册后的用户状态和配额');
};

// 运行测试
runWebRegistrationTests().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  recordTest('测试执行', 'failed', null, error);
  saveTestResults();
});
