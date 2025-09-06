'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Briefcase } from 'lucide-react';

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

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-lg" style={{ color: darkTheme.text.secondary }}>
            Last updated: December 19, 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none" style={{ color: darkTheme.text.primary }}>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              1. Agreement to Terms
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              By accessing and using LifeX, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              2. Platform Services
            </h2>
            <p style={{ color: darkTheme.text.secondary }} className="mb-4">
              LifeX provides a platform connecting consumers with local businesses in New Zealand, offering:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Business discovery and recommendation services</li>
              <li>AI-powered life assistant</li>
              <li>Booking and review systems</li>
              <li>Business management tools for registered businesses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              <Users className="inline mr-2" size={24} />
              3. Personal Account Terms
            </h2>
            <h3 className="text-lg font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
              User Responsibilities
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Provide accurate and up-to-date information</li>
              <li>Use the platform in accordance with New Zealand laws</li>
              <li>Respect other users and businesses</li>
              <li>Not engage in fraudulent or harmful activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              <Briefcase className="inline mr-2" size={24} />
              4. Business Account Terms
            </h2>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-200 mb-2 flex items-center">
                <Shield className="mr-2" size={16} />
                Legal Compliance Requirements
              </h4>
              <p className="text-sm text-yellow-200">
                All business account holders must comply with New Zealand's Consumer Guarantees Act (CGA) and related legislation.
              </p>
            </div>

            <h3 className="text-lg font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
              Business Account Obligations
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li><strong>Service Quality:</strong> Provide services with reasonable skill and care</li>
              <li><strong>Fitness for Purpose:</strong> Ensure services are fit for their intended purpose</li>
              <li><strong>Timeliness:</strong> Complete services within a reasonable timeframe</li>
              <li><strong>Fair Pricing:</strong> Charge reasonable prices for services provided</li>
              <li><strong>Accurate Information:</strong> Provide truthful business information</li>
              <li><strong>Professional Conduct:</strong> Maintain professional standards in all interactions</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: darkTheme.text.primary }}>
              Business Listing Requirements
            </h3>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Business must be legally registered in New Zealand</li>
              <li>Must have appropriate licenses for your service category</li>
              <li>Insurance requirements may apply for certain services</li>
              <li>Regular verification of business status may be required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              5. Privacy and Data Protection
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              6. Limitation of Liability
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              LifeX acts as a platform connecting users with businesses. We are not responsible for the quality, safety, or legality of services provided by business owners listed on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              7. App Store Terms
            </h2>
            <p style={{ color: darkTheme.text.secondary }} className="mb-4">
              This app is distributed through the Apple App Store and Google Play Store. By downloading and using this app, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: darkTheme.text.secondary }}>
              <li>Comply with the respective app store terms of service</li>
              <li>Use the app only on devices you own or control</li>
              <li>Not attempt to reverse engineer or modify the app</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              8. Changes to Terms
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or via email. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              9. Contact Information
            </h2>
            <p style={{ color: darkTheme.text.secondary }}>
              For questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@lifex.co.nz
              <br />
              Website: https://www.lifex.co.nz
              <br />
              Address: Auckland, New Zealand
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}