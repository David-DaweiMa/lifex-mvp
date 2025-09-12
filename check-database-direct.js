// 直接连接数据库检查架构和数据的脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.log('请确保 .env 文件包含:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 开始检查数据库架构...\n');

  try {
    // 1. 检查所有表名
    console.log('📋 1. 数据库中的所有表:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('❌ 获取表名失败:', tablesError.message);
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name} (${table.table_type})`);
      });
    }

    // 2. 检查 businesses 表结构
    console.log('\n🏢 2. Businesses表结构:');
    const { data: businessesColumns, error: businessesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'businesses')
      .order('ordinal_position');
    
    if (businessesError) {
      console.error('❌ 获取businesses表结构失败:', businessesError.message);
    } else {
      businessesColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 3. 检查 specials 表结构
    console.log('\n🎯 3. Specials表结构:');
    const { data: specialsColumns, error: specialsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'specials')
      .order('ordinal_position');
    
    if (specialsError) {
      console.error('❌ 获取specials表结构失败:', specialsError.message);
    } else {
      specialsColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 4. 检查现有数据
    console.log('\n📊 4. 现有数据统计:');
    
    // Businesses数据
    const { count: businessesCount, error: businessesCountError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    if (businessesCountError) {
      console.error('❌ 获取businesses数据统计失败:', businessesCountError.message);
    } else {
      console.log(`  - Businesses: ${businessesCount} 条记录`);
    }

    // Specials数据
    const { count: specialsCount, error: specialsCountError } = await supabase
      .from('specials')
      .select('*', { count: 'exact', head: true });
    
    if (specialsCountError) {
      console.error('❌ 获取specials数据统计失败:', specialsCountError.message);
    } else {
      console.log(`  - Specials: ${specialsCount} 条记录`);
    }

    // User profiles数据
    const { count: usersCount, error: usersCountError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersCountError) {
      console.error('❌ 获取user_profiles数据统计失败:', usersCountError.message);
    } else {
      console.log(`  - User Profiles: ${usersCount} 条记录`);
    }

    // Trending posts数据
    const { count: postsCount, error: postsCountError } = await supabase
      .from('trending_posts')
      .select('*', { count: 'exact', head: true });
    
    if (postsCountError) {
      console.error('❌ 获取trending_posts数据统计失败:', postsCountError.message);
    } else {
      console.log(`  - Trending Posts: ${postsCount} 条记录`);
    }

    // 5. 显示一些示例数据
    console.log('\n📝 5. 示例数据:');
    
    // Businesses示例
    const { data: businessesSample, error: businessesSampleError } = await supabase
      .from('businesses')
      .select('id, name, business_type, verification_status')
      .limit(3);
    
    if (businessesSampleError) {
      console.error('❌ 获取businesses示例数据失败:', businessesSampleError.message);
    } else {
      console.log('  Businesses示例:');
      businessesSample.forEach(business => {
        console.log(`    - ${business.name} (${business.business_type}) - 验证状态: ${business.verification_status}`);
      });
    }

    // Specials示例
    const { data: specialsSample, error: specialsSampleError } = await supabase
      .from('specials')
      .select('id, title, category, is_verified, is_active')
      .limit(3);
    
    if (specialsSampleError) {
      console.error('❌ 获取specials示例数据失败:', specialsSampleError.message);
    } else {
      console.log('  Specials示例:');
      specialsSample.forEach(special => {
        console.log(`    - ${special.title} (${special.category}) - 验证: ${special.is_verified}, 活跃: ${special.is_active}`);
      });
    }

  } catch (error) {
    console.error('❌ 检查数据库时发生错误:', error.message);
  }
}

// 运行检查
checkDatabaseSchema().then(() => {
  console.log('\n✅ 数据库架构检查完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});
