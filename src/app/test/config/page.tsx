'use client';

import { useState, useEffect } from 'react';

interface ConfigStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'unknown';
  message: string;
  value?: string;
}

export default function ConfigTestPage() {
  const [configs, setConfigs] = useState<ConfigStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfigs();
  }, []);

  const checkConfigs = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/test/config');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      setConfigs([
        {
          name: 'API 连接',
          status: 'error',
          message: '无法连接到配置检查 API'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              配置检查
            </h1>
            <button
              onClick={checkConfigs}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '检查中...' : '重新检查'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在检查配置...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(config.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(config.status)}</span>
                      <div>
                        <h3 className="font-medium">{config.name}</h3>
                        <p className="text-sm mt-1">{config.message}</p>
                        {config.value && (
                          <p className="text-xs mt-1 font-mono bg-black bg-opacity-10 px-2 py-1 rounded">
                            {config.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 配置说明 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">配置说明：</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Resend API Key</strong>：从 Resend 控制台获取的 API 密钥</li>
              <li>• <strong>Resend From Email</strong>：发送邮件的地址（通常是 noreply@lifex.co.nz）</li>
              <li>• <strong>Email Confirmation URL</strong>：邮件确认页面的 URL</li>
              <li>• <strong>App URL</strong>：应用程序的基础 URL</li>
              <li>• 如果配置有误，请检查 .env.local 文件</li>
            </ul>
          </div>

          {/* 快速链接 */}
          <div className="mt-6 flex space-x-4">
            <a
              href="/test/email"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              测试邮件发送
            </a>
            <a
              href="/auth/register"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              测试用户注册
            </a>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
