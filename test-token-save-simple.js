const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 创建Supabase客户端（使用匿名密钥）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少必要的环境变量');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '已设置' : '未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTokenSave() {
  console.log('🔍 测试token保存问题...\n');

  try {
    // 1. 检查表是否存在（通过查询现有数据）
    console.log('1️⃣ 检查email_confirmations表...');
    const { data: existingData, error: existingError } = await supabase
      .from('email_confirmations')
      .select('*')
      .limit(1);

    if (existingError) {
      console.error('❌ 查询email_confirmations表失败:', existingError);
      console.error('错误详情:', JSON.stringify(existingError, null, 2));
      
      // 分析错误类型
      if (existingError.message.includes('relation "email_confirmations" does not exist')) {
        console.log('\n🔍 问题分析: email_confirmations表不存在');
        console.log('解决方案: 需要执行数据库重建脚本');
      } else if (existingError.message.includes('permission denied')) {
        console.log('\n🔍 问题分析: 权限被拒绝');
        console.log('解决方案: 检查RLS策略配置');
      } else if (existingError.message.includes('row security policy')) {
        console.log('\n🔍 问题分析: RLS策略阻止访问');
        console.log('解决方案: 检查RLS策略或使用服务角色密钥');
      }
      return;
    } else {
      console.log('✅ email_confirmations表可访问');
      console.log(`现有数据数量: ${existingData.length}`);
    }

    // 2. 尝试插入测试数据（这应该会失败，因为匿名用户没有插入权限）
    console.log('\n2️⃣ 尝试插入测试数据（预期会失败）...');
    const testToken = 'test-token-' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.log('❌ 插入失败（这是预期的，因为匿名用户没有插入权限）');
      console.log('错误:', insertError.message);
      
      // 分析错误类型
      if (insertError.message.includes('permission denied')) {
        console.log('\n🔍 问题分析: 权限被拒绝 - 这是正常的，因为匿名用户不应该有插入权限');
      } else if (insertError.message.includes('row security policy')) {
        console.log('\n🔍 问题分析: RLS策略阻止插入');
        console.log('解决方案: 需要服务角色密钥来绕过RLS');
      } else if (insertError.message.includes('violates not-null constraint')) {
        console.log('\n🔍 问题分析: 违反了非空约束');
        console.log('解决方案: 检查表结构和插入的数据');
      }
    } else {
      console.log('⚠️ 插入成功（这不应该发生，匿名用户不应该有插入权限）');
      console.log('插入的数据:', insertData);
    }

    // 3. 检查环境变量
    console.log('\n3️⃣ 检查环境变量...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 已设置' : '❌ 未设置');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');

    // 4. 分析问题
    console.log('\n4️⃣ 问题分析...');
    console.log('根据测试结果，token保存失败的可能原因：');
    console.log('1. 缺少SUPABASE_SERVICE_ROLE_KEY环境变量');
    console.log('2. RLS策略阻止服务角色插入数据');
    console.log('3. 表结构不匹配');
    console.log('4. 数据库权限配置问题');

    console.log('\n5️⃣ 建议的解决方案：');
    console.log('1. 在.env.local中添加SUPABASE_SERVICE_ROLE_KEY');
    console.log('2. 检查RLS策略配置');
    console.log('3. 执行数据库重建脚本');
    console.log('4. 检查Vercel环境变量配置');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testTokenSave().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
