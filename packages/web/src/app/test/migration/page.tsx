// 测试数据库迁移结果的页面
"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Database, Users, Building, TrendingUp } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const MigrationTestPage: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: '数据库连接', status: 'pending', message: '正在测试...' },
    { name: '用户表新字段', status: 'pending', message: '正在测试...' },
    { name: '商家表新字段', status: 'pending', message: '正在测试...' },
    { name: 'AI助手使用表', status: 'pending', message: '正在测试...' },
    { name: '产品配额表', status: 'pending', message: '正在测试...' },
    { name: '商业验证表', status: 'pending', message: '正在测试...' },
    { name: 'API端点测试', status: 'pending', message: '正在测试...' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // 测试数据库连接
    await updateTest(0, 'pending', '正在测试数据库连接...');
    try {
      const response = await fetch('/api/businesses/test');
      const data = await response.json();
      if (data.success) {
        await updateTest(0, 'success', '数据库连接正常', data);
      } else {
        await updateTest(0, 'error', '数据库连接失败', data);
      }
    } catch (error) {
      await updateTest(0, 'error', `数据库连接错误: ${error}`);
    }

    // 测试用户表新字段
    await updateTest(1, 'pending', '正在测试用户表新字段...');
    try {
      const response = await fetch('/api/test/user-fields');
      const data = await response.json();
      if (data.success) {
        await updateTest(1, 'success', '用户表新字段正常', data);
      } else {
        await updateTest(1, 'error', '用户表新字段测试失败', data);
      }
    } catch (error) {
      await updateTest(1, 'error', `用户表测试错误: ${error}`);
    }

    // 测试商家表新字段
    await updateTest(2, 'pending', '正在测试商家表新字段...');
    try {
      const response = await fetch('/api/test/business-fields');
      const data = await response.json();
      if (data.success) {
        await updateTest(2, 'success', '商家表新字段正常', data);
      } else {
        await updateTest(2, 'error', '商家表新字段测试失败', data);
      }
    } catch (error) {
      await updateTest(2, 'error', `商家表测试错误: ${error}`);
    }

    // 测试AI助手使用表
    await updateTest(3, 'pending', '正在测试AI助手使用表...');
    try {
      const response = await fetch('/api/test/assistant-usage');
      const data = await response.json();
      if (data.success) {
        await updateTest(3, 'success', 'AI助手使用表正常', data);
      } else {
        await updateTest(3, 'error', 'AI助手使用表测试失败', data);
      }
    } catch (error) {
      await updateTest(3, 'error', `AI助手使用表测试错误: ${error}`);
    }

    // 测试产品配额表
    await updateTest(4, 'pending', '正在测试产品配额表...');
    try {
      const response = await fetch('/api/test/product-quota');
      const data = await response.json();
      if (data.success) {
        await updateTest(4, 'success', '产品配额表正常', data);
      } else {
        await updateTest(4, 'error', '产品配额表测试失败', data);
      }
    } catch (error) {
      await updateTest(4, 'error', `产品配额表测试错误: ${error}`);
    }

    // 测试商业验证表
    await updateTest(5, 'pending', '正在测试商业验证表...');
    try {
      const response = await fetch('/api/test/business-verification');
      const data = await response.json();
      if (data.success) {
        await updateTest(5, 'success', '商业验证表正常', data);
      } else {
        await updateTest(5, 'error', '商业验证表测试失败', data);
      }
    } catch (error) {
      await updateTest(5, 'error', `商业验证表测试错误: ${error}`);
    }

    // 测试API端点
    await updateTest(6, 'pending', '正在测试API端点...');
    try {
      const response = await fetch('/api/businesses');
      const data = await response.json();
      if (data.success) {
        await updateTest(6, 'success', 'API端点正常', data);
      } else {
        await updateTest(6, 'error', 'API端点测试失败', data);
      }
    } catch (error) {
      await updateTest(6, 'error', `API端点测试错误: ${error}`);
    }

    setIsRunning(false);
  };

  const updateTest = async (index: number, status: TestResult['status'], message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ));
    // 添加延迟以显示测试过程
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">数据库迁移测试</h1>
              <p className="text-gray-600">验证数据库迁移是否成功完成</p>
            </div>
          </div>

          {/* 测试统计 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">成功</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{successCount}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">失败</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{errorCount}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">进行中</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{pendingCount}</div>
            </div>
          </div>

          {/* 运行测试按钮 */}
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  正在运行测试...
                </>
              ) : (
                '运行所有测试'
              )}
            </button>
          </div>

          {/* 测试结果列表 */}
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-colors ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {test.status === 'success' && '✅ 通过'}
                    {test.status === 'error' && '❌ 失败'}
                    {test.status === 'pending' && '⏳ 等待中'}
                  </div>
                </div>
                
                {test.data && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 测试完成后的总结 */}
          {!isRunning && successCount + errorCount === tests.length && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">测试总结</h3>
              <p className="text-sm text-gray-600">
                共运行 {tests.length} 个测试，成功 {successCount} 个，失败 {errorCount} 个。
                {errorCount === 0 ? (
                  <span className="text-green-600 font-medium"> 所有测试通过！数据库迁移成功。</span>
                ) : (
                  <span className="text-red-600 font-medium"> 有测试失败，请检查错误信息。</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationTestPage;

