'use client';

import React, { useState } from 'react';

export default function DiagnoseBusinessRegistration() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setDiagnostics(null);

    try {
      const response = await fetch('/api/test/diagnose-business-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123',
          business_name: 'Test Business',
          service_category: 'restaurant'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '诊断失败');
      }

      setDiagnostics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '诊断过程中发生错误');
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
            Business用户注册诊断工具
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个工具将逐步检查business用户注册过程中可能遇到的问题，包括环境变量、数据库连接、表结构、RLS策略等。
          </p>

          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? '运行诊断中...' : '开始诊断'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <strong>错误:</strong> {error}
            </div>
          )}

          {diagnostics && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                诊断结果
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
                  <h3 className="font-semibold text-green-900 mb-2">✅ 诊断完成</h3>
                  <p className="text-green-800">
                    所有检查都通过了！Business用户注册应该可以正常工作。如果仍然遇到问题，请检查具体的错误日志。
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 发现问题</h3>
                  <p className="text-yellow-800">
                    诊断发现了问题。请查看上面失败的步骤，并根据错误信息进行修复。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
