'use client';

import React from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function ThemeDemo() {
  const { theme, themeMode, isSystemTheme } = useTheme();

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 theme-text-primary">
            LifeX 主题系统演示
          </h1>
          <p className="text-lg theme-text-secondary mb-2">
            当前主题：{theme === 'light' ? '浅色' : '深色'}
          </p>
          <p className="text-sm theme-text-muted">
            主题模式：{themeMode === 'system' ? '跟随系统' : themeMode === 'light' ? '浅色' : '深色'}
            {isSystemTheme && ' (自动检测)'}
          </p>
        </div>

        {/* 主题切换组件 */}
        <div className="mb-8">
          <ThemeToggle showLabel={true} showSystemOption={true} />
        </div>

        {/* 颜色展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 背景色展示 */}
          <div className="card theme-shadow">
            <h3 className="text-lg font-semibold mb-4 theme-text-primary">背景色</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg theme-bg-primary border theme-border">
                <span className="text-sm theme-text-primary">主背景</span>
              </div>
              <div className="p-3 rounded-lg theme-bg-secondary border theme-border">
                <span className="text-sm theme-text-primary">次背景</span>
              </div>
              <div className="p-3 rounded-lg theme-bg-card border theme-border">
                <span className="text-sm theme-text-primary">卡片背景</span>
              </div>
            </div>
          </div>

          {/* 文字色展示 */}
          <div className="card theme-shadow">
            <h3 className="text-lg font-semibold mb-4 theme-text-primary">文字色</h3>
            <div className="space-y-3">
              <p className="theme-text-primary">主要文字</p>
              <p className="theme-text-secondary">次要文字</p>
              <p className="theme-text-muted">静音文字</p>
            </div>
          </div>

          {/* 品牌色展示 */}
          <div className="card theme-shadow">
            <h3 className="text-lg font-semibold mb-4 theme-text-primary">品牌色</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ background: '#8B5CF6', color: 'white' }}>
                <span className="text-sm">紫色主色</span>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#10B981', color: 'white' }}>
                <span className="text-sm">绿色辅助</span>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#EC4899', color: 'white' }}>
                <span className="text-sm">粉色强调</span>
              </div>
            </div>
          </div>
        </div>

        {/* 组件展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 按钮展示 */}
          <div className="card theme-shadow">
            <h3 className="text-lg font-semibold mb-4 theme-text-primary">按钮样式</h3>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                主要按钮
              </button>
              <button className="w-full py-2 px-4 rounded-lg border theme-border theme-bg-card theme-text-primary hover:theme-bg-secondary transition-all">
                次要按钮
              </button>
              <button className="w-full py-2 px-4 rounded-lg theme-bg-secondary theme-text-primary hover:theme-bg-card transition-all">
                文本按钮
              </button>
            </div>
          </div>

          {/* 表单展示 */}
          <div className="card theme-shadow">
            <h3 className="text-lg font-semibold mb-4 theme-text-primary">表单元素</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="输入框示例"
                className="w-full p-3 rounded-lg border theme-border theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select className="w-full p-3 rounded-lg border theme-border theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>选择选项</option>
                <option>选项 1</option>
                <option>选项 2</option>
              </select>
              <textarea
                placeholder="文本域示例"
                rows={3}
                className="w-full p-3 rounded-lg border theme-border theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 渐变展示 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 theme-text-primary">渐变效果</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-6 rounded-xl text-white text-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #B794F6 100%)' }}
            >
              主渐变
            </div>
            <div 
              className="p-6 rounded-xl text-white text-center"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              强调渐变
            </div>
            <div 
              className="p-6 rounded-xl text-white text-center"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #8B5CF6 100%)' }}
            >
              绿色渐变
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
