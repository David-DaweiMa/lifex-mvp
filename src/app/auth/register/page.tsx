'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Zap, Crown, Star } from 'lucide-react';

const darkTheme = {
  primary: '#0a0a0a',
  secondary: '#1a1a1a', 
  card: '#1f1f1f',
  glass: '#ffffff20',
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a'
  },
  neon: {
    purple: '#a855f7',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316'
  }
};

interface SubscriptionTier {
  id: 'free' | 'essential' | 'premium';
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  color: string;
  popular?: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    title: 'Free',
    subtitle: 'Perfect for getting started',
    price: 'Free',
    features: [
      'Access to local services',
      'Basic product publishing (100 items)',
      'Community features',
      'Email support'
    ],
    color: darkTheme.neon.green
  },
  {
    id: 'essential',
    title: 'Essential',
    subtitle: 'Enhanced personal experience',
    price: '$9.99/month',
    features: [
      'Everything in Free',
      'Coly AI personal assistant (50 calls/hour)',
      'Enhanced product publishing (100 items)',
      'Trending features (50/month)',
      'Business features enabled',
      'Priority support'
    ],
    color: darkTheme.neon.blue,
    popular: true
  },
  {
    id: 'premium',
    title: 'Premium',
    subtitle: 'Complete business solution',
    price: '$29.99/month',
    features: [
      'Everything in Essential',
      'Max AI business assistant (50 calls/hour)',
      'Unlimited product publishing (1000 items)',
      'Advanced trending features (200/month)',
      'Advanced business analytics',
      'Marketing tools',
      'CRM features',
      '24/7 priority support'
    ],
    color: darkTheme.neon.purple
  }
];

const LifeXRegisterRedesign = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTermsClick = () => {
    window.open('/terms', '_blank');
  };

  const handlePrivacyClick = () => {
    window.open('/privacy', '_blank');
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.full_name) {
      return 'Please fill in all required fields';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (!acceptedTerms) {
      return 'Please accept the Terms of Service';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name,
        subscription_level: 'free' // Default to free
      };

      console.log('Sending registration request:', registrationData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('Registration successful:', result);
      setSuccess(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tier: 'free' | 'essential' | 'premium') => {
    // TODO: Implement upgrade logic
    console.log('Upgrade to:', tier);
    // This would typically redirect to a payment page or subscription management
    alert(`Upgrade to ${tier} plan - Payment integration coming soon!`);
  };

  const handleContinueFree = () => {
    setShowWelcome(false);
    // Redirect to dashboard or main app
    window.location.href = '/dashboard';
  };

  const renderRegistrationForm = () => (
    <div className="space-y-4">
      <button
        onClick={() => window.location.href = '/'}
        className="inline-flex items-center text-sm mb-4 transition-colors hover:text-purple-400"
        style={{ color: darkTheme.text.muted }}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
          Create Your Account
        </h2>
        <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
          Join LifeX and start exploring local services. Start free, upgrade anytime.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  size={16} style={{ color: darkTheme.text.muted }} />
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                background: darkTheme.secondary,
                borderColor: `${darkTheme.neon.purple}30`,
                color: darkTheme.text.primary
              }}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: darkTheme.secondary,
              borderColor: `${darkTheme.neon.purple}30`,
              color: darkTheme.text.primary
            }}
            placeholder="Enter username (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  size={16} style={{ color: darkTheme.text.muted }} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                background: darkTheme.secondary,
                borderColor: `${darkTheme.neon.purple}30`,
                color: darkTheme.text.primary
              }}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                    size={16} style={{ color: darkTheme.text.muted }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{
                  background: darkTheme.secondary,
                  borderColor: `${darkTheme.neon.purple}30`,
                  color: darkTheme.text.primary
                }}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-purple-400"
              >
                {showPassword ? 
                  <EyeOff size={16} style={{ color: darkTheme.text.muted }} /> : 
                  <Eye size={16} style={{ color: darkTheme.text.muted }} />
                }
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
              Confirm *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                    size={16} style={{ color: darkTheme.text.muted }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{
                  background: darkTheme.secondary,
                  borderColor: `${darkTheme.neon.purple}30`,
                  color: darkTheme.text.primary
                }}
                placeholder="Confirm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-purple-400"
              >
                {showConfirmPassword ? 
                  <EyeOff size={16} style={{ color: darkTheme.text.muted }} /> : 
                  <Eye size={16} style={{ color: darkTheme.text.muted }} />
                }
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start space-x-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1 text-sm">Start Free</h4>
              <p className="text-xs text-blue-200">
                You'll start with a free account. You can upgrade to unlock more features anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="terms" className="text-xs" style={{ color: darkTheme.text.secondary }}>
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={handleTermsClick}
              className="text-purple-400 hover:text-purple-300 hover:underline focus:outline-none"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={handlePrivacyClick}
              className="text-purple-400 hover:text-purple-300 hover:underline focus:outline-none"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
              <div>
                <h4 className="font-semibold text-green-200 mb-1 text-sm">Registration Successful!</h4>
                <p className="text-xs text-green-200">
                  Please check your email for a verification link to complete your account setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            loading ? 'cursor-wait' : 'hover:scale-[1.02] hover:shadow-lg'
          }`}
          style={{ background: darkTheme.neon.green }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : success ? (
            'Registration Complete'
          ) : (
            'Create Free Account'
          )}
        </button>
      </div>
    </div>
  );

  const renderWelcomePage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
          Welcome to LifeX! 🎉
        </h2>
        <p className="text-sm mb-6" style={{ color: darkTheme.text.secondary }}>
          Your account has been created successfully. Check your email to verify your account.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
        <h3 className="text-lg font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
          Choose Your Plan
        </h3>
        <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
          Start with Free and upgrade when you need more features.
        </p>

        <div className="space-y-3">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                tier.popular ? 'ring-2 ring-yellow-500' : ''
              }`}
              style={{
                background: `${tier.color}10`,
                borderColor: `${tier.color}30`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {tier.id === 'free' && <Star size={18} style={{ color: tier.color }} />}
                    {tier.id === 'essential' && <Zap size={18} style={{ color: tier.color }} />}
                    {tier.id === 'premium' && <Crown size={18} style={{ color: tier.color }} />}
                    <h4 className="font-semibold" style={{ color: darkTheme.text.primary }}>
                      {tier.title}
                    </h4>
                    {tier.popular && (
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: darkTheme.text.secondary }}>
                    {tier.subtitle}
                  </p>
                  <div className="text-sm font-medium mb-2" style={{ color: tier.color }}>
                    {tier.price}
                  </div>
                  <ul className="space-y-1">
                    {tier.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs">
                        <CheckCircle size={10} className="mr-2 flex-shrink-0" style={{ color: tier.color }} />
                        <span style={{ color: darkTheme.text.primary }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col space-y-2">
                  {tier.id === 'free' ? (
                    <button
                      onClick={handleContinueFree}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{ 
                        background: tier.color,
                        color: 'white'
                      }}
                    >
                      Continue Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{ 
                        background: tier.color,
                        color: 'white'
                      }}
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleContinueFree}
          className="text-sm transition-colors hover:text-purple-400"
          style={{ color: darkTheme.text.muted }}
        >
          I'll decide later, take me to the app
        </button>
      </div>
    </div>
  );

  if (success && !showWelcome) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: darkTheme.primary }}
      >
        <div className="w-full max-w-md">
          <div 
            className="p-6 rounded-2xl border text-center"
            style={{
              background: `${darkTheme.secondary}90`,
              borderColor: `${darkTheme.neon.green}30`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-3" style={{ color: darkTheme.text.primary }}>
              Registration Complete!
            </h2>
            <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your email and click the link to activate your account.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => setShowWelcome(true)}
                className="block w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: darkTheme.neon.purple }}
              >
                Explore Plans
              </button>
              <button 
                onClick={handleContinueFree}
                className="block w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-gray-700"
                style={{ 
                  background: darkTheme.secondary,
                  color: darkTheme.text.secondary
                }}
              >
                Continue to App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: darkTheme.primary }}
    >
      <div className="w-full max-w-md">
        <div 
          className="p-6 rounded-2xl border"
          style={{
            background: `${darkTheme.secondary}90`,
            borderColor: `${darkTheme.neon.purple}30`,
            backdropFilter: 'blur(10px)'
          }}
        >
          {showWelcome ? renderWelcomePage() : renderRegistrationForm()}
          
          {!showWelcome && (
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                Already have an account?{' '}
                <a href="/auth/login" style={{ color: darkTheme.neon.purple }} className="hover:underline">
                  Sign In Now
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeXRegisterRedesign;