// RLS修复测试脚本
// 验证用户配置文件创建问题是否已解决

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
  
  const filename = `rls-fix-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 测试结果已保存到: ${filepath}`);
  
  return filepath;
};

// 主测试函数
const runRLSFixTests = async () => {
  console.log('🔧 RLS修复测试开始');
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
    // 测试1: 检查数据库连接
    console.log('\n📋 测试1: 检查数据库连接');
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      recordTest('数据库连接', 'failed', null, connectionError);
      throw connectionError;
    }
    
    recordTest('数据库连接', 'passed', '成功连接到Supabase数据库');
    
    // 测试2: 检查RLS策略
    console.log('\n📋 测试2: 检查RLS策略');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { table_name: 'user_profiles' })
      .catch(() => ({ data: null, error: new Error('无法直接查询RLS策略') }));
    
    if (policiesError) {
      recordTest('RLS策略检查', 'failed', null, policiesError);
    } else {
      recordTest('RLS策略检查', 'passed', 'RLS策略已配置');
    }
    
    // 测试3: 创建测试用户
    console.log('\n📋 测试3: 创建测试用户');
    
    const testEmail = `test-rls-fix-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 测试邮箱: ${testEmail}`);
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: {
        username: 'testrlsfix',
        full_name: 'Test RLS Fix User',
        user_type: 'free'
      },
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
    
    // 测试4: 验证用户配置文件创建
    console.log('\n📋 测试4: 验证用户配置文件创建');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (profileError) {
      recordTest('用户配置文件创建', 'failed', null, profileError);
      console.log('   🔍 错误详情:', profileError.message);
      
      // 检查是否是RLS策略问题
      if (profileError.message.includes('row-level security policy')) {
        console.log('   ⚠️  这仍然是RLS策略问题，需要执行 fix-rls-policies.sql');
      }
    } else {
      recordTest('用户配置文件创建', 'passed', `用户类型: ${profile.user_type}, 邮箱: ${profile.email}`);
    }
    
    // 测试5: 验证用户配额设置
    console.log('\n📋 测试5: 验证用户配额设置');
    
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
    
    // 测试6: 检查触发器执行日志
    console.log('\n📋 测试6: 检查触发器执行日志');
    
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
      
      // 检查是否有错误
      const errorLogs = triggerLogs.filter(log => log.status === 'error');
      if (errorLogs.length > 0) {
        console.log('   ⚠️  发现触发器错误:');
        errorLogs.forEach(log => {
          console.log(`      - ${log.error_message}`);
        });
      }
    }
    
    // 测试7: 清理测试数据
    console.log('\n📋 测试7: 清理测试数据');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id);
    
    if (deleteError) {
      recordTest('清理测试数据', 'failed', null, deleteError);
    } else {
      recordTest('清理测试数据', 'passed', '测试用户已删除');
    }
    
  } catch (error) {
    recordTest('测试执行', 'failed', null, error);
  }
  
  // 生成测试报告
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RLS修复测试结果总结');
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
  
  // 最终结论和建议
  if (testResults.summary.failed === 0) {
    console.log('\n🎉 所有测试通过！RLS问题已修复。');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步修复。');
    console.log('\n🔧 修复建议:');
    console.log('1. 在Supabase SQL编辑器中执行 fix-rls-policies.sql');
    console.log('2. 重新运行此测试脚本');
    console.log('3. 如果仍有问题，检查触发器函数权限');
  }
  
  // 显示下一步操作
  console.log('\n🎯 下一步操作:');
  console.log('1. 如果测试失败，执行 fix-rls-policies.sql');
  console.log('2. 重新运行此测试脚本验证修复');
  console.log('3. 在网页端测试注册功能');
  console.log('4. 检查注册后的用户状态');
};

// 运行测试
runRLSFixTests().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  recordTest('测试执行', 'failed', null, error);
  saveTestResults();
});
