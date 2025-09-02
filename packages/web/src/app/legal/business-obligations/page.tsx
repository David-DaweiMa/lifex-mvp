'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

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

export default function BusinessObligationsPage() {
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
            Business Account Legal Obligations
          </h1>
          <p className="text-lg" style={{ color: darkTheme.text.secondary }}>
            Understanding your responsibilities under New Zealand law
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-200 mb-2">Important Legal Notice</h3>
              <p className="text-sm text-yellow-200">
                This guide provides general information about legal obligations for businesses in New Zealand. 
                It is not legal advice. Please consult with a qualified legal professional for specific advice about your business.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{ color: darkTheme.neon.purple }}>
              <Scale className="mr-2" size={24} />
              Consumer Guarantees Act (CGA)
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg" style={{ background: darkTheme.secondary }}>
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: darkTheme.text.primary }}>
                  <CheckCircle className="mr-2 text-green-500" size={16} />
                  Service Standards
                </h3>
                <ul className="text-sm space-y-2" style={{ color: darkTheme.text.secondary }}>
                  <li>• Services must be provided with reasonable skill and care</li>
                  <li>• Services must be fit for their intended purpose</li>
                  <li>• Services must be completed within a reasonable time</li>
                  <li>• Charges must be reasonable</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg" style={{ background: darkTheme.secondary }}>
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: darkTheme.text.primary }}>
                  <Shield className="mr-2 text-blue-500" size={16} />
                  Consumer Rights
                </h3>
                <ul className="text-sm space-y-2" style={{ color: darkTheme.text.secondary }}>
                  <li>• Right to remedy for substandard services</li>
                  <li>• Right to compensation for damages</li>
                  <li>• Right to cancel contracts in certain circumstances</li>
                  <li>• Right to clear information about services</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              Service Category Specific Requirements
            </h2>
            
            <div className="grid gap-4">
              <div className="p-4 rounded-lg border" style={{ background: darkTheme.secondary, borderColor: `${darkTheme.neon.purple}30` }}>
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  🍽️ Restaurant & Dining
                </h3>
                <ul className="text-sm space-y-1" style={{ color: darkTheme.text.secondary }}>
                  <li>• Food safety and hygiene regulations</li>
                  <li>• Liquor licensing (if applicable)</li>
                  <li>• Menu accuracy and pricing transparency</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: darkTheme.secondary, borderColor: `${darkTheme.neon.purple}30` }}>
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  💄 Beauty & Wellness
                </h3>
                <ul className="text-sm space-y-1" style={{ color: darkTheme.text.secondary }}>
                  <li>• Health and safety protocols</li>
                  <li>• Professional certification requirements</li>
                  <li>• Product safety and allergies disclosure</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: darkTheme.secondary, borderColor: `${darkTheme.neon.purple}30` }}>
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  🔧 Home & Repair Services
                </h3>
                <ul className="text-sm space-y-1" style={{ color: darkTheme.text.secondary }}>
                  <li>• Trade licensing and certifications</li>
                  <li>• Insurance and liability coverage</li>
                  <li>• Building code compliance</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: darkTheme.neon.purple }}>
              Resources and Support
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg" style={{ background: darkTheme.secondary }}>
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Government Resources
                </h3>
                <ul className="text-sm space-y-1" style={{ color: darkTheme.text.secondary }}>
                  <li>• Commerce Commission</li>
                  <li>• Ministry of Business, Innovation and Employment</li>
                  <li>• New Zealand Companies Office</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg" style={{ background: darkTheme.secondary }}>
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  LifeX Support
                </h3>
                <ul className="text-sm space-y-1" style={{ color: darkTheme.text.secondary }}>
                  <li>• Business setup guidance</li>
                  <li>• Platform training and support</li>
                  <li>• Email: business@lifex.co.nz</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}