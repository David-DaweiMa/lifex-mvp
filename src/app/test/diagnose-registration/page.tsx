'use client';

import { useState } from 'react';

export default function DiagnoseRegistrationPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/diagnose-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: '请求失败: ' + (error instanceof Error ? error.message : '未知错误')
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'error': return 'text-red-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      case 'completed': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            注册流程详细诊断
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个工具会详细分析注册流程的每个步骤，帮助找出邮件发送失败的具体原因。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入测试邮箱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="至少6位密码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="用户名（可选）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  全名
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="全名（可选）"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '诊断中...' : '开始诊断'}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              {/* 总体结果 */}
              <div className={`p-4 rounded-md ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ 诊断完成 - 所有步骤成功' : '❌ 诊断完成 - 发现问题'}
                </h3>
                {result.error && (
                  <p className="mt-2 text-red-700">{result.error}</p>
                )}
              </div>

              {/* 诊断步骤 */}
              {result.diagnosis && result.diagnosis.steps && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-4">诊断步骤详情</h4>
                  <div className="space-y-3">
                    {result.diagnosis.steps.map((step: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">{step.step}.</span>
                          <span className="text-sm font-medium">{step.name}</span>
                          <span className={`text-sm ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)} {step.status}
                          </span>
                        </div>
                        {step.details && (
                          <div className="text-xs text-gray-600 ml-4">
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(step.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 错误列表 */}
              {result.diagnosis && result.diagnosis.errors && result.diagnosis.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <h4 className="font-medium text-red-800 mb-3">发现的问题</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.diagnosis.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-700 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 警告列表 */}
              {result.diagnosis && result.diagnosis.warnings && result.diagnosis.warnings.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-3">警告信息</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.diagnosis.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-yellow-700 text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 最终结果 */}
              {result.diagnosis && result.diagnosis.finalResult && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">最终结果</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">用户创建:</span> 
                      <span className={`ml-2 ${result.diagnosis.finalResult.userCreated ? 'text-green-600' : 'text-red-600'}`}>
                        {result.diagnosis.finalResult.userCreated ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">配置文件:</span> 
                      <span className={`ml-2 ${result.diagnosis.finalResult.profileCreated ? 'text-green-600' : 'text-red-600'}`}>
                        {result.diagnosis.finalResult.profileCreated ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">邮件发送:</span> 
                      <span className={`ml-2 ${result.diagnosis.finalResult.emailSent ? 'text-green-600' : 'text-red-600'}`}>
                        {result.diagnosis.finalResult.emailSent ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">用户ID:</span> 
                      <span className="ml-2 text-gray-600">{result.diagnosis.finalResult.userId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 诊断时间 */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">诊断时间</h4>
                <div className="text-sm text-gray-600">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/test/email-service"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              邮件服务测试
            </a>
            <a
              href="/test/register-flow"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              注册流程测试
            </a>
            <a
              href="/test/env-check"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              环境配置检查
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              实际注册页面
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
