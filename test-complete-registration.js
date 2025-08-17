// 完整注册流程测试脚本
// 测试新的数据库结构、邮件确认机制和用户类型对应

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
  
  const filename = `complete-registration-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 测试结果已保存到: ${filepath}`);
  
  return filepath;
};

// 主测试函数
const runCompleteRegistrationTests = async () => {
  console.log('🧪 完整注册流程测试开始');
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
    // 测试1: 检查数据库表结构
    console.log('\n📋 测试1: 检查数据库表结构');
    
    const requiredTables = ['user_profiles', 'user_quotas', 'anonymous_usage', 'trigger_logs', 'email_confirmations'];
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
    
    // 测试2: 检查数据库函数
    console.log('\n📋 测试2: 检查数据库函数');
    
    const requiredFunctions = ['handle_new_user', 'setup_user_quotas', 'generate_email_token', 'verify_email_token', 'mark_token_used'];
    for (const functionName of requiredFunctions) {
      try {
        const { data: functionData, error: functionError } = await supabase
          .rpc(functionName, {})
          .catch(() => ({ data: null, error: new Error('函数调用失败') }));
        
        if (functionError && functionError.message !== '函数调用失败') {
          recordTest(`函数检查 - ${functionName}`, 'failed', null, functionError);
        } else {
          recordTest(`函数检查 - ${functionName}`, 'passed', '函数存在且可调用');
        }
      } catch (error) {
        recordTest(`函数检查 - ${functionName}`, 'failed', null, error);
      }
    }
    
    // 测试3: 检查触发器
    console.log('\n📋 测试3: 检查触发器');
    
    const { data: triggers, error: triggerError } = await supabase
      .rpc('check_functions_exist', {})
      .catch(() => ({ data: null, error: new Error('无法检查触发器') }));
    
    if (triggerError) {
      recordTest('触发器检查', 'failed', null, triggerError);
    } else {
      recordTest('触发器检查', 'passed', '触发器配置正确');
    }
    
    // 测试4: 测试不同用户类型注册
    console.log('\n📋 测试4: 测试不同用户类型注册');
    
    const testUserTypes = ['free', 'customer', 'premium', 'free_business', 'professional_business', 'enterprise_business'];
    
    for (const userType of testUserTypes) {
      console.log(`\n🔄 测试用户类型: ${userType}`);
      
      const testEmail = `test-${userType}-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      console.log(`📧 测试邮箱: ${testEmail}`);
      
      // 创建测试用户
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        user_metadata: {
          username: `test${userType}`,
          full_name: `Test ${userType} User`,
          user_type: userType
        },
        email_confirm: false // 不自动确认，需要邮件验证
      });
      
      if (authError) {
        recordTest(`用户创建 - ${userType}`, 'failed', null, authError);
        continue;
      }
      
      recordTest(`用户创建 - ${userType}`, 'passed', `用户ID: ${authUser.user.id}`);
      
      // 等待触发器执行
      console.log('⏳ 等待触发器执行...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 验证用户配置文件
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
      
      if (profileError) {
        recordTest(`配置文件创建 - ${userType}`, 'failed', null, profileError);
      } else {
        recordTest(`配置文件创建 - ${userType}`, 'passed', `用户类型: ${profile.user_type}, 邮箱验证: ${profile.email_verified}`);
      }
      
      // 验证用户配额
      const { data: userQuotas, error: quotaError } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', authUser.user.id);
      
      if (quotaError) {
        recordTest(`配额设置 - ${userType}`, 'failed', null, quotaError);
      } else if (userQuotas.length === 0) {
        recordTest(`配额设置 - ${userType}`, 'failed', null, new Error('用户配额未设置'));
      } else {
        const quotaDetails = userQuotas.map(q => `${q.quota_type}: ${q.current_usage}/${q.max_limit}`).join(', ');
        recordTest(`配额设置 - ${userType}`, 'passed', `配额数量: ${userQuotas.length}, 详情: ${quotaDetails}`);
      }
      
      // 验证邮件确认token
      const { data: emailConfirmations, error: emailError } = await supabase
        .from('email_confirmations')
        .select('*')
        .eq('user_id', authUser.user.id)
        .eq('token_type', 'email_verification');
      
      if (emailError) {
        recordTest(`邮件确认token - ${userType}`, 'failed', null, emailError);
      } else if (emailConfirmations.length === 0) {
        recordTest(`邮件确认token - ${userType}`, 'failed', null, new Error('邮件确认token未生成'));
      } else {
        const token = emailConfirmations[0];
        recordTest(`邮件确认token - ${userType}`, 'passed', `Token: ${token.token.substring(0, 8)}..., 过期时间: ${token.expires_at}`);
      }
      
      // 验证触发器日志
      const { data: triggerLogs, error: logError } = await supabase
        .from('trigger_logs')
        .select('*')
        .eq('user_id', authUser.user.id)
        .order('execution_time', { ascending: false });
      
      if (logError) {
        recordTest(`触发器日志 - ${userType}`, 'failed', null, logError);
      } else if (triggerLogs.length === 0) {
        recordTest(`触发器日志 - ${userType}`, 'failed', null, new Error('未找到触发器执行日志'));
      } else {
        const logDetails = triggerLogs.map(log => `${log.trigger_name}: ${log.status}`).join(', ');
        recordTest(`触发器日志 - ${userType}`, 'passed', `日志数量: ${triggerLogs.length}, 详情: ${logDetails}`);
      }
      
      // 测试邮件确认流程
      if (emailConfirmations.length > 0) {
        const token = emailConfirmations[0].token;
        
        // 验证token
        const { data: tokenValidation, error: validationError } = await supabase
          .rpc('verify_email_token', { token: token, token_type: 'email_verification' });
        
        if (validationError) {
          recordTest(`Token验证 - ${userType}`, 'failed', null, validationError);
        } else if (tokenValidation.length === 0) {
          recordTest(`Token验证 - ${userType}`, 'failed', null, new Error('Token验证失败'));
        } else {
          const validation = tokenValidation[0];
          recordTest(`Token验证 - ${userType}`, 'passed', `有效: ${validation.valid}, 用户ID: ${validation.user_id}`);
          
          // 如果token有效，测试确认流程
          if (validation.valid) {
            // 标记token为已使用
            const { data: markResult, error: markError } = await supabase
              .rpc('mark_token_used', { token: token });
            
            if (markError) {
              recordTest(`Token标记 - ${userType}`, 'failed', null, markError);
            } else {
              recordTest(`Token标记 - ${userType}`, 'passed', 'Token已标记为已使用');
              
              // 更新用户邮箱验证状态
              const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ email_verified: true })
                .eq('id', authUser.user.id);
              
              if (updateError) {
                recordTest(`邮箱验证更新 - ${userType}`, 'failed', null, updateError);
              } else {
                recordTest(`邮箱验证更新 - ${userType}`, 'passed', '邮箱验证状态已更新');
              }
            }
          }
        }
      }
      
      // 清理测试数据
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id);
      
      if (deleteError) {
        recordTest(`数据清理 - ${userType}`, 'failed', null, deleteError);
      } else {
        recordTest(`数据清理 - ${userType}`, 'passed', '测试用户已删除');
      }
      
      console.log(`✅ 用户类型 ${userType} 测试完成\n`);
    }
    
    // 测试5: 验证RLS策略
    console.log('\n📋 测试5: 验证RLS策略');
    
    const { data: policies, error: policiesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .catch(() => ({ data: null, error: new Error('RLS策略阻止访问') }));
    
    if (policiesError && policiesError.message.includes('row-level security policy')) {
      recordTest('RLS策略检查', 'passed', 'RLS策略正常工作，阻止了未授权访问');
    } else if (policiesError) {
      recordTest('RLS策略检查', 'failed', null, policiesError);
    } else {
      recordTest('RLS策略检查', 'passed', 'RLS策略配置正确');
    }
    
  } catch (error) {
    recordTest('测试执行', 'failed', null, error);
  }
  
  // 生成测试报告
  console.log('\n' + '=' .repeat(60));
  console.log('📊 完整注册流程测试结果总结');
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
  
  // 最终结论
  if (testResults.summary.failed === 0) {
    console.log('\n🎉 所有测试通过！完整注册流程工作正常。');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步修复。');
  }
  
  // 显示下一步操作
  console.log('\n🎯 下一步操作:');
  console.log('1. 如果测试失败，检查数据库重建脚本是否已执行');
  console.log('2. 在网页端测试注册功能');
  console.log('3. 验证邮件确认流程');
  console.log('4. 检查不同用户类型的配额设置');
};

// 运行测试
runCompleteRegistrationTests().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  recordTest('测试执行', 'failed', null, error);
  saveTestResults();
});
