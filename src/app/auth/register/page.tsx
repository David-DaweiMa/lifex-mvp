'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Building, Check, CheckCircle, AlertCircle, Eye, EyeOff, Mail, Lock, Users, Briefcase, Shield } from 'lucide-react';

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
    green: '#10b981'
  }
};

interface UserType {
  id: 'consumer' | 'service_provider';
  title: string;
  subtitle: string;
  features: string[];
  icon: React.ComponentType<any>;
  color: string;
  legalNotice?: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
  business_name: string;
  service_category: string;
  phone: string;
}

const userTypes: UserType[] = [
  {
    id: 'consumer',
    title: 'Personal Account',
    subtitle: 'Discover and enjoy local life services',
    features: [
      'Discover quality local services',
      'AI-powered life assistant',
      'Book restaurants, beauty, and repair services',
      'Share experiences and reviews',
      'Personalized recommendations'
    ],
    icon: Users,
    color: darkTheme.neon.green
  },
  {
    id: 'service_provider',
    title: 'Business Account',
    subtitle: 'Showcase and manage your local business',
    features: [
      'Showcase your business services',
      'Manage bookings and customers',
      'Marketing and promotion tools',
      'Customer review management',
      'Business insights and analytics'
    ],
    icon: Briefcase,
    color: darkTheme.neon.purple,
    legalNotice: 'As a business account holder, you must comply with the Consumer Guarantees Act (CGA), ensuring services are provided with reasonable skill and care'
  }
];

const LifeXRegisterRedesign = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedUserType, setSelectedUserType] = useState<'consumer' | 'service_provider' | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    business_name: '',
    service_category: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedServiceTerms, setAcceptedServiceTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleUserTypeSelect = (type: 'consumer' | 'service_provider') => {
    setSelectedUserType(type);
    setCurrentStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (selectedUserType === 'service_provider') {
      if (!formData.business_name || !formData.service_category) {
        return 'Business name and service category are required for service providers';
      }
      
      if (!acceptedServiceTerms) {
        return 'Please accept the service provider legal obligations';
      }
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
      const userTypeMapping = {
        consumer: 'free',
        service_provider: 'free_business'
      };

      const registrationData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: userTypeMapping[selectedUserType!],
        ...(selectedUserType === 'service_provider' && {
          business_name: formData.business_name,
          service_category: formData.service_category
        })
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          1
        </div>
        <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          2
        </div>
      </div>
    </div>
  );

  const renderUserTypeSelection = () => (
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
          Choose Account Type
        </h2>
        <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
          Select the account type that best fits your needs
        </p>
      </div>

      <div className="space-y-3">
        {userTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              onClick={() => handleUserTypeSelect(type.id)}
              className="p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `${type.color}10`,
                borderColor: selectedUserType === type.id ? type.color : `${type.color}30`,
                boxShadow: selectedUserType === type.id ? `0 0 20px ${type.color}40` : 'none'
              }}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${type.color}20` }}
                >
                  <Icon size={20} style={{ color: type.color }} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1" style={{ color: darkTheme.text.primary }}>
                    {type.title}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: darkTheme.text.secondary }}>
                    {type.subtitle}
                  </p>
                  
                  <ul className="space-y-1">
                    {type.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs">
                        <CheckCircle size={12} className="mr-2 flex-shrink-0" style={{ color: type.color }} />
                        <span style={{ color: darkTheme.text.primary }}>{feature}</span>
                      </li>
                    ))}
                    {type.features.length > 3 && (
                      <li className="text-xs" style={{ color: darkTheme.text.muted }}>
                        +{type.features.length - 3} more features...
                      </li>
                    )}
                  </ul>

                  {type.legalNotice && (
                    <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-start space-x-2">
                        <AlertCircle size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-200">
                          Legal compliance required for NZ business accounts
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRegistrationForm = () => {
    const selectedType = userTypes.find(type => type.id === selectedUserType);
    const isServiceProvider = selectedUserType === 'service_provider';

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="inline-flex items-center text-sm mb-3 transition-colors hover:text-purple-400"
            style={{ color: darkTheme.text.muted }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Account Type Selection
          </button>
          
          <div className="inline-flex items-center space-x-2 mb-2">
            {selectedType && (
              <>
                <selectedType.icon size={18} style={{ color: selectedType.color }} />
                <h2 className="text-lg font-bold" style={{ color: darkTheme.text.primary }}>
                  Register {selectedType.title}
                </h2>
              </>
            )}
          </div>
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Fill in the following information to complete registration
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-base font-semibold" style={{ color: darkTheme.text.primary }}>
              Basic Information
            </h3>
            
            <div className="space-y-3">
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
                  placeholder="Enter username"
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
            </div>
          </div>

          {isServiceProvider && (
            <div className="space-y-3 pt-3 border-t" style={{ borderColor: `${darkTheme.neon.purple}20` }}>
              <h3 className="text-base font-semibold" style={{ color: darkTheme.text.primary }}>
                Service Provider Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: darkTheme.secondary,
                      borderColor: `${darkTheme.neon.purple}30`,
                      color: darkTheme.text.primary
                    }}
                    placeholder="Enter business name"
                    required={isServiceProvider}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
                    Service Category *
                  </label>
                  <select
                    name="service_category"
                    value={formData.service_category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: darkTheme.secondary,
                      borderColor: `${darkTheme.neon.purple}30`,
                      color: darkTheme.text.primary
                    }}
                    required={isServiceProvider}
                  >
                    <option value="">Select service category</option>
                    <option value="dining">Dining - Restaurants, cafes, bakeries, and food services</option>
                    <option value="beverage">Beverage - Bars, pubs, coffee roasters, and beverage venues</option>
                    <option value="entertainment">Entertainment - Live music, cinemas, gaming, and entertainment venues</option>
                    <option value="recreation">Recreation - Fitness, sports, outdoor activities, and recreation</option>
                    <option value="shopping">Shopping - Fashion, markets, specialty stores, and retail</option>
                    <option value="accommodation">Accommodation - Camping, B&Bs, unique stays, and special lodging</option>
                    <option value="beauty">Beauty - Hair salons, nail studios, skincare, and beauty services</option>
                    <option value="wellness">Wellness - Spas, massage, alternative medicine, and wellness</option>
                    <option value="other">Other - Other lifestyle and experience businesses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: darkTheme.text.secondary }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: darkTheme.secondary,
                      borderColor: `${darkTheme.neon.purple}30`,
                      color: darkTheme.text.primary
                    }}
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>
          )}

          {isServiceProvider && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start space-x-2">
                <Shield className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="font-semibold text-yellow-200 mb-1 text-sm">Service Provider Legal Obligations</h4>
                  <p className="text-xs text-yellow-200 mb-2">
                    Under New Zealand's Consumer Guarantees Act (CGA), you must ensure:
                  </p>
                  <ul className="text-xs text-yellow-200 space-y-0.5">
                    <li>• Provide services with reasonable skill and care</li>
                    <li>• Ensure services are fit for their intended purpose</li>
                    <li>• Complete services within a reasonable timeframe</li>
                    <li>• Charge reasonable prices</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
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

            {isServiceProvider && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="service_terms"
                  checked={acceptedServiceTerms}
                  onChange={(e) => setAcceptedServiceTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="service_terms" className="text-xs" style={{ color: darkTheme.text.secondary }}>
                  I understand and agree to comply with the legal obligations as a business account holder, including the Consumer Guarantees Act requirements
                </label>
              </div>
            )}
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
            style={{ background: selectedType?.color || darkTheme.neon.purple }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : success ? (
              'Registration Complete'
            ) : (
              'Complete Registration'
            )}
          </button>
        </div>
      </div>
    );
  };

  if (success) {
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
              <a 
                href="/auth/login" 
                className="block w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: darkTheme.neon.green }}
              >
                Go to Sign In
              </a>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setCurrentStep(1);
                  setSelectedUserType(null);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    username: '',
                    full_name: '',
                    business_name: '',
                    service_category: '',
                    phone: ''
                  });
                  setAcceptedTerms(false);
                  setAcceptedServiceTerms(false);
                }}
                className="block w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-gray-700"
                style={{ 
                  background: darkTheme.secondary,
                  color: darkTheme.text.secondary
                }}
              >
                Register Another Account
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
          {renderStepIndicator()}
          
          {currentStep === 1 && renderUserTypeSelection()}
          {currentStep === 2 && renderRegistrationForm()}
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: darkTheme.text.muted }}>
              Already have an account?{' '}
              <a href="/auth/login" style={{ color: darkTheme.neon.purple }} className="hover:underline">
                Sign In Now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeXRegisterRedesign;