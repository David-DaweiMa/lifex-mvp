// 注册流程测试脚本
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testRegistrationFlow = async () => {
  console.log('🧪 注册流程测试开始');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ 缺少必要的环境变量');
    console.log('请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('\n📋 1. 检查数据库表结构');
    
    // 检查用户配置文件表
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ 用户配置文件表访问失败:', profilesError.message);
    } else {
      console.log('✅ 用户配置文件表可访问');
    }

    // 检查用户配额表
    const { data: quotas, error: quotasError } = await supabase
      .from('user_quotas')
      .select('*')
      .limit(1);
    
    if (quotasError) {
      console.log('❌ 用户配额表访问失败:', quotasError.message);
    } else {
      console.log('✅ 用户配额表可访问');
    }

    // 检查触发器日志表
    const { data: logs, error: logsError } = await supabase
      .from('trigger_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      console.log('❌ 触发器日志表访问失败:', logsError.message);
    } else {
      console.log('✅ 触发器日志表可访问');
    }

    console.log('\n📋 2. 检查触发器函数');
    
    // 检查触发器函数是否存在
    const { data: functions, error: functionsError } = await supabase
      .rpc('check_functions_exist');
    
    if (functionsError) {
      console.log('⚠️  无法直接检查函数，但可以继续测试');
    } else {
      console.log('✅ 触发器函数检查完成');
    }

    console.log('\n📋 3. 模拟用户注册流程');
    
    // 生成测试用户数据
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
    console.log(`👤 用户类型: ${testUserData.user_metadata.user_type}`);

    // 创建测试用户
    console.log('\n🔄 创建测试用户...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: testUserData.user_metadata,
      email_confirm: true
    });

    if (authError) {
      console.log('❌ 用户创建失败:', authError.message);
      return;
    }

    console.log('✅ 测试用户创建成功');
    console.log(`🆔 用户ID: ${authUser.user.id}`);

    // 等待触发器执行
    console.log('\n⏳ 等待触发器执行...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 4. 验证用户配置文件创建');
    
    // 检查用户配置文件是否创建
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) {
      console.log('❌ 用户配置文件未找到:', profileError.message);
      console.log('🔧 触发器可能未正常工作');
    } else {
      console.log('✅ 用户配置文件创建成功');
      console.log(`📝 用户类型: ${profile.user_type}`);
      console.log(`📧 邮箱: ${profile.email}`);
      console.log(`✅ 已验证: ${profile.is_verified}`);
    }

    console.log('\n📋 5. 验证用户配额设置');
    
    // 检查用户配额是否设置
    const { data: userQuotas, error: quotaError } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', authUser.user.id);

    if (quotaError) {
      console.log('❌ 用户配额查询失败:', quotaError.message);
    } else if (userQuotas.length === 0) {
      console.log('❌ 用户配额未设置');
      console.log('🔧 配额设置函数可能未正常工作');
    } else {
      console.log('✅ 用户配额设置成功');
      console.log(`📊 配额数量: ${userQuotas.length}`);
      
      // 显示配额详情
      userQuotas.forEach(quota => {
        console.log(`  - ${quota.quota_type}: ${quota.current_usage}/${quota.max_limit} (${quota.reset_period})`);
      });
    }

    console.log('\n📋 6. 检查触发器执行日志');
    
    // 检查触发器日志
    const { data: triggerLogs, error: logError } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', authUser.user.id)
      .order('execution_time', { ascending: false });

    if (logError) {
      console.log('❌ 触发器日志查询失败:', logError.message);
    } else if (triggerLogs.length === 0) {
      console.log('⚠️  未找到触发器执行日志');
      console.log('🔧 触发器可能未执行或日志记录失败');
    } else {
      console.log('✅ 触发器执行日志记录成功');
      triggerLogs.forEach(log => {
        console.log(`  - ${log.trigger_name}: ${log.status} (${log.execution_time})`);
        if (log.error_message) {
          console.log(`    ❌ 错误: ${log.error_message}`);
        }
      });
    }

    console.log('\n📋 7. 清理测试数据');
    
    // 删除测试用户
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id);
    
    if (deleteError) {
      console.log('⚠️  测试用户删除失败:', deleteError.message);
    } else {
      console.log('✅ 测试用户已删除');
    }

    console.log('\n📊 测试结果总结:');
    
    const results = {
      authUserCreated: !authError,
      profileCreated: !profileError,
      quotasSet: !quotaError && userQuotas.length > 0,
      logsRecorded: !logError && triggerLogs.length > 0
    };

    console.log(`✅ 用户创建: ${results.authUserCreated ? '成功' : '失败'}`);
    console.log(`✅ 配置文件: ${results.profileCreated ? '成功' : '失败'}`);
    console.log(`✅ 配额设置: ${results.quotasSet ? '成功' : '失败'}`);
    console.log(`✅ 日志记录: ${results.logsRecorded ? '成功' : '失败'}`);

    if (results.profileCreated && results.quotasSet) {
      console.log('\n🎉 注册流程测试通过！触发器工作正常。');
    } else {
      console.log('\n⚠️  注册流程测试失败，需要进一步检查触发器配置。');
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
  }
};

// 运行测试
testRegistrationFlow();
