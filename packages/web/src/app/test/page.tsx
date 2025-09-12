// 测试页面索引
"use client";

import React from 'react';
import Link from 'next/link';
import { Database, Users, TrendingUp, Settings, ArrowRight } from 'lucide-react';

const TestPage: React.FC = () => {
  const testPages = [
    {
      title: 'Database Migration Test',
      description: 'Test database migration results and verify new fields',
      href: '/test/migration',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      title: 'Test Users',
      description: 'View and verify test user data with profiles',
      href: '/test/users',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Generate Test Data',
      description: 'Generate trending posts and user interaction data',
      href: '/test/generate-data',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Pages</h1>
          <p className="text-gray-600">Test and verify different aspects of the application</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testPages.map((page, index) => {
            const Icon = page.icon;
            return (
              <Link
                key={index}
                href={page.href}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${page.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-gray-600 text-sm">
                  {page.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Database</span>
              </div>
              <p className="text-sm text-green-700">Migration completed</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Test Users</span>
              </div>
              <p className="text-sm text-green-700">5 users created</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Frontend</span>
              </div>
              <p className="text-sm text-blue-700">Ready for testing</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

