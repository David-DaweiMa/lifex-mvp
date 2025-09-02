// src/app/business/layout.tsx
import React from 'react';
// import { AuthProvider } from '@/components/AuthProvider'; // Uncomment when integrating

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthProvider> {/* Uncomment when integrating */}
      <div className="business-layout">
        {children}
      </div>
    // </AuthProvider> {/* Uncomment when integrating */}
  );
}

// Optional: Add metadata for the business section
export const metadata = {
  title: 'Business Dashboard - LifeX',
  description: 'Manage your business profile, services, and customer interactions on LifeX platform',
};