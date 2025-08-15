'use client';

import { useState } from 'react';

export default function CompareEmailsPage() {
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
      const response = await fetch('/api/test/compare-emails', {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            邮件发送对比测试
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个工具会对比不同类型的邮件发送，帮助找出注册邮件收不到的原因。
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
              {loading ? '对比测试中...' : '开始对比测试'}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className={`p-4 rounded-md ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ 对比测试完成' : '❌ 对比测试失败'}
                </h3>
                <p className={`mt-2 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message || result.error}
                </p>
              </div>

              {result.comparison && (
                <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">邮件发送对比结果</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">测试邮件:</span> 
                      <span className={`ml-2 ${result.comparison.testEmailSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {result.comparison.testEmailSuccess ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">确认邮件:</span> 
                      <span className={`ml-2 ${result.comparison.confirmationEmailSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {result.comparison.confirmationEmailSuccess ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">注册邮件:</span> 
                      <span className={`ml-2 ${result.comparison.registrationEmailSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {result.comparison.registrationEmailSuccess ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">实际注册:</span> 
                      <span className={`ml-2 ${result.comparison.actualRegistrationSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {result.comparison.actualRegistrationSuccess ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {result.results && (
                <div className="space-y-4">
                  {result.results.testEmail && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-3">测试邮件结果</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">状态:</span> 
                          <span className={`ml-2 ${result.results.testEmail.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.results.testEmail.success ? '成功' : '失败'}
                          </span>
                        </div>
                        {result.results.testEmail.error && (
                          <div>
                            <span className="font-medium">错误:</span> 
                            <span className="ml-2 text-red-600">{result.results.testEmail.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.results.confirmationEmail && (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-3">确认邮件结果</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">状态:</span> 
                          <span className={`ml-2 ${result.results.confirmationEmail.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.results.confirmationEmail.success ? '成功' : '失败'}
                          </span>
                        </div>
                        {result.results.confirmationEmail.error && (
                          <div>
                            <span className="font-medium">错误:</span> 
                            <span className="ml-2 text-red-600">{result.results.confirmationEmail.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.results.registrationEmail && (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <h4 className="font-medium text-green-800 mb-3">注册邮件结果</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">状态:</span> 
                          <span className={`ml-2 ${result.results.registrationEmail.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.results.registrationEmail.success ? '成功' : '失败'}
                          </span>
                        </div>
                        {result.results.registrationEmail.error && (
                          <div>
                            <span className="font-medium">错误:</span> 
                            <span className="ml-2 text-red-600">{result.results.registrationEmail.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.results.actualRegistration && (
                    <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
                      <h4 className="font-medium text-indigo-800 mb-3">实际注册结果</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">状态:</span> 
                          <span className={`ml-2 ${result.results.actualRegistration.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.results.actualRegistration.success ? '成功' : '失败'}
                          </span>
                        </div>
                        {result.results.actualRegistration.error && (
                          <div>
                            <span className="font-medium">错误:</span> 
                            <span className="ml-2 text-red-600">{result.results.actualRegistration.error}</span>
                          </div>
                        )}
                        {result.results.actualRegistration.user && (
                          <div>
                            <span className="font-medium">用户ID:</span> 
                            <span className="ml-2 text-gray-600">{result.results.actualRegistration.user.id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.stack && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <h4 className="font-medium text-red-800 mb-3">错误堆栈</h4>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-x-auto">
                    {result.stack}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/test/debug-email"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              详细调试
            </a>
            <a
              href="/test/register-email"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              注册邮件测试
            </a>
            <a
              href="/test/email"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              邮件测试
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
