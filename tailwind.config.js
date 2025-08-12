/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
}