'use client';

import { Suspense } from 'react';
import { darkTheme } from '../../../lib/theme';
import AuthCallbackContent from './AuthCallbackContent';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div 
          className="p-8 rounded-lg shadow-lg max-w-md w-full"
          style={{ 
            background: darkTheme.background.card,
            borderColor: darkTheme.background.glass 
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: darkTheme.neon.purple }}></div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>邮箱验证</h1>
            <p style={{ color: darkTheme.text.secondary }}>加载中...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}