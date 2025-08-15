'use client';

import { useState, useEffect } from 'react';

interface ConfigData {
  nodeEnv: string;
  appUrl: string;
  resendApiKey: string;
  resendFromEmail: string;
  emailConfirmationUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  config: ConfigData;
  timestamp: string;
}

export default function ProductionConfigPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/test/production');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('无法获取配置信息');
      } finally {
        setLoading(false);
      }
    };

    checkConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在检查生产环境配置...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ 错误</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">无数据</p>
        </div>
      </div>
    );
  }

  const config = data.config;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            生产环境配置检查
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 环境信息 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">环境信息</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Node 环境:</span>
                  <span className={`font-medium ${config.nodeEnv === 'production' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {config.nodeEnv || '未设置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">应用 URL:</span>
                  <span className="font-medium text-gray-900">{config.appUrl || '未设置'}</span>
                </div>
              </div>
            </div>

            {/* 邮件配置 */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-3">邮件配置</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Resend API Key:</span>
                  <span className={`font-medium ${config.resendApiKey === '已配置' ? 'text-green-600' : 'text-red-600'}`}>
                    {config.resendApiKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">发件人邮箱:</span>
                  <span className="font-medium text-gray-900">{config.resendFromEmail || '未设置'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">确认 URL:</span>
                  <span className="font-medium text-gray-900">{config.emailConfirmationUrl || '未设置'}</span>
                </div>
              </div>
            </div>

            {/* Supabase 配置 */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-3">Supabase 配置</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Supabase URL:</span>
                  <span className={`font-medium ${config.supabaseUrl === '已配置' ? 'text-green-600' : 'text-red-600'}`}>
                    {config.supabaseUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">匿名 Key:</span>
                  <span className={`font-medium ${config.supabaseAnonKey === '已配置' ? 'text-green-600' : 'text-red-600'}`}>
                    {config.supabaseAnonKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">服务 Key:</span>
                  <span className={`font-medium ${config.supabaseServiceKey === '已配置' ? 'text-green-600' : 'text-red-600'}`}>
                    {config.supabaseServiceKey}
                  </span>
                </div>
              </div>
            </div>

            {/* 时间戳 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">检查时间</h2>
              <div className="text-gray-600">
                {new Date(data.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/test/email"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              测试邮件发送
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              测试用户注册
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
