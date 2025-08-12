// test-ai.js - AI功能测试脚本
const fetch = require('node-fetch');

async function testAI() {
  console.log('🧪 测试 LifeX AI 功能...\n');

  const baseUrl = 'http://localhost:3000';

  // 测试1: 基本对话
  console.log('1️⃣ 测试基本对话...');
  try {
    const response = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'conversation',
        data: {
          message: '推荐一个适合工作的咖啡店',
          conversationHistory: [
            { role: 'assistant', content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?" }
          ]
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 对话测试成功');
      console.log('AI 回复:', result.data.message);
      if (result.data.recommendations) {
        console.log('推荐数量:', result.data.recommendations.length);
      }
      if (result.data.followUpQuestions) {
        console.log('后续问题:', result.data.followUpQuestions);
      }
    } else {
      console.log('❌ 对话测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 对话测试错误:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 推荐功能
  console.log('2️⃣ 测试推荐功能...');
  try {
    const response = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'recommendations',
        data: {
          query: '健康食品',
          userPreferences: ['healthy', 'organic']
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 推荐测试成功');
      console.log('推荐数量:', result.data.recommendations.length);
      console.log('解释:', result.data.explanation);
      console.log('置信度:', result.data.confidence);
    } else {
      console.log('❌ 推荐测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 推荐测试错误:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 错误处理
  console.log('3️⃣ 测试错误处理...');
  try {
    const response = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'invalid_type',
        data: {}
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.log('✅ 错误处理测试成功 - 正确返回错误');
      console.log('错误信息:', result.error);
    } else {
      console.log('❌ 错误处理测试失败 - 应该返回错误');
    }
  } catch (error) {
    console.log('❌ 错误处理测试错误:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 AI 功能测试完成！');
  console.log('\n💡 提示:');
  console.log('- 确保开发服务器正在运行 (npm run dev)');
  console.log('- 检查环境变量配置 (.env.local)');
  console.log('- 查看控制台输出了解详细结果');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ 开发服务器正在运行');
      return true;
    }
  } catch (error) {
    console.log('❌ 开发服务器未运行');
    console.log('请先运行: npm run dev');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 LifeX AI 功能测试工具\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    return;
  }

  await testAI();
}

// 运行测试
main().catch(console.error);
