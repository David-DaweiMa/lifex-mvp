'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DiagnoseRegistrationPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState(`test-${Date.now()}@example.com`);
  const [testPassword, setTestPassword] = useState('TestPassword123!');

  const addResult = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // 步骤1: 检查环境变量
      addResult('环境检查', 'info', '开始检查环境变量...');
      
      const envVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        resendApiKey: process.env.RESEND_API_KEY,
      };

      addResult('环境变量', 'info', '环境变量状态', envVars);

      // 步骤2: 检查数据库连接
      addResult('数据库连接', 'info', '测试数据库连接...');
      
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        if (error) throw error;
        addResult('数据库连接', 'success', '数据库连接成功');
      } catch (error: any) {
        addResult('数据库连接', 'error', `数据库连接失败: ${error.message}`);
        return;
      }

      // 步骤3: 检查RLS策略
      addResult('RLS策略', 'info', '检查RLS策略...');
      
      try {
        const { data: policies, error } = await supabase.rpc('check_rls_policies');
        if (error) {
          // 如果RPC不存在，直接查询
          const { data: directPolicies, error: directError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
          
          if (directError) {
            addResult('RLS策略', 'error', `RLS策略检查失败: ${directError.message}`);
          } else {
            addResult('RLS策略', 'info', 'RLS策略状态需要进一步检查');
          }
        } else {
          addResult('RLS策略', 'success', 'RLS策略检查完成', policies);
        }
      } catch (error: any) {
        addResult('RLS策略', 'error', `RLS策略检查异常: ${error.message}`);
      }

      // 步骤4: 检查触发器
      addResult('触发器', 'info', '检查触发器状态...');
      
      try {
        const { data: triggers, error } = await supabase.rpc('check_triggers');
        if (error) {
          addResult('触发器', 'info', '触发器检查需要进一步验证');
        } else {
          addResult('触发器', 'success', '触发器检查完成', triggers);
        }
      } catch (error: any) {
        addResult('触发器', 'error', `触发器检查异常: ${error.message}`);
      }

      // 步骤5: 测试用户注册
      addResult('用户注册', 'info', '开始测试用户注册...');
      
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              username: 'testuser',
              full_name: 'Test User',
              user_type: 'free'
            }
          }
        });

        if (authError) {
          addResult('用户注册', 'error', `用户注册失败: ${authError.message}`, authError);
          return;
        }

        if (authData.user) {
          addResult('用户注册', 'success', '用户创建成功', {
            userId: authData.user.id,
            email: authData.user.email,
            emailConfirmed: authData.user.email_confirmed_at
          });

          // 等待一下让触发器执行
          await new Promise(resolve => setTimeout(resolve, 3000));

          // 步骤6: 检查用户配置文件
          addResult('配置文件检查', 'info', '检查用户配置文件是否创建...');
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profileError) {
              addResult('配置文件检查', 'error', `配置文件查询失败: ${profileError.message}`, profileError);
            } else if (profile) {
              addResult('配置文件检查', 'success', '用户配置文件创建成功', profile);
            } else {
              addResult('配置文件检查', 'error', '用户配置文件未找到');
            }
          } catch (error: any) {
            addResult('配置文件检查', 'error', `配置文件检查异常: ${error.message}`);
          }

          // 步骤7: 检查邮件确认token
          addResult('邮件Token', 'info', '检查邮件确认token...');
          
          try {
            const { data: tokens, error: tokenError } = await supabase
              .from('email_confirmations')
              .select('*')
              .eq('user_id', authData.user.id);

            if (tokenError) {
              addResult('邮件Token', 'error', `Token查询失败: ${tokenError.message}`, tokenError);
            } else if (tokens && tokens.length > 0) {
              addResult('邮件Token', 'success', '邮件确认token创建成功', tokens[0]);
            } else {
              addResult('邮件Token', 'error', '邮件确认token未找到');
            }
          } catch (error: any) {
            addResult('邮件Token', 'error', `Token检查异常: ${error.message}`);
          }

          // 步骤8: 清理测试数据
          addResult('清理', 'info', '清理测试数据...');
          
          try {
            // 删除相关数据
            await supabase.from('email_confirmations').delete().eq('user_id', authData.user.id);
            await supabase.from('user_profiles').delete().eq('id', authData.user.id);
            
            // 删除用户
            const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
            if (deleteError) {
              addResult('清理', 'error', `用户删除失败: ${deleteError.message}`);
            } else {
              addResult('清理', 'success', '测试数据清理完成');
            }
          } catch (error: any) {
            addResult('清理', 'error', `清理异常: ${error.message}`);
          }
        }
      } catch (error: any) {
        addResult('用户注册', 'error', `注册过程异常: ${error.message}`, error);
      }

      addResult('诊断完成', 'success', '所有诊断步骤已完成');

    } catch (error: any) {
      addResult('诊断过程', 'error', `诊断过程异常: ${error.message}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 注册流程诊断工具
          </h1>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试邮箱
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试密码
                </label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={runDiagnostic}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '诊断中...' : '开始诊断'}
              </button>
              <button
                onClick={clearResults}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                清除结果
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">诊断结果</h2>
            
            {testResults.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                点击"开始诊断"按钮开始测试
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {result.step}
                        </h3>
                        <p className={`text-sm ${
                          result.status === 'success' ? 'text-green-700' :
                          result.status === 'error' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                          {result.message}
                        </p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              查看详细信息
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
