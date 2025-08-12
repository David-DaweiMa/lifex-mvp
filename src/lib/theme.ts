// src/lib/theme.ts
export const darkTheme = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    card: 'rgba(26, 26, 26, 0.8)',
    glass: 'rgba(255, 255, 255, 0.05)',
  },
  neon: {
    purple: '#a855f7',
    green: '#10b981',
    cyan: '#06b6d4',
    pink: '#ec4899',
    yellow: '#f59e0b',
    blue: '#3b82f6',
    red: '#ef4444',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
    secondary: 'linear-gradient(135deg, #10b981, #06b6d4)',
    accent: 'linear-gradient(135deg, #f59e0b, #ec4899)',
    background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #111)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a',
    neon: '#a855f7',
  }
};

// 响应式断点
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
};

// 修复响应式容器样式 - 移除 @media 查询
export const getResponsiveContainer = () => ({
  width: '100%',
  maxWidth: 'min(430px, 100vw)', // 默认移动端尺寸
  margin: '0 auto',
  minHeight: '100vh',
});

// 单独的响应式样式（用于 CSS-in-JS 或 Tailwind）
export const responsiveStyles = {
  mobile: {
    maxWidth: '430px',
  },
  tablet: {
    maxWidth: '600px',
  },
  desktop: {
    maxWidth: '800px',
  }
};