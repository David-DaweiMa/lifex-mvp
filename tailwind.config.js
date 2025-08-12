/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题颜色
        lifex: {
          purple: '#a855f7',
          green: '#10b981',
          cyan: '#06b6d4',
          pink: '#ec4899',
          yellow: '#f59e0b',
          blue: '#3b82f6',
          red: '#ef4444',
        },
        // 背景颜色
        dark: {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          card: 'rgba(26, 26, 26, 0.8)',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        // 文本颜色
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7, #ec4899)',
        'gradient-secondary': 'linear-gradient(135deg, #10b981, #06b6d4)',
        'gradient-background': 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #111)',
      },
      screens: {
        'xs': '475px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
    },
  },
  plugins: [],
  // 确保生产环境不会清除样式
  safelist: [
    // 背景颜色
    'bg-lifex-purple',
    'bg-lifex-green',
    'bg-lifex-cyan',
    'bg-lifex-pink',
    'bg-lifex-yellow',
    'bg-lifex-blue',
    'bg-lifex-red',
    'bg-dark-primary',
    'bg-dark-secondary',
    'bg-dark-card',
    'bg-gradient-primary',
    'bg-gradient-secondary',
    'bg-gradient-background',
    
    // 文本颜色
    'text-text-primary',
    'text-text-secondary', 
    'text-text-muted',
    'text-lifex-purple',
    'text-lifex-green',
    'text-lifex-cyan',
    'text-lifex-pink',
    'text-lifex-yellow',
    'text-lifex-blue',
    'text-lifex-red',
    
    // 边框颜色
    'border-dark-glass',
    'border-lifex-purple',
    'border-lifex-green',
    'border-lifex-cyan',
    'border-lifex-pink',
    'border-lifex-yellow',
    'border-lifex-blue',
    'border-lifex-red',
    
    // 悬停状态
    'hover:bg-lifex-purple',
    'hover:bg-lifex-green',
    'hover:bg-lifex-cyan',
    'hover:bg-lifex-pink',
    'hover:bg-lifex-yellow',
    'hover:bg-lifex-blue',
    'hover:bg-lifex-red',
    'hover:text-lifex-purple',
    'hover:text-lifex-green',
    'hover:text-lifex-cyan',
    'hover:text-lifex-pink',
    'hover:text-lifex-yellow',
    'hover:text-lifex-blue',
    'hover:text-lifex-red',
    
    // 响应式类
    'xs:',
    'tablet:',
    'laptop:',
    'desktop:',
  ]
}