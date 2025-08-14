'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/authService';
import { checkUserQuota, updateUserQuota, getUserQuotas } from '@/lib/quotaService';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export default function TestPage() {
  const [user, setUser] = useState<any>(null);
  const [quotas, setQuotas] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    try {
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
        await loadQuotas(result.user.id);
      }
    } catch (error) {
      console.error('检查用户失败:', error);
    }
    setLoading(false);
  };

  const loadQuotas = async (userId: string) => {
    try {
      const quotaData = await getUserQuotas(userId);
      setQuotas(quotaData);
    } catch (error) {
      console.error('加载配额失败:', error);
    }
  };

  const testQuotaSystem = async () => {
    if (!user) {
      addResult({ success: false, error: '请先登录' });
      return;
    }

    setLoading(true);
    try {
      const quotaData = await getUserQuotas(user.id);
      setQuotas(quotaData);
      addResult({ success: true, data: quotaData });
    } catch (error) {
      addResult({ success: false, error: '配额系统测试失败' });
    }
    setLoading(false);
  };

  const testUpdateQuota = async (quotaType: string) => {
    if (!user) {
      addResult({ success: false, error: '请先登录' });
      return;
    }

    setLoading(true);
    try {
      // 检查配额
      const quotaCheck = await checkUserQuota(user.id, quotaType as any);
      
      if (!quotaCheck.canUse) {
        addResult({ success: false, error: `配额已用完: ${quotaType}`, data: quotaCheck });
        setLoading(false);
        return;
      }

      // 更新配额
      const updateResult = await updateUserQuota(user.id, quotaType as any);
      
      if (!updateResult) {
        addResult({ success: false, error: '配额更新失败' });
        setLoading(false);
        return;
      }

      // 重新加载配额
      await loadQuotas(user.id);
      
      addResult({ 
        success: true, 
        data: { 
          message: '配额更新成功',
          quotaType,
          previousQuota: quotaCheck
        } 
      });
    } catch (error) {
      addResult({ success: false, error: '配额更新测试失败' });
    }
    setLoading(false);
  };

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: Date.now() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LifeX 系统测试页面</h1>

        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          {user ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>邮箱:</strong> {user.email}</p>
                <p><strong>用户名:</strong> {user.username || '未设置'}</p>
              </div>
              <div>
                <p><strong>用户类型:</strong> {user.user_type}</p>
                <p><strong>验证状态:</strong> {user.is_verified ? '已验证' : '未验证'}</p>
                <p><strong>创建时间:</strong> {new Date(user.created_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">未登录</p>
          )}
        </div>

        {/* 配额信息 */}
        {quotas && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">配额信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(quotas).map(([type, quota]: [string, any]) => (
                <div key={type} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 capitalize">{type}</h3>
                  <div className="space-y-2">
                    <p><strong>状态:</strong> {quota.canUse ? '可用' : '已用完'}</p>
                    <p><strong>当前使用:</strong> {quota.current}</p>
                    <p><strong>最大限制:</strong> {quota.max}</p>
                    <p><strong>剩余:</strong> {quota.remaining}</p>
                    <p><strong>重置日期:</strong> {quota.resetDate}</p>
                    {quota.error && <p className="text-red-600"><strong>错误:</strong> {quota.error}</p>}
                  </div>
                  <button
                    onClick={() => testUpdateQuota(type)}
                    disabled={!quota.canUse}
                    className={`mt-3 px-4 py-2 rounded text-sm font-medium ${
                      quota.canUse 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    测试使用
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测试按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          <div className="space-x-4">
            <button
              onClick={checkUser}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              检查用户状态
            </button>
            <button
              onClick={testQuotaSystem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              测试配额系统
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>
        </div>

        {/* 测试结果 */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅ 成功' : '❌ 失败'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-red-700 mt-2">{result.error}</p>
                  )}
                  {result.data && (
                    <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
