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
  
  // Responsive breakpoints
  export const breakpoints = {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  };
  
  // Responsive container styles
  export const getResponsiveContainer = () => ({
    width: '100%',
    maxWidth: 'min(430px, 100vw)', // Mobile-first with max width
    margin: '0 auto',
    minHeight: '100vh',
    '@media (min-width: 768px)': {
      maxWidth: '600px', // Tablet
    },
    '@media (min-width: 1024px)': {
      maxWidth: '800px', // Desktop
    }
  });