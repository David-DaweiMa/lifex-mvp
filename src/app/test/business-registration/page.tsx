// src/app/test/business-registration/page.tsx

'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Building, Database, ArrowRight } from 'lucide-react';

interface TestResult {
  step: number;
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: string;
}

const BusinessRegistrationTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const addResult = (step: number, name: string, status: 'success' | 'error' | 'warning' | 'pending', message: string, details?: any) => {
    const result: TestResult = {
      step,
      name,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setResults(prev => prev.map(r => r.step === step ? result : r).concat(result.step > prev.length ? [result] : []));
  };

  const runBusinessRegistrationTest = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentStep(0);

    const testEmail = `business-test-${Date.now()}@example.com`;
    const testData = {
      email: testEmail,
      password: 'testpass123',
      username: `biz_${Date.now()}`,
      full_name: 'Test Business Owner',
      phone: '0211234567',
      user_type: 'free_business',
      business_name: 'Test Restaurant Ltd',
      service_category: 'dining'
    };

    try {
      // 步骤1: 检查businesses表结构
      setCurrentStep(1);
      addResult(1, 'Businesses Table Structure', 'pending', '检查businesses表字段结构...');
      
      const structureResponse = await fetch('/api/test/business-table-structure');
      const structureData = await structureResponse.json();
      
      if (structureResponse.ok && structureData.hasRequiredFields) {
        addResult(1, 'Businesses Table Structure', 'success', 'Businesses表结构正确', structureData);
      } else {
        addResult(1, 'Businesses Table Structure', 'error', 'Businesses表结构不匹配', structureData);
        return;
      }

      // 步骤2: 测试类别映射
      setCurrentStep(2);
      addResult(2, 'Category Mapping', 'pending', '验证服务类别映射...');
      
      const categoryResponse = await fetch('/api/test/category-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_category: testData.service_category })
      });
      const categoryData = await categoryResponse.json();
      
      if (categoryResponse.ok && categoryData.categoryExists) {
        addResult(2, 'Category Mapping', 'success', `类别${testData.service_category}映射正确`, categoryData);
      } else {
        addResult(2, 'Category Mapping', 'error', '类别映射失败', categoryData);
        return;
      }

      // 步骤3: 测试用户创建（不创建业务记录）
      setCurrentStep(3);
      addResult(3, 'User Profile Creation', 'pending', '测试用户配置文件创建...');
      
      const userResponse = await fetch('/api/test/create-user-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      const userData = await userResponse.json();
      
      if (userResponse.ok && userData.userId) {
        addResult(3, 'User Profile Creation', 'success', '用户配置文件创建成功', { userId: userData.userId });
        
        // 步骤4: 手动测试业务记录创建
        setCurrentStep(4);
        addResult(4, 'Business Record Creation', 'pending', '测试业务记录创建...');
        
        const businessResponse = await fetch('/api/test/create-business-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.userId,
            businessName: testData.business_name,
            serviceCategory: testData.service_category,
            phone: testData.phone,
            email: testData.email
          })
        });
        const businessData = await businessResponse.json();
        
        if (businessResponse.ok && businessData.businessId) {
          addResult(4, 'Business Record Creation', 'success', '业务记录创建成功', businessData);
        } else {
          addResult(4, 'Business Record Creation', 'error', '业务记录创建失败', businessData);
        }
        
        // 步骤5: 测试完整注册流程
        setCurrentStep(5);
        addResult(5, 'Complete Registration', 'pending', '测试完整企业用户注册流程...');
        
        const fullTestEmail = `full-business-${Date.now()}@example.com`;
        const fullTestData = { ...testData, email: fullTestEmail, username: `full_${Date.now()}` };
        
        const fullRegResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullTestData)
        });
        const fullRegData = await fullRegResponse.json();
        
        if (fullRegResponse.ok) {
          addResult(5, 'Complete Registration', 'success', '完整注册流程成功', fullRegData);
          
          // 步骤6: 验证最终结果
          setCurrentStep(6);
          addResult(6, 'Final Verification', 'pending', '验证注册结果...');
          
          setTimeout(async () => {
            const verifyResponse = await fetch('/api/test/verify-business-registration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: fullTestEmail })
            });
            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.allRecordsExist) {
              addResult(6, 'Final Verification', 'success', '所有记录验证成功', verifyData);
            } else {
              addResult(6, 'Final Verification', 'error', '记录验证失败', verifyData);
            }
          }, 2000);
          
        } else {
          addResult(5, 'Complete Registration', 'error', '完整注册流程失败', fullRegData);
        }
        
      } else {
        addResult(3, 'User Profile Creation', 'error', '用户配置文件创建失败', userData);
      }

    } catch (error) {
      addResult(currentStep, 'Test Error', 'error', `测试过程发生错误: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
      case 'pending': return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-500/50 bg-green-900/20';
      case 'error': return 'border-red-500/50 bg-red-900/20';
      case 'warning': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'pending': return 'border-blue-500/50 bg-blue-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Building className="text-purple-500" size={32} />
            <h1 className="text-3xl font-bold text-white">企业用户注册专项诊断</h1>
          </div>
          <p className="text-gray-400">
            专门诊断企业用户注册过程中的问题，重点检查业务记录创建环节
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={runBusinessRegistrationTest}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Building size={16} />
            <span>{isRunning ? '诊断进行中...' : '开始企业用户注册测试'}</span>
          </button>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3, 4, 5, 6].map((stepNum) => {
            const result = results.find(r => r.step === stepNum);
            const stepNames = {
              1: 'Businesses表结构检查',
              2: '服务类别映射验证', 
              3: '用户配置文件创建测试',
              4: '业务记录创建测试',
              5: '完整注册流程测试',
              6: '最终结果验证'
            };

            return (
              <div
                key={stepNum}
                className={`p-6 rounded-lg border-2 transition-all ${
                  result ? getStatusColor(result.status) : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                      {stepNum}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {stepNames[stepNum as keyof typeof stepNames]}
                      </h3>
                      {result ? (
                        <div>
                          <p className="text-gray-300 mb-2">{result.message}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                          {result.details && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                                查看详细信息
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-800 p-3 rounded overflow-auto border border-gray-600">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">等待执行...</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {result ? getStatusIcon(result.status) : <div className="w-5 h-5 bg-gray-600 rounded-full" />}
                  </div>
                </div>
                {stepNum < 6 && (
                  <div className="mt-4 flex justify-center">
                    <ArrowRight className="text-gray-600" size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {results.length === 0 && !isRunning && (
          <div className="text-center py-12 text-gray-500">
            点击按钮开始企业用户注册专项诊断
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessRegistrationTest;