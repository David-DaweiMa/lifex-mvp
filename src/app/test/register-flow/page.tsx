'use client';

import { useState } from 'react';

export default function RegisterFlowPage() {
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
      const response = await fetch('/api/test/register-flow', {
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
            注册流程详细调试
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个工具会详细调试注册流程的每个步骤，帮助找出邮件发送的具体问题。
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
              {loading ? '调试中...' : '开始注册流程调试'}
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
                  {result.success ? '✅ 注册流程调试完成' : '❌ 注册流程调试失败'}
                </h3>
                <p className={`mt-2 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message || result.error}
                </p>
              </div>

              {result.debug && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">环境配置检查</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Resend API Key:</span> 
                        <span className={`ml-2 ${result.debug.envCheck.resendApiKey ? 'text-green-600' : 'text-red-600'}`}>
                          {result.debug.envCheck.resendApiKey ? '✅ 已配置' : '❌ 未配置'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">发件人邮箱:</span> 
                        <span className="ml-2 text-gray-600">{result.debug.envCheck.resendFromEmail || '未设置'}</span>
                      </div>
                      <div>
                        <span className="font-medium">应用URL:</span> 
                        <span className="ml-2 text-gray-600">{result.debug.envCheck.appUrl || '未设置'}</span>
                      </div>
                      <div>
                        <span className="font-medium">确认邮件URL:</span> 
                        <span className="ml-2 text-gray-600">{result.debug.envCheck.emailConfirmationUrl || '未设置'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Supabase URL:</span> 
                        <span className={`ml-2 ${result.debug.envCheck.supabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
                          {result.debug.envCheck.supabaseUrl ? '✅ 已配置' : '❌ 未配置'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Supabase Service Key:</span> 
                        <span className={`ml-2 ${result.debug.envCheck.supabaseServiceKey ? 'text-green-600' : 'text-red-600'}`}>
                          {result.debug.envCheck.supabaseServiceKey ? '✅ 已配置' : '❌ 未配置'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <h4 className="font-medium text-green-800 mb-3">邮件服务状态</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Resend 初始化:</span> 
                        <span className={`ml-2 ${result.debug.emailServiceStatus.resendInitialized ? 'text-green-600' : 'text-red-600'}`}>
                          {result.debug.emailServiceStatus.resendInitialized ? '✅ 成功' : '❌ 失败'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">发件人邮箱:</span> 
                        <span className="ml-2 text-gray-600">{result.debug.emailServiceStatus.fromEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-3">注册结果</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">状态:</span> 
                        <span className={`ml-2 ${result.debug.registrationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.debug.registrationResult.success ? '✅ 成功' : '❌ 失败'}
                        </span>
                      </div>
                      {result.debug.registrationResult.error && (
                        <div>
                          <span className="font-medium">错误:</span> 
                          <span className="ml-2 text-red-600">{result.debug.registrationResult.error}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">耗时:</span> 
                        <span className="ml-2 text-gray-600">{result.debug.duration}</span>
                      </div>
                    </div>
                  </div>

                                     {result.debug.userStatus && (
                     <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                       <h4 className="font-medium text-purple-800 mb-3">用户状态</h4>
                       <div className="space-y-2 text-sm">
                         <div>
                           <span className="font-medium">用户ID:</span> 
                           <span className="ml-2 text-gray-600">{result.debug.userStatus.id}</span>
                         </div>
                         <div>
                           <span className="font-medium">邮箱:</span> 
                           <span className="ml-2 text-gray-600">{result.debug.userStatus.email}</span>
                         </div>
                         <div>
                           <span className="font-medium">邮箱验证状态:</span> 
                           <span className={`ml-2 ${result.debug.userStatus.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                             {result.debug.userStatus.is_verified ? '✅ 已验证' : '❌ 未验证'}
                           </span>
                         </div>
                         <div>
                           <span className="font-medium">创建时间:</span> 
                           <span className="ml-2 text-gray-600">{result.debug.userStatus.created_at}</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {result.debug.emailSendAttempts && result.debug.emailSendAttempts.length > 0 && (
                     <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                       <h4 className="font-medium text-orange-800 mb-3">邮件发送过程</h4>
                       <div className="space-y-3">
                         <div>
                           <span className="font-medium">邮件发送状态:</span> 
                           <span className={`ml-2 ${result.debug.emailSendSuccess ? 'text-green-600' : 'text-red-600'}`}>
                             {result.debug.emailSendSuccess ? '✅ 成功' : '❌ 失败'}
                           </span>
                         </div>
                         {result.debug.emailSendError && (
                           <div>
                             <span className="font-medium">邮件发送错误:</span> 
                             <span className="ml-2 text-red-600">{result.debug.emailSendError}</span>
                           </div>
                         )}
                         <div>
                           <span className="font-medium">发送尝试次数:</span> 
                           <span className="ml-2 text-gray-600">{result.debug.emailSendAttempts.length}</span>
                         </div>
                         <div className="space-y-2">
                           <span className="font-medium">详细尝试记录:</span>
                           {result.debug.emailSendAttempts.map((attempt: any, index) => (
                             <div key={index} className="bg-white p-3 rounded border text-xs">
                               <div className="grid grid-cols-2 gap-2">
                                 <div>
                                   <span className="font-medium">尝试 {attempt.attempt}:</span> 
                                   <span className={`ml-1 ${attempt.success ? 'text-green-600' : 'text-red-600'}`}>
                                     {attempt.success ? '✅ 成功' : '❌ 失败'}
                                   </span>
                                 </div>
                                 <div>
                                   <span className="font-medium">耗时:</span> 
                                   <span className="ml-1 text-gray-600">{attempt.duration}</span>
                                 </div>
                               </div>
                               {attempt.error && (
                                 <div className="mt-1 text-red-600">
                                   <span className="font-medium">错误:</span> {attempt.error}
                                 </div>
                               )}
                               <div className="mt-1 text-gray-500">
                                 {attempt.timestamp}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">调试时间</h4>
                    <div className="text-sm text-gray-600">
                      {result.debug.timestamp}
                    </div>
                  </div>
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
              href="/test/compare-emails"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              邮件对比测试
            </a>
            <a
              href="/test/debug-email"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              详细调试
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
