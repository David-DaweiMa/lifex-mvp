// 完整的数据库触发器测试脚本
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

// 保存测试结果到文件
const saveTestResults = () => {
  const resultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const filename = `trigger-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 测试结果已保存到: ${filepath}`);
  
  return filepath;
};

// 主测试函数
const runTriggerTests = async () => {
  console.log('🧪 数据库触发器完整测试开始');
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
    // 测试1: 数据库连接
    console.log('\n📋 测试1: 数据库连接');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      recordTest('数据库连接', 'failed', null, connectionError);
      throw connectionError;
    }
    
    recordTest('数据库连接', 'passed', '成功连接到Supabase数据库');
    
    // 测试2: 检查表结构
    console.log('\n📋 测试2: 检查表结构');
    
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
    
    // 测试3: 检查触发器函数
    console.log('\n📋 测试3: 检查触发器函数');
    
    // 通过查询系统表检查函数是否存在
    const { data: functions, error: functionsError } = await supabase
      .rpc('check_functions_exist', {})
      .catch(() => ({ data: null, error: new Error('无法直接检查函数') }));
    
    if (functionsError) {
      recordTest('触发器函数检查', 'failed', null, functionsError);
    } else {
      recordTest('触发器函数检查', 'passed', '触发器函数存在');
    }
    
    // 测试4: 创建测试用户
    console.log('\n📋 测试4: 创建测试用户');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testUserData = {
      email: testEmail,
      password: testPassword,
      user_metadata: {
        username: 'testuser',
        full_name: 'Test User',
        user_type: 'customer'
      }
    };
    
    console.log(`📧 测试邮箱: ${testEmail}`);
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: testUserData.user_metadata,
      email_confirm: true
    });
    
    if (authError) {
      recordTest('创建测试用户', 'failed', null, authError);
      throw authError;
    }
    
    recordTest('创建测试用户', 'passed', `用户ID: ${authUser.user.id}`);
    
    // 等待触发器执行
    console.log('\n⏳ 等待触发器执行...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试5: 验证用户配置文件创建
    console.log('\n📋 测试5: 验证用户配置文件创建');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (profileError) {
      recordTest('用户配置文件创建', 'failed', null, profileError);
    } else {
      recordTest('用户配置文件创建', 'passed', `用户类型: ${profile.user_type}, 邮箱: ${profile.email}`);
    }
    
    // 测试6: 验证用户配额设置
    console.log('\n📋 测试6: 验证用户配额设置');
    
    const { data: userQuotas, error: quotaError } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', authUser.user.id);
    
    if (quotaError) {
      recordTest('用户配额设置', 'failed', null, quotaError);
    } else if (userQuotas.length === 0) {
      recordTest('用户配额设置', 'failed', null, new Error('用户配额未设置'));
    } else {
      const quotaDetails = userQuotas.map(q => `${q.quota_type}: ${q.current_usage}/${q.max_limit}`).join(', ');
      recordTest('用户配额设置', 'passed', `配额数量: ${userQuotas.length}, 详情: ${quotaDetails}`);
    }
    
    // 测试7: 检查触发器执行日志
    console.log('\n📋 测试7: 检查触发器执行日志');
    
    const { data: triggerLogs, error: logError } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', authUser.user.id)
      .order('execution_time', { ascending: false });
    
    if (logError) {
      recordTest('触发器执行日志', 'failed', null, logError);
    } else if (triggerLogs.length === 0) {
      recordTest('触发器执行日志', 'failed', null, new Error('未找到触发器执行日志'));
    } else {
      const logDetails = triggerLogs.map(log => `${log.trigger_name}: ${log.status}`).join(', ');
      recordTest('触发器执行日志', 'passed', `日志数量: ${triggerLogs.length}, 详情: ${logDetails}`);
    }
    
    // 测试8: 清理测试数据
    console.log('\n📋 测试8: 清理测试数据');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id);
    
    if (deleteError) {
      recordTest('清理测试数据', 'failed', null, deleteError);
    } else {
      recordTest('清理测试数据', 'passed', '测试用户已删除');
    }
    
    // 测试9: 验证清理结果
    console.log('\n📋 测试9: 验证清理结果');
    
    const { data: cleanupCheck, error: cleanupError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (cleanupError && cleanupError.code === 'PGRST116') {
      recordTest('验证清理结果', 'passed', '用户配置文件已正确删除');
    } else {
      recordTest('验证清理结果', 'failed', null, new Error('用户配置文件仍然存在'));
    }
    
  } catch (error) {
    recordTest('测试执行', 'failed', null, error);
  }
  
  // 生成测试报告
  console.log('\n' + '=' .repeat(60));
  console.log('📊 测试结果总结');
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
    console.log('\n🎉 所有测试通过！数据库触发器工作正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误详情。');
  }
};

// 生成测试报告
const generateTestReport = (results) => {
  const report = `# 数据库触发器测试报告

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
  '🎉 所有测试通过！数据库触发器配置正确，工作正常。' : 
  '⚠️ 部分测试失败，需要进一步检查和修复。'
}
`;

  return report;
};

// 运行测试
runTriggerTests().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  recordTest('测试执行', 'failed', null, error);
  saveTestResults();
});
