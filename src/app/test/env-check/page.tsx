'use client';

import { useState, useEffect } from 'react';

interface EnvCheckResult {
  success: boolean;
  configured: boolean;
  issues: string[];
  envCheck: {
    supabase: {
      url: boolean;
      anonKey: boolean;
      serviceKey: boolean;
      urlValue: string;
      anonKeyValue: string;
      serviceKeyValue: string;
    };
    email: {
      resendApiKey: boolean;
      resendFromEmail: string;
      emailConfirmationUrl: string;
      emailWelcomeUrl: string;
    };
    app: {
      appUrl: string;
      nodeEnv: string;
    };
    openai: {
      apiKey: boolean;
      model: string;
    };
    database: {
      databaseUrl: boolean;
      databaseUrlValue: string;
    };
    analytics: {
      gaId: boolean;
      sentryDsn: boolean;
    };
  };
  timestamp: string;
}

export default function EnvCheckPage() {
  const [result, setResult] = useState<EnvCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEnvironment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/env-check');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || '检查失败');
      }
    } catch (err) {
      setError('请求失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              环境变量配置检查
            </h1>
            <button
              onClick={checkEnvironment}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '检查中...' : '重新检查'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium">检查失败</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 总体状态 */}
              <div className={`p-4 rounded-md ${
                result.configured ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  result.configured ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.configured ? '✅ 环境配置完整' : '❌ 环境配置不完整'}
                </h3>
                {result.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-700 font-medium">需要解决的问题：</p>
                    <ul className="mt-1 list-disc list-inside text-red-600">
                      {result.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Supabase 配置 */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">Supabase 配置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">项目 URL:</span> 
                    <span className={`ml-2 ${result.envCheck.supabase.url ? 'text-green-600' : 'text-red-600'}`}>
                      {result.envCheck.supabase.urlValue}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">匿名密钥:</span> 
                    <span className={`ml-2 ${result.envCheck.supabase.anonKey ? 'text-green-600' : 'text-red-600'}`}>
                      {result.envCheck.supabase.anonKeyValue}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">服务密钥:</span> 
                    <span className={`ml-2 ${result.envCheck.supabase.serviceKey ? 'text-green-600' : 'text-red-600'}`}>
                      {result.envCheck.supabase.serviceKeyValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* 邮件配置 */}
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-3">邮件服务配置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Resend API Key:</span> 
                    <span className={`ml-2 ${result.envCheck.email.resendApiKey ? 'text-green-600' : 'text-red-600'}`}>
                      {result.envCheck.email.resendApiKey ? '已配置' : '未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">发件人邮箱:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.email.resendFromEmail}</span>
                  </div>
                  <div>
                    <span className="font-medium">确认邮件 URL:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.email.emailConfirmationUrl}</span>
                  </div>
                  <div>
                    <span className="font-medium">欢迎邮件 URL:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.email.emailWelcomeUrl}</span>
                  </div>
                </div>
              </div>

              {/* 应用配置 */}
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">应用配置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">应用 URL:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.app.appUrl}</span>
                  </div>
                  <div>
                    <span className="font-medium">环境:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.app.nodeEnv}</span>
                  </div>
                </div>
              </div>

              {/* OpenAI 配置 */}
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-3">OpenAI 配置（可选）</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">API Key:</span> 
                    <span className={`ml-2 ${result.envCheck.openai.apiKey ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.envCheck.openai.apiKey ? '已配置' : '未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">模型:</span> 
                    <span className="ml-2 text-gray-600">{result.envCheck.openai.model}</span>
                  </div>
                </div>
              </div>

              {/* 数据库配置 */}
              <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
                <h4 className="font-medium text-indigo-800 mb-3">数据库配置</h4>
                <div className="text-sm">
                  <div>
                    <span className="font-medium">数据库 URL:</span> 
                    <span className={`ml-2 ${result.envCheck.database.databaseUrl ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.envCheck.database.databaseUrlValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* 分析配置 */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">分析配置（可选）</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Google Analytics:</span> 
                    <span className={`ml-2 ${result.envCheck.analytics.gaId ? 'text-green-600' : 'text-gray-500'}`}>
                      {result.envCheck.analytics.gaId ? '已配置' : '未配置'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Sentry DSN:</span> 
                    <span className={`ml-2 ${result.envCheck.analytics.sentryDsn ? 'text-green-600' : 'text-gray-500'}`}>
                      {result.envCheck.analytics.sentryDsn ? '已配置' : '未配置'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 检查时间 */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">检查时间</h4>
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
              邮件发送测试
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
