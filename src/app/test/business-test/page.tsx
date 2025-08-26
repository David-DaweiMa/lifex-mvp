// src/app/test/business-test/page.tsx
'use client';

import React, { useState } from 'react';
import { Building, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const BusinessRegistrationTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const log = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setError('');

    const testData = {
      email: `business-${Date.now()}@test.com`,
      password: 'test123456',
      username: `testbiz${Date.now()}`,
      full_name: 'Test Business Owner',
      phone: '0211234567',
      user_type: 'free_business',
      business_name: 'Test Restaurant',
      service_category: 'dining'
    };

    log('开始企业用户注册测试...');
    log(`测试数据: ${JSON.stringify(testData, null, 2)}`);

    try {
      // 步骤1: 测试完整注册
      log('步骤1: 发送注册请求...');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        log('✅ 注册API调用成功');
        log(`响应: ${JSON.stringify(result, null, 2)}`);
        
        // 步骤2: 等待数据库操作完成，然后验证
        log('步骤2: 等待3秒后验证数据库记录...');
        
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch('/api/test/verify-business-registration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: testData.email })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResponse.ok) {
              log('✅ 验证API调用成功');
              log(`验证结果: ${JSON.stringify(verifyResult.verification, null, 2)}`);
              
              const v = verifyResult.verification;
              
              if (v.authUserExists) {
                log('✅ Auth用户存在');
              } else {
                log('❌ Auth用户不存在');
              }
              
              if (v.profileExists) {
                log('✅ 用户配置文件存在');
              } else {
                log('❌ 用户配置文件不存在');
                if (v.profileError) {
                  log(`配置文件错误: ${v.profileError}`);
                }
              }
              
              if (v.businessExists) {
                log('✅ 业务记录存在');
                log('🎉 企业用户注册完全成功！');
              } else {
                log('❌ 业务记录不存在 - 这是主要问题！');
                if (v.businessError) {
                  log(`业务记录错误: ${v.businessError}`);
                }
                
                // 如果业务记录不存在，尝试手动创建来诊断问题
                log('步骤3: 尝试手动创建业务记录来诊断问题...');
                
                const manualBusinessResponse = await fetch('/api/test/create-business-record', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: v.profileId,
                    businessName: testData.business_name,
                    serviceCategory: testData.service_category,
                    phone: testData.phone,
                    email: testData.email
                  })
                });
                
                const manualBusinessResult = await manualBusinessResponse.json();
                
                if (manualBusinessResponse.ok) {
                  log('✅ 手动业务记录创建成功');
                  log('💡 问题确认: 注册API中的业务记录创建逻辑有问题');
                } else {
                  log('❌ 手动业务记录创建也失败');
                  log(`手动创建错误: ${JSON.stringify(manualBusinessResult, null, 2)}`);
                  setError('业务记录创建失败，可能是数据库字段或约束问题');
                }
              }
              
            } else {
              log('❌ 验证API调用失败');
              log(`验证错误: ${verifyResult.error}`);
            }
          } catch (verifyError) {
            log(`❌ 验证过程异常: ${verifyError}`);
          } finally {
            setIsRunning(false);
          }
        }, 3000);
        
      } else {
        log('❌ 注册API调用失败');
        log(`错误响应: ${JSON.stringify(result, null, 2)}`);
        setError(result.error || '注册失败');
        setIsRunning(false);
      }

    } catch (error) {
      log(`❌ 测试过程异常: ${error}`);
      setError(error instanceof Error ? error.message : '未知错误');
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Building className="text-purple-500" size={32} />
            <h1 className="text-2xl font-bold text-white">企业用户注册问题诊断</h1>
          </div>
          <p className="text-gray-400">
            专门测试企业用户注册流程，重点检查业务记录创建问题
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={runTest}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Play size={16} />
            <span>{isRunning ? '测试进行中...' : '开始企业注册测试'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50">
            <div className="flex items-center space-x-2">
              <XCircle className="text-red-500" size={16} />
              <p className="text-red-300 font-medium">测试失败</p>
            </div>
            <p className="text-red-200 mt-2">{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">测试日志</h2>
          </div>
          <div className="p-4">
            {testResults.length === 0 ? (
              <p className="text-gray-500">点击上方按钮开始测试...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result.includes('✅') && (
                      <div className="text-green-400">{result}</div>
                    )}
                    {result.includes('❌') && (
                      <div className="text-red-400">{result}</div>
                    )}
                    {result.includes('💡') && (
                      <div className="text-yellow-400">{result}</div>
                    )}
                    {result.includes('🎉') && (
                      <div className="text-green-300 font-bold">{result}</div>
                    )}
                    {!result.includes('✅') && !result.includes('❌') && !result.includes('💡') && !result.includes('🎉') && (
                      <div className="text-gray-300">{result}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="text-blue-400" size={16} />
            <h3 className="text-blue-300 font-medium">测试说明</h3>
          </div>
          <div className="text-blue-200 text-sm space-y-1">
            <p>• 这个测试会创建真实的测试用户数据</p>
            <p>• 测试完成后建议清理测试数据</p>
            <p>• 如果业务记录创建失败，会自动尝试手动创建来隔离问题</p>
            <p>• 注意查看控制台日志获取更多技术细节</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistrationTest;