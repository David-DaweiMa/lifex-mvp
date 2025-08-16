'use client';

import { useState } from 'react';

export default function EmailServiceTestPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '测试用户'
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
      const response = await fetch('/api/test/email-service', {
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
            邮件服务独立测试
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个页面专门用于测试邮件服务本身，不涉及注册流程。如果这里的测试成功，说明邮件服务配置正确。
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
                  用户名
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="测试用户名"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试邮件服务'}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className={`p-4 rounded-md ${
                result.emailSent ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  result.emailSent ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.emailSent ? '✅ 邮件服务测试成功' : '❌ 邮件服务测试失败'}
                </h3>
                <p className={`mt-2 ${
                  result.emailSent ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                {result.emailError && (
                  <p className="mt-2 text-red-600">
                    错误: {result.emailError}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">环境配置检查</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Resend API Key:</span> 
                    <span className={`ml-2 ${result.envCheck.resendApiKey ? 'text-green-600' : 'text-red-600'}`}>
                      {result.envCheck.resendApiKey ? '✅ 已配置' : '❌ 未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">发件人邮箱:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.resendFromEmail || '未设置'}</span>
                  </div>
                  <div>
                    <span className="font-medium">确认邮件URL:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.emailConfirmationUrl || '未设置'}</span>
                  </div>
                  <div>
                    <span className="font-medium">应用URL:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.appUrl || '未设置'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">邮件服务状态</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Resend 初始化:</span> 
                    <span className={`ml-2 ${result.emailServiceStatus.resendInitialized ? 'text-green-600' : 'text-red-600'}`}>
                      {result.emailServiceStatus.resendInitialized ? '✅ 成功' : '❌ 失败'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">发件人邮箱:</span> 
                    <span className="ml-2 text-gray-600">{result.emailServiceStatus.fromEmail}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-3">测试结果</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">邮件发送状态:</span> 
                    <span className={`ml-2 ${result.emailSent ? 'text-green-600' : 'text-red-600'}`}>
                      {result.emailSent ? '✅ 成功' : '❌ 失败'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">耗时:</span> 
                    <span className="ml-2 text-gray-600">{result.duration}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">测试时间</h4>
                <div className="text-sm text-gray-600">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/test/register-flow"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              注册流程测试
            </a>
            <a
              href="/test/register-email"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              注册邮件测试
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
