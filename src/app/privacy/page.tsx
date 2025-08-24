'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Cookie } from 'lucide-react';

const darkTheme = {
  primary: '#0a0a0a',
  secondary: '#1a1a1a',
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a'
  },
  neon: {
    purple: '#a855f7'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: darkTheme.primary }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/auth/register"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:text-purple-400"
          style={{ color: darkTheme.text.muted }}
        >
          <ArrowLeft size={16} />
          Back to Registration
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
            Privacy Policy
          </h1>
          <p className="text-lg" style={{ color: darkTheme.text.secondary }}>
            Last updated: August 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{ color: darkTheme.neon.purple }}>
              <Database className="mr-2" size={24} />
              1. Information We Collect
            </h2>
            
            <h3 className="text-lg font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
              Personal Information
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Name, email address, and contact information</li>
              <li>Account preferences and settings</li>
              <li>Location data (with your permission)</li>
              <li>Communication history and support interactions</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: darkTheme.text.primary }}>
              Business Information (Business Owners)
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Business name, category, and description</li>
              <li>Business contact information and hours</li>
              <li>Service offerings and pricing</li>
              <li>Business registration and verification documents</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: darkTheme.text.primary }}>
              Usage Information
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>App usage patterns and preferences</li>
              <li>Search queries and interactions</li>
              <li>Device information and IP address</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{ color: darkTheme.neon.purple }}>
              <Eye className="mr-2" size={24} />
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Provide and improve our platform services</li>
              <li>Connect users with relevant local businesses</li>
              <li>Process bookings and transactions</li>
              <li>Send important account and service updates</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              3. Information Sharing
            </h2>
            <p style={{ color: darkTheme.text.secondary }} className="mb-4">
              We do not sell your personal information. We may share information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>With business account holders when you make bookings or inquiries</li>
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{ color: darkTheme.neon.purple }}>
              <Cookie className="mr-2" size={24} />
              4. Cookies and Tracking
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{ color: darkTheme.neon.purple }}>
              <Shield className="mr-2" size={24} />
              5. Data Security
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              6. Your Rights
            </h2>
            <p style={{ color: darkTheme.text.secondary }} className="mb-4">
              Under New Zealand privacy laws, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to certain uses of your information</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              7. Contact Us
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              For privacy-related questions or to exercise your rights, contact us at:
              <br />
              Email: privacy@lifex.co.nz
              <br />
              Address: Auckland, New Zealand
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}