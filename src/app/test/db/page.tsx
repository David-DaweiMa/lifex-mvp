'use client';

import { useState, useEffect } from 'react';

interface TableInfo {
  exists: boolean;
  count: number;
  sample: any[];
  error?: string;
}

interface SchemaInfo {
  exists: boolean;
  sample_data?: any;
  error?: string;
}

export default function DatabaseTestPage() {
  const [schemaData, setSchemaData] = useState<any>(null);
  const [dataInfo, setDataInfo] = useState<any>(null);
  const [businessesData, setBusinessesData] = useState<any>(null);
  const [allTablesData, setAllTablesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'all_tables' | 'schema' | 'data' | 'businesses'>('overview');

  useEffect(() => {
    loadSchemaData();
    loadDataInfo();
  }, []);

  const loadSchemaData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/db?action=schema');
      const result = await response.json();
      if (result.success) {
        setSchemaData(result.data);
      }
    } catch (error) {
      console.error('加载模式数据失败:', error);
    }
    setLoading(false);
  };

  const loadDataInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/db?action=data');
      const result = await response.json();
      if (result.success) {
        setDataInfo(result.data);
      }
    } catch (error) {
      console.error('加载数据信息失败:', error);
    }
    setLoading(false);
  };

  const loadBusinessesData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/db?action=businesses');
      const result = await response.json();
      if (result.success) {
        setBusinessesData(result.data);
      }
    } catch (error) {
      console.error('加载 businesses 数据失败:', error);
    }
    setLoading(false);
  };

  const loadAllTablesData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/db?action=all_tables');
      const result = await response.json();
      if (result.success) {
        setAllTablesData(result.data);
      }
    } catch (error) {
      console.error('加载所有表数据失败:', error);
    }
    setLoading(false);
  };

  const handleTabChange = (tab: 'overview' | 'all_tables' | 'schema' | 'data' | 'businesses') => {
    setActiveTab(tab);
    if (tab === 'businesses' && !businessesData) {
      loadBusinessesData();
    } else if (tab === 'all_tables' && !allTablesData) {
      loadAllTablesData();
    }
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LifeX 数据库检查</h1>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => handleTabChange('all_tables')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all_tables'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                所有表
              </button>
              <button
                onClick={() => handleTabChange('schema')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schema'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                表结构
              </button>
              <button
                onClick={() => handleTabChange('data')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'data'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                数据信息
              </button>
              <button
                onClick={() => handleTabChange('businesses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'businesses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Businesses 数据
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && dataInfo && (
              <div>
                <h2 className="text-xl font-semibold mb-4">数据库概览</h2>
                
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800">总表数</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {Object.keys(dataInfo.dataInfo).length}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800">有数据的表</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.values(dataInfo.dataInfo).filter((info: any) => info.exists && info.count > 0).length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800">空表</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {Object.values(dataInfo.dataInfo).filter((info: any) => info.exists && info.count === 0).length}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800">不存在的表</h3>
                    <p className="text-2xl font-bold text-red-600">
                      {Object.values(dataInfo.dataInfo).filter((info: any) => !info.exists).length}
                    </p>
                  </div>
                </div>

                {/* 表数据统计 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">表数据统计</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(dataInfo.dataInfo).map(([tableName, info]) => {
                      const tableInfo = info as TableInfo;
                      return (
                        <div
                          key={tableName}
                          className={`border rounded-lg p-3 ${
                            tableInfo.exists && tableInfo.count > 0
                              ? 'bg-green-50 border-green-200'
                              : tableInfo.exists
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm">{tableName}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tableInfo.exists && tableInfo.count > 0
                                  ? 'bg-green-100 text-green-800'
                                  : tableInfo.exists
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tableInfo.exists && tableInfo.count > 0
                                ? `${tableInfo.count} 条`
                                : tableInfo.exists
                                ? '空表'
                                : '不存在'}
                            </span>
                          </div>
                          {tableInfo.exists && tableInfo.count > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              最后更新: {new Date(dataInfo.timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 数据丰富的表详情 */}
                {Object.entries(dataInfo.dataInfo).filter(([_, info]) => (info as TableInfo).exists && (info as TableInfo).count > 0).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">数据丰富的表</h3>
                    <div className="space-y-4">
                      {Object.entries(dataInfo.dataInfo)
                        .filter(([_, info]) => (info as TableInfo).exists && (info as TableInfo).count > 0)
                        .map(([tableName, info]) => {
                          const tableInfo = info as TableInfo;
                          return (
                            <div key={tableName} className="bg-white border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-semibold">{tableName}</h4>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {tableInfo.count.toLocaleString()} 条记录
                                </span>
                              </div>
                              {tableInfo.sample.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">示例数据:</p>
                                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(tableInfo.sample[0], null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 新发现的有数据的表 */}
                {allTablesData && allTablesData.existingTables && allTablesData.existingTables.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">🎉 新发现的有数据的表</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allTablesData.existingTables
                        .filter((table: any) => table.count > 0)
                        .map((table: any) => (
                          <div key={table.tableName} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-green-800">{table.tableName}</h4>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                {table.count.toLocaleString()} 条
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              最后检查: {new Date(allTablesData.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all_tables' && allTablesData && (
              <div>
                <h2 className="text-xl font-semibold mb-4">所有表数据</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(allTablesData.allTables).map(([tableName, info]) => {
                    const tableInfo = info as TableInfo;
                    return (
                      <div
                        key={tableName}
                        className={`border rounded-lg p-4 ${
                          tableInfo.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <h3 className="font-semibold text-lg mb-2">{tableName}</h3>
                        <div className="space-y-2">
                          <p>
                            <strong>状态:</strong>{' '}
                            <span className={tableInfo.exists ? 'text-green-600' : 'text-red-600'}>
                              {tableInfo.exists ? '✅ 存在' : '❌ 不存在'}
                            </span>
                          </p>
                          {tableInfo.exists && (
                            <p>
                              <strong>记录数:</strong> {tableInfo.count}
                            </p>
                          )}
                          {tableInfo.error && (
                            <p className="text-red-600 text-sm">
                              <strong>错误:</strong> {tableInfo.error}
                            </p>
                          )}
                          {tableInfo.exists && tableInfo.sample.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>示例数据:</strong>
                              </p>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(tableInfo.sample, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'schema' && schemaData && (
              <div>
                <h2 className="text-xl font-semibold mb-4">数据库表结构</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(schemaData.schema).map(([tableName, info]) => {
                    const schemaInfo = info as SchemaInfo;
                    return (
                      <div
                        key={tableName}
                        className={`border rounded-lg p-4 ${
                          schemaInfo.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <h3 className="font-semibold text-lg mb-2">{tableName}</h3>
                        <div className="space-y-2">
                          <p>
                            <strong>状态:</strong>{' '}
                            <span className={schemaInfo.exists ? 'text-green-600' : 'text-red-600'}>
                              {schemaInfo.exists ? '✅ 存在' : '❌ 不存在'}
                            </span>
                          </p>
                          {schemaInfo.error && (
                            <p className="text-red-600 text-sm">
                              <strong>错误:</strong> {schemaInfo.error}
                            </p>
                          )}
                          {schemaInfo.exists && schemaInfo.sample_data && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>示例数据:</strong>
                              </p>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(schemaInfo.sample_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'data' && dataInfo && (
              <div>
                <h2 className="text-xl font-semibold mb-4">数据库数据信息</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dataInfo.dataInfo).map(([tableName, info]) => {
                    const tableInfo = info as TableInfo;
                    return (
                      <div
                        key={tableName}
                        className={`border rounded-lg p-4 ${
                          tableInfo.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <h3 className="font-semibold text-lg mb-2">{tableName}</h3>
                        <div className="space-y-2">
                          <p>
                            <strong>状态:</strong>{' '}
                            <span className={tableInfo.exists ? 'text-green-600' : 'text-red-600'}>
                              {tableInfo.exists ? '✅ 存在' : '❌ 不存在'}
                            </span>
                          </p>
                          {tableInfo.exists && (
                            <p>
                              <strong>记录数:</strong> {tableInfo.count}
                            </p>
                          )}
                          {tableInfo.error && (
                            <p className="text-red-600 text-sm">
                              <strong>错误:</strong> {tableInfo.error}
                            </p>
                          )}
                          {tableInfo.exists && tableInfo.sample.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>示例数据:</strong>
                              </p>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(tableInfo.sample, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'businesses' && businessesData && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Businesses 表数据</h2>
                <div className="mb-4">
                  <p className="text-lg">
                    <strong>总记录数:</strong> {businessesData.count}
                  </p>
                  <p className="text-sm text-gray-600">
                    最后更新: {new Date(businessesData.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {businessesData.businesses.slice(0, 10).map((business: any, index: number) => (
                    <div key={business.id} className="border rounded-lg p-4 bg-white">
                      <h3 className="font-semibold text-lg mb-2">
                        {index + 1}. {business.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>ID:</strong> {business.id}</p>
                          <p><strong>描述:</strong> {business.description?.substring(0, 100)}...</p>
                          <p><strong>地址:</strong> {business.address}</p>
                          <p><strong>电话:</strong> {business.phone}</p>
                          <p><strong>邮箱:</strong> {business.email}</p>
                        </div>
                        <div>
                          <p><strong>网站:</strong> {business.website}</p>
                          <p><strong>营业时间:</strong> {business.hours}</p>
                          <p><strong>分类:</strong> {business.category}</p>
                          <p><strong>状态:</strong> {business.status}</p>
                          <p><strong>创建时间:</strong> {new Date(business.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          查看完整数据
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64 mt-2">
                          {JSON.stringify(business, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                  
                  {businessesData.businesses.length > 10 && (
                    <div className="text-center text-gray-600">
                      显示前 10 条记录，共 {businessesData.businesses.length} 条
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">数据库操作</h2>
          <div className="space-x-4">
            <button
              onClick={loadSchemaData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新表结构
            </button>
            <button
              onClick={loadDataInfo}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              刷新数据信息
            </button>
            <button
              onClick={loadBusinessesData}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              刷新 Businesses 数据
            </button>
            <button
              onClick={loadAllTablesData}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              刷新所有表数据
            </button>
          </div>
        </div>

        {/* 时间戳 */}
        {dataInfo && (
          <div className="mt-4 text-sm text-gray-500">
            最后更新: {new Date(dataInfo.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
