'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { darkTheme } from '../../../lib/theme';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        router.push('/'); // Redirect to home page
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
          style={{ color: darkTheme.text.muted }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Sign in to your LifeX account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.primary }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary,
                  '--tw-ring-color': darkTheme.neon.purple,
                } as React.CSSProperties}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: darkTheme.text.muted }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link 
              href="/auth/forgot-password"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: darkTheme.neon.purple }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: loading ? darkTheme.background.secondary : darkTheme.neon.purple, 
              color: 'white' 
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Don't have an account?{' '}
            <Link 
              href="/auth/register"
              className="font-medium transition-colors hover:underline"
              style={{ color: darkTheme.neon.purple }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Account */}
        <div className="mt-6 p-4 rounded-lg border" style={{ 
          background: `${darkTheme.neon.purple}10`, 
          borderColor: `${darkTheme.neon.purple}30` 
        }}>
          <p className="text-xs text-center" style={{ color: darkTheme.text.secondary }}>
            <strong>Demo Account:</strong><br />
            Email: demo@lifex.com<br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
}
