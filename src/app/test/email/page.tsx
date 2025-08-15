'use client';

import { useState } from 'react';
import { emailService } from '@/lib/emailService';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testEmailConfirmation = async () => {
    if (!email) {
      alert('请输入邮箱地址');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          type: 'confirmation'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: '测试失败：' + (error instanceof Error ? error.message : '未知错误')
      });
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    if (!email) {
      alert('请输入邮箱地址');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          type: 'welcome'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: '测试失败：' + (error instanceof Error ? error.message : '未知错误')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            邮件功能测试
          </h1>

          <div className="space-y-6">
            {/* 输入表单 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入您的邮箱地址进行测试"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="测试用户名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 测试按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={testEmailConfirmation}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发送中...' : '测试确认邮件'}
              </button>

              <button
                onClick={testWelcomeEmail}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发送中...' : '测试欢迎邮件'}
              </button>
            </div>

            {/* 结果显示 */}
            {result && (
              <div className={`p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full mr-3 ${
                    result.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">
                      {result.success ? '测试成功' : '测试失败'}
                    </p>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 说明信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">测试说明：</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 确认邮件：包含确认链接的邮件模板</li>
                <li>• 欢迎邮件：账户激活后的欢迎邮件</li>
                <li>• 请检查您的邮箱（包括垃圾邮件文件夹）</li>
                <li>• 如果测试失败，请检查环境变量配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
