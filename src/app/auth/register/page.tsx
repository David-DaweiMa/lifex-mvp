
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { darkTheme } from '../../../lib/theme';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistrationSuccess(false);

    // Client-side validation
    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Starting registration process...', {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name
      });

      const result = await register(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name
      });

      console.log('📋 Registration result:', result);

      if (result.success && result.user) {
        // 🎉 Registration successful
        console.log('✅ Registration successful!', result.user);
        
        // Clear any error messages
        setError('');
        setRegistrationSuccess(true);
        
        // Check if user needs email verification
        if (!result.user.email_verified) {
          console.log('📧 Email verification required, showing confirmation dialog');
          setShowEmailConfirmation(true);
        } else {
          console.log('✅ Email already verified, redirecting to home');
          router.push('/');
        }
      } else {
        // ❌ Registration failed
        console.error('❌ Registration failed:', result.error);
        setError(result.error || 'Registration failed, please try again');
        setRegistrationSuccess(false);
      }
    } catch (err) {
      console.error('💥 Exception during registration:', err);
      setError('An unexpected error occurred, please try again later');
      setRegistrationSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      console.log('🔄 Resending confirmation email...');
      
      // Here you can call the resend email API
      // const resendResult = await resendVerificationEmail(formData.email);
      
      // Temporary message display
      alert('Confirmation email has been resent, please check your inbox');
    } catch (error) {
      console.error('Failed to resend email:', error);
      alert('Failed to resend email, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
      <div className="w-full max-w-md px-6 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: darkTheme.text.muted }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
            Create Account
          </h1>
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Join LifeX and discover amazing local services
          </p>
        </div>

        {/* Success Message */}
        {registrationSuccess && !showEmailConfirmation && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            borderLeft: `4px solid #22c55e` 
          }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            <div>
              <p className="font-medium" style={{ color: '#22c55e' }}>Registration Successful!</p>
              <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                Your account has been created, please check your email to complete verification
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Username <span className="text-xs opacity-60">(Optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Create password (at least 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-50"
                style={{ color: darkTheme.text.muted }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-50"
                style={{ color: darkTheme.text.muted }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm border-l-4" style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444',
              borderLeftColor: '#ef4444'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ 
              background: loading ? darkTheme.background.secondary : darkTheme.neon.purple, 
              color: 'white' 
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Already have an account?{' '}
            <Link 
              href="/auth/login"
              className="font-medium transition-colors hover:underline"
              style={{ color: darkTheme.neon.purple }}
            >
              Sign in now
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: darkTheme.text.muted }}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:opacity-80">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:opacity-80">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Registration Successful!
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-600 mb-6">
                We have sent a confirmation email to <strong className="text-gray-900">{formData.email}</strong>.
                <br />
                Please click the link in the email to activate your account.
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowEmailConfirmation(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Got it
                </button>
                
                <button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend Email'}
                </button>
                
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full text-gray-500 py-2 px-4 rounded-md hover:text-gray-700 transition-colors"
                >
                  Back to Login
                </button>
              </div>
              
              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-4">
                Didn't receive the email? Please check your spam folder, or click the button above to resend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}