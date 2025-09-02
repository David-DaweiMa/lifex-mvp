'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            isSuccess 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {isSuccess ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-4 ${
            isSuccess ? 'text-green-800' : 'text-red-800'
          }`}>
            {isSuccess ? '🎉 Confirmation Successful' : '❌ Confirmation Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-700 mb-8 leading-relaxed">
            {message || (isSuccess ? 'Your email has been successfully confirmed!' : 'An error occurred during confirmation.')}
          </p>

          {/* Success additional information */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-800 mb-2">What you can do next:</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Sign in to your LifeX account</li>
                <li>• Start using AI intelligent recommendation features</li>
                <li>• Explore quality local businesses in New Zealand</li>
                <li>• Share your local life experiences</li>
              </ul>
            </div>
          )}

          {/* Failure help information */}
          {!isSuccess && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-red-800 mb-2">Possible reasons:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Confirmation link has expired (24-hour validity)</li>
                <li>• Confirmation link has already been used</li>
                <li>• Incorrect link format</li>
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {isSuccess ? (
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
              >
                Start Using LifeX
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = '/auth/register'}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Register Again
                </button>
                <button
                  onClick={() => window.location.href = '/auth/resend-confirmation'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Resend Confirmation Email
                </button>
              </>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-500 hover:text-gray-700 transition-all py-2"
            >
              Back to Home
            </button>
          </div>

          {/* Bottom information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you continue to experience issues, please contact our support team:
              <br />
              <a href="mailto:support@lifex.co.nz" className="text-orange-600 hover:underline">
                support@lifex.co.nz
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmResultContent />
    </Suspense>
  );
}