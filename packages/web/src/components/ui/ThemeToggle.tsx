'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  showSystemOption?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ThemeToggle({ 
  showLabel = true, 
  showSystemOption = true, 
  size = 'md',
  className = '' 
}: ThemeToggleProps) {
  const { theme, themeMode, setThemeMode, isSystemTheme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setShowPreview(false);
  };

  const handlePreview = (previewMode: 'light' | 'dark') => {
    setPreviewTheme(previewMode);
    setShowPreview(true);
    
    // 临时应用预览主题
    const root = document.documentElement;
    if (previewMode === 'light') {
      root.style.setProperty('--theme-bg-primary', '#FFFFFF');
      root.style.setProperty('--theme-bg-secondary', '#F8F7FF');
      root.style.setProperty('--theme-bg-card', '#FFFFFF');
      root.style.setProperty('--theme-text-primary', '#1A1625');
      root.style.setProperty('--theme-text-secondary', '#10B981');
      root.style.setProperty('--theme-text-muted', '#6B7280');
      root.style.setProperty('--theme-border', '#E5E7EB');
    } else {
      root.style.setProperty('--theme-bg-primary', '#0a0a0a');
      root.style.setProperty('--theme-bg-secondary', '#1A1625');
      root.style.setProperty('--theme-bg-card', '#1A1625');
      root.style.setProperty('--theme-text-primary', '#FFFFFF');
      root.style.setProperty('--theme-text-secondary', '#22C55E');
      root.style.setProperty('--theme-text-muted', '#805AD5');
      root.style.setProperty('--theme-border', '#374151');
    }
  };

  const handlePreviewEnd = () => {
    setShowPreview(false);
    // 恢复当前主题
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--theme-bg-primary', '#FFFFFF');
      root.style.setProperty('--theme-bg-secondary', '#F8F7FF');
      root.style.setProperty('--theme-bg-card', '#FFFFFF');
      root.style.setProperty('--theme-text-primary', '#1A1625');
      root.style.setProperty('--theme-text-secondary', '#10B981');
      root.style.setProperty('--theme-text-muted', '#6B7280');
      root.style.setProperty('--theme-border', '#E5E7EB');
    } else {
      root.style.setProperty('--theme-bg-primary', '#0a0a0a');
      root.style.setProperty('--theme-bg-secondary', '#1A1625');
      root.style.setProperty('--theme-bg-card', '#1A1625');
      root.style.setProperty('--theme-text-primary', '#FFFFFF');
      root.style.setProperty('--theme-text-secondary', '#22C55E');
      root.style.setProperty('--theme-text-muted', '#805AD5');
      root.style.setProperty('--theme-border', '#374151');
    }
  };

  const getThemeIcon = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '🌙';
    }
  };

  const getThemeLabel = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light':
        return '浅色';
      case 'dark':
        return '深色';
      case 'system':
        return '跟随系统';
      default:
        return '深色';
    }
  };

  return (
    <div className={`theme-toggle ${className}`}>
      {showLabel && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold theme-text-primary mb-2">主题设置</h3>
          <p className="text-sm theme-text-muted">
            当前主题：{getThemeLabel(themeMode)}
            {isSystemTheme && ` (${theme === 'light' ? '浅色' : '深色'})`}
          </p>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {/* 浅色主题 */}
        <div className="flex items-center justify-between p-3 rounded-lg theme-bg-card theme-border border">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">☀️</span>
            <div>
              <div className="font-medium theme-text-primary">浅色主题</div>
              <div className="text-sm theme-text-muted">明亮清爽的界面</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onMouseEnter={() => handlePreview('light')}
              onMouseLeave={handlePreviewEnd}
              onClick={() => handleThemeChange('light')}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                themeMode === 'light' 
                  ? 'bg-purple-500 text-white' 
                  : 'theme-bg-secondary theme-text-primary hover:theme-bg-card'
              }`}
            >
              预览
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
                themeMode === 'light'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'theme-bg-secondary theme-text-primary hover:theme-bg-card'
              }`}
            >
              {themeMode === 'light' ? '✓' : '○'}
            </button>
          </div>
        </div>

        {/* 深色主题 */}
        <div className="flex items-center justify-between p-3 rounded-lg theme-bg-card theme-border border">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌙</span>
            <div>
              <div className="font-medium theme-text-primary">深色主题</div>
              <div className="text-sm theme-text-muted">护眼舒适的界面</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onMouseEnter={() => handlePreview('dark')}
              onMouseLeave={handlePreviewEnd}
              onClick={() => handleThemeChange('dark')}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                themeMode === 'dark' 
                  ? 'bg-purple-500 text-white' 
                  : 'theme-bg-secondary theme-text-primary hover:theme-bg-card'
              }`}
            >
              预览
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
                themeMode === 'dark'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'theme-bg-secondary theme-text-primary hover:theme-bg-card'
              }`}
            >
              {themeMode === 'dark' ? '✓' : '○'}
            </button>
          </div>
        </div>

        {/* 系统主题 */}
        {showSystemOption && (
          <div className="flex items-center justify-between p-3 rounded-lg theme-bg-card theme-border border">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💻</span>
              <div>
                <div className="font-medium theme-text-primary">跟随系统</div>
                <div className="text-sm theme-text-muted">自动匹配系统主题</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeChange('system')}
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
                  themeMode === 'system'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'theme-bg-secondary theme-text-primary hover:theme-bg-card'
                }`}
              >
                {themeMode === 'system' ? '✓' : '○'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPreview && (
        <div className="mt-3 p-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm">
          🎨 正在预览 {previewTheme === 'light' ? '浅色' : '深色'} 主题
        </div>
      )}
    </div>
  );
}
