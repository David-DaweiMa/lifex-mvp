'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // 获取系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  // 从localStorage加载用户设置
  useEffect(() => {
    const savedThemeMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
      setThemeModeState(savedThemeMode);
    }
  }, []);

  // 计算当前实际主题
  const theme = themeMode === 'system' ? systemTheme : themeMode;
  const isSystem = themeMode === 'system';

  // 更新主题模式
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setIsSystemTheme(mode === 'system');
    localStorage.setItem('theme-mode', mode);
    
    // 更新HTML类名和CSS变量
    updateThemeStyles(mode === 'system' ? systemTheme : mode);
  };

  // 切换主题
  const toggleTheme = () => {
    const newMode = theme === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // 更新主题样式
  const updateThemeStyles = (currentTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    
    // 更新CSS变量
    if (currentTheme === 'light') {
      root.style.setProperty('--theme-bg-primary', '#FFFFFF');
      root.style.setProperty('--theme-bg-secondary', '#F8F7FF');
      root.style.setProperty('--theme-bg-card', '#FFFFFF');
      root.style.setProperty('--theme-bg-glass', '#8B5CF610');
      root.style.setProperty('--theme-bg-overlay', '#0000004D');
      root.style.setProperty('--theme-text-primary', '#1A1625');
      root.style.setProperty('--theme-text-secondary', '#6B46C1');
      root.style.setProperty('--theme-text-muted', '#805AD5');
      root.style.setProperty('--theme-text-inverse', '#FFFFFF');
      root.style.setProperty('--theme-border', '#E5E7EB');
      root.style.setProperty('--theme-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    } else {
      root.style.setProperty('--theme-bg-primary', '#0a0a0a');
      root.style.setProperty('--theme-bg-secondary', '#1A1625');
      root.style.setProperty('--theme-bg-card', '#1A1625');
      root.style.setProperty('--theme-bg-glass', '#8B5CF620');
      root.style.setProperty('--theme-bg-overlay', '#0F0B1ACC');
      root.style.setProperty('--theme-text-primary', '#FFFFFF');
      root.style.setProperty('--theme-text-secondary', '#22C55E');
      root.style.setProperty('--theme-text-muted', '#805AD5');
      root.style.setProperty('--theme-text-inverse', '#0F0B1A');
      root.style.setProperty('--theme-border', '#374151');
      root.style.setProperty('--theme-shadow', '0 4px 6px -1px rgba(139, 92, 246, 0.1)');
    }
  };

  // 当主题变化时更新样式
  useEffect(() => {
    updateThemeStyles(theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isSystemTheme: isSystem,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
