// src/lib/theme.ts - Simplified version
export const darkTheme = {
  // Background colors - Deep purple theme
  background: {
    primary: '#0a0a0a',        // black
    secondary: '#1A1625',      // Dark purple
    card: '#1A1625',           // Card background
    glass: '#8B5CF620',        // Glass effect with purple tint
    overlay: '#0F0B1ACC',      // Modal overlay
    white: '#FFFFFF',
    light: '#F8F7FF'           // Very light purple
  },

  // Text colors
  text: {
    primary: '#FFFFFF',        // Primary white text
    secondary: '#22C55E',      // Bright green for secondary text (Kiwi theme)
    muted: '#805AD5',          // Medium purple for muted text
    dark: '#1A1625',           // Dark text for light backgrounds
    inverse: '#0F0B1A',        // Inverse text color
    icon: '#FFFFFF'            // Default icon color (white)
  },

  // Purple color palette
  purple: {
    50: '#FAF5FF',
    100: '#E9D8FD',
    200: '#D6BCFA',
    300: '#B794F6',
    400: '#9F7AEA',
    500: '#8B5CF6',            // Main brand purple
    600: '#7C3AED',
    700: '#6B46C1',
    800: '#553C9A',
    900: '#44337A'
  },

  // Accent colors
  accent: {
    green: '#10B981',          // Success/positive actions
    blue: '#3B82F6',           // Info/business actions
    orange: '#F59E0B',         // Warning/trending
    pink: '#EC4899',           // Social/creative actions
    red: '#EF4444',            // Error/destructive actions
    yellow: '#F59E0B'          // Ratings/highlights
  },

  // Neon colors (for backward compatibility)
  neon: {
    purple: '#A855F7',         // 亮紫色主题
    green: '#10B981',
    blue: '#3B82F6',
    pink: '#EC4899',
    yellow: '#F59E0B',         // Add missing yellow
    red: '#EF4444',            // Add missing red
    cyan: '#06B6D4'            // Add missing cyan
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    secondary: 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
    accent: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
    dark: 'linear-gradient(135deg, #1A1625 0%, #0F0B1A 100%)',
    background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #111)'  // 使用之前的背景渐变
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(139, 92, 246, 0.05)',
    md: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
    lg: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
    xl: '0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 10px 10px -5px rgba(139, 92, 246, 0.04)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)'
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
} as const;

// Light theme - 基于深色主题调整，紫色主色调搭配绿色
export const lightTheme = {
  // Background colors - 浅色主题
  background: {
    primary: '#FFFFFF',        // 纯白背景
    secondary: '#F8F7FF',      // 极浅紫色背景
    card: '#FFFFFF',           // 卡片背景
    glass: '#8B5CF610',        // 玻璃效果，浅紫色调
    overlay: '#0000004D',      // 模态框遮罩
    white: '#FFFFFF',
    light: '#F8F7FF',          // 浅色背景
    dark: '#0F0B1A'            // 深色元素（用于对比）
  },

  // Text colors - 浅色主题文字
  text: {
    primary: '#1A1625',        // 深色主文字
    secondary: '#10B981',      // 绿色次要文字（与深色主题保持一致）
    muted: '#6B7280',          // 灰色静音文字
    dark: '#1A1625',           // 深色文字
    inverse: '#FFFFFF',        // 反色文字（用于深色按钮等）
    icon: '#6B7280'            // 图标颜色
  },

  // Purple color palette - 保持与深色主题一致
  purple: {
    50: '#FAF5FF',
    100: '#E9D8FD',
    200: '#D6BCFA',
    300: '#B794F6',
    400: '#9F7AEA',
    500: '#8B5CF6',            // 主品牌紫色
    600: '#7C3AED',
    700: '#6B46C1',
    800: '#553C9A',
    900: '#44337A'
  },

  // Accent colors - 保持与深色主题一致
  accent: {
    green: '#10B981',          // 成功/积极操作
    blue: '#3B82F6',           // 信息/商业操作
    orange: '#F59E0B',         // 警告/趋势
    pink: '#EC4899',           // 社交/创意操作
    red: '#EF4444',            // 错误/破坏性操作
    yellow: '#F59E0B'          // 评分/高亮
  },

  // Neon colors - 保持与深色主题一致
  neon: {
    purple: '#A855F7',         // 亮紫色主题
    green: '#10B981',
    blue: '#3B82F6',
    pink: '#EC4899',
    yellow: '#F59E0B',
    red: '#EF4444',
    cyan: '#06B6D4'
  },

  // Gradients - 浅色主题渐变
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #B794F6 100%)',
    secondary: 'linear-gradient(135deg, #FAF5FF 0%, #E9D8FD 100%)',
    accent: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    dark: 'linear-gradient(135deg, #1A1625 0%, #0F0B1A 100%)',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc, #f1f5f9)'  // 浅色背景渐变
  },

  // Shadows - 浅色主题阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(139, 92, 246, 0.2)'  // 浅色主题的发光效果
  },

  // Border radius - 保持与深色主题一致
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },

  // Transitions - 保持与深色主题一致
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
} as const;

// 添加缺失的 getResponsiveContainer 函数
export const getResponsiveContainer = () => ({
  width: '100%',
  maxWidth: 'min(430px, 100vw)',
  margin: '0 auto',
  minHeight: '100vh',
});

// Export theme type for TypeScript
export type Theme = typeof darkTheme;

export default darkTheme;