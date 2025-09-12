#!/usr/bin/env node
/**
 * 数据库架构和数据检查工具
 * 用于获取Supabase数据库的完整架构信息和数据统计
 * 
 * 使用方法:
 * node database-inspector.js [选项]
 * 
 * 选项:
 * --schema    只显示表结构
 * --data      只显示数据统计
 * --sample    显示示例数据
 * --all       显示所有信息（默认）
 * --table     指定特定表名
 * --export    导出为JSON文件
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 从环境变量获取配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.log('请确保 .env.local 文件包含:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  schema: args.includes('--schema'),
  data: args.includes('--data'),
  sample: args.includes('--sample'),
  all: args.includes('--all') || (!args.includes('--schema') && !args.includes('--data') && !args.includes('--sample')),
  table: args.find(arg => arg.startsWith('--table='))?.split('=')[1],
  export: args.includes('--export')
};

// 简单的HTTP请求函数
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ data: jsonData, status: res.statusCode });
        } catch (error) {
          resolve({ data: data, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 获取表结构信息
async function getTableSchema(tableName) {
  try {
    const result = await makeRequest(`/rest/v1/${tableName}?select=*&limit=1`);
    
    if (result.status === 200) {
      const sampleResult = await makeRequest(`/rest/v1/${tableName}?select=*&limit=1`);
      
      if (sampleResult.data && sampleResult.data.length > 0) {
        const sampleRecord = sampleResult.data[0];
        const schema = {
          tableName,
          fields: {},
          sampleData: sampleRecord
        };
        
        Object.keys(sampleRecord).forEach(key => {
          const value = sampleRecord[key];
          schema.fields[key] = {
            type: typeof value,
            nullable: value === null,
            example: value === null ? 'null' : 
                     typeof value === 'string' ? value.substring(0, 50) :
                     typeof value === 'object' ? JSON.stringify(value).substring(0, 50) :
                     String(value)
          };
        });
        
        return schema;
      } else {
        return {
          tableName,
          fields: {},
          sampleData: null,
          empty: true
        };
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error(`❌ 获取 ${tableName} 表结构失败:`, error.message);
    return null;
  }
}

// 获取表数据统计
async function getTableStats(tableName) {
  try {
    const result = await makeRequest(`/rest/v1/${tableName}?select=*&limit=0`);
    return {
      tableName,
      count: result.data?.length || 0,
      status: result.status
    };
  } catch (error) {
    return {
      tableName,
      count: 0,
      error: error.message
    };
  }
}

// 获取示例数据
async function getSampleData(tableName, limit = 3) {
  try {
    const result = await makeRequest(`/rest/v1/${tableName}?select=*&limit=${limit}`);
    return {
      tableName,
      data: result.data || [],
      count: result.data?.length || 0
    };
  } catch (error) {
    return {
      tableName,
      data: [],
      error: error.message
    };
  }
}

// 显示表结构
function displaySchema(schema) {
  if (!schema) return;
  
  console.log(`\n📋 ${schema.tableName} 表结构:`);
  if (schema.empty) {
    console.log('  (表存在但无数据)');
    return;
  }
  
  console.log('字段名 | 类型 | 可空 | 示例值');
  console.log('------|------|------|--------');
  
  Object.entries(schema.fields).forEach(([key, field]) => {
    const nullable = field.nullable ? '是' : '否';
    const example = field.example.length > 30 ? 
      field.example.substring(0, 30) + '...' : 
      field.example;
    console.log(`${key} | ${field.type} | ${nullable} | ${example}`);
  });
}

// 显示数据统计
function displayStats(stats) {
  console.log(`  - ${stats.tableName}: ${stats.count} 条记录`);
}

// 显示示例数据
function displaySampleData(sample) {
  if (sample.error) {
    console.log(`  ${sample.tableName}: 获取失败 - ${sample.error}`);
    return;
  }
  
  if (sample.count === 0) {
    console.log(`  ${sample.tableName}: 无数据`);
    return;
  }
  
  console.log(`\n  ${sample.tableName} 示例数据:`);
  sample.data.forEach((record, index) => {
    console.log(`    ${index + 1}. ${JSON.stringify(record, null, 2).substring(0, 200)}...`);
  });
}

// 导出数据为JSON
async function exportToJson(data, filename) {
  const exportData = {
    timestamp: new Date().toISOString(),
    project: supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1],
    data
  };
  
  const filepath = path.join(process.cwd(), filename);
  fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
  console.log(`\n💾 数据已导出到: ${filepath}`);
}

// 主函数
async function main() {
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  console.log('🔍 数据库架构和数据检查工具');
  console.log(`📡 项目: ${projectId}`);
  console.log(`⏰ 时间: ${new Date().toLocaleString()}\n`);

  // 定义所有表
  const allTables = [
    'businesses',
    'specials', 
    'special_claims',
    'special_views',
    'user_profiles',
    'trending_posts',
    'post_likes',
    'post_shares',
    'post_comments'
  ];

  // 如果指定了特定表，只检查该表
  const tablesToCheck = options.table ? [options.table] : allTables;
  
  const results = {
    schemas: {},
    stats: {},
    samples: {}
  };

  // 获取表结构
  if (options.schema || options.all) {
    console.log('📋 获取表结构...');
    for (const table of tablesToCheck) {
      const schema = await getTableSchema(table);
      if (schema) {
        results.schemas[table] = schema;
        displaySchema(schema);
      }
    }
  }

  // 获取数据统计
  if (options.data || options.all) {
    console.log('\n📊 数据统计:');
    for (const table of tablesToCheck) {
      const stats = await getTableStats(table);
      results.stats[table] = stats;
      displayStats(stats);
    }
  }

  // 获取示例数据
  if (options.sample || options.all) {
    console.log('\n📝 示例数据:');
    for (const table of tablesToCheck) {
      const sample = await getSampleData(table);
      results.samples[table] = sample;
      displaySampleData(sample);
    }
  }

  // 导出数据
  if (options.export) {
    await exportToJson(results, `database-schema-${Date.now()}.json`);
  }

  console.log('\n✅ 检查完成！');
  
  // 显示使用帮助
  if (args.length === 0) {
    console.log('\n💡 使用帮助:');
    console.log('  --schema    只显示表结构');
    console.log('  --data      只显示数据统计');
    console.log('  --sample    只显示示例数据');
    console.log('  --table=表名  检查特定表');
    console.log('  --export    导出为JSON文件');
    console.log('  --all       显示所有信息（默认）');
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});


