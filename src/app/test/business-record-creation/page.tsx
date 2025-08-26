'use client';

import React, { useState } from 'react';

export default function BusinessRecordCreationTest() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setDiagnostics(null);

    try {
      const response = await fetch('/api/test/business-record-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_name: 'Test Business',
          service_category: 'restaurant'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '测试失败');
      }

      setDiagnostics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Business记录创建测试
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个测试专门检查business记录创建过程中可能遇到的问题，包括businesses表结构、categories表、以及实际的记录插入操作。
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">问题分析</h3>
            <p className="text-blue-800 text-sm">
              个人用户可以注册但business用户不行，说明问题出现在business记录创建步骤。
              这个测试将帮助我们定位具体的问题所在。
            </p>
          </div>

          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? '运行测试中...' : '开始测试'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <strong>错误:</strong> {error}
            </div>
          )}

          {diagnostics && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                测试结果
              </h2>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">总结</h3>
                <p className="text-blue-800">{diagnostics.summary}</p>
              </div>

              <div className="space-y-4">
                {Object.entries(diagnostics.diagnostics).map(([key, step]: [string, any]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(step.status)}`}>
                        {getStatusIcon(step.status)} {step.status === 'passed' ? '通过' : step.status === 'failed' ? '失败' : '待检查'}
                      </span>
                    </div>

                    {step.error && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <strong className="text-red-800">错误:</strong>
                        <p className="text-red-700 mt-1">{step.error}</p>
                      </div>
                    )}

                    {step.details && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">详细信息:</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {diagnostics.success ? (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ 测试通过</h3>
                  <p className="text-green-800">
                    Business记录创建测试通过！Business用户注册应该可以正常工作。
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 发现问题</h3>
                  <p className="text-yellow-800">
                    测试发现了business记录创建的问题。请查看上面失败的步骤，并根据错误信息进行修复。
                  </p>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">建议的修复步骤:</h4>
                    <ol className="text-yellow-800 text-sm list-decimal list-inside space-y-1">
                      <li>在Supabase SQL编辑器中执行 <code className="bg-yellow-200 px-1 rounded">database-schema-fix.sql</code></li>
                      <li>确保businesses表有所有必需的字段</li>
                      <li>确保categories表存在且有数据</li>
                      <li>检查RLS策略是否正确配置</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
