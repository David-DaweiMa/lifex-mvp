// src/components/pages/SubscriptionPage.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Zap, 
  Star, 
  Check, 
  Crown,
  Users,
  Building,
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';

interface SubscriptionPageProps {
  onNavigateToChat: () => void;
  userType?: 'personal' | 'business';
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onNavigateToChat,
  userType = 'personal'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'personal' | 'family'>('trial');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "AI Life Assistant",
      description: "Smart scheduling, reminders, and life advice",
      color: darkTheme.neon.purple
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Smart Calendar",
      description: "Auto-organize life arrangements, never miss important events",
      color: darkTheme.neon.green
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Local Recommendations",
      description: "Personalized dining, activities, and service recommendations",
      color: darkTheme.neon.cyan
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Exclusive Offers",
      description: "Subscriber-only discounts and coupons",
      color: darkTheme.neon.yellow
    }
  ];

  const plans = [
    {
      id: 'trial',
      name: "2-Week Free Trial",
      price: "Free",
      duration: "14 days",
      description: "Experience full features, no credit card required",
      features: [
        "AI Life Assistant (3 reminders/day)",
        "Basic calendar management",
        "Local recommendation service",
        "Partial coupon access"
      ],
      popular: false,
      color: darkTheme.neon.green
    },
    {
      id: 'personal',
      name: "Personal Plan",
      price: "NZ$9.9",
      duration: "month",
      description: "Complete life assistant for individuals",
      features: [
        "Unlimited AI assistant conversations",
        "Full calendar management",
        "All local recommendations",
        "Complete coupon access",
        "Spending analysis reports"
      ],
      popular: true,
      color: darkTheme.neon.purple
    },
    {
      id: 'family',
      name: "Family Plan",
      price: "NZ$14.9",
      duration: "month",
      description: "Share with family, up to 5 members",
      features: [
        "All Personal Plan features",
        "Family calendar sharing",
        "Multi-person reminder management",
        "Kids activity recommendations",
        "Family spending analysis"
      ],
      popular: false,
      color: darkTheme.neon.cyan
    }
  ];

  const handleStartTrial = async () => {
    setIsLoading(true);
    // TODO: Implement free trial logic
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to chat page to start experience
      onNavigateToChat();
    }, 2000);
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    // TODO: Implement subscription logic
    setTimeout(() => {
      setIsLoading(false);
      // Handle subscription success
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mr-3"
                style={{ background: darkTheme.neon.purple }}
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: darkTheme.text.primary }}>
                Coly Life Assistant
              </h1>
            </div>
            <p className="text-lg md:text-xl mb-6" style={{ color: darkTheme.text.secondary }}>
              Your personal AI life assistant, making every day easier
            </p>
            
            {/* Feature showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border text-center"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${feature.color}20`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: darkTheme.text.primary }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6" style={{ color: darkTheme.text.primary }}>
              Choose Your Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative p-6 rounded-xl border transition-all cursor-pointer ${
                    selectedPlan === plan.id ? 'scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    background: selectedPlan === plan.id 
                      ? `${plan.color}10` 
                      : darkTheme.background.card,
                    borderColor: selectedPlan === plan.id 
                      ? plan.color 
                      : darkTheme.background.glass,
                    borderWidth: selectedPlan === plan.id ? '2px' : '1px'
                  }}
                  onClick={() => setSelectedPlan(plan.id as any)}
                >
                  {plan.popular && (
                    <div 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: plan.color, color: 'white' }}
                    >
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-2xl md:text-3xl font-bold" style={{ color: plan.color }}>
                        {plan.price}
                      </span>
                      <span className="text-sm" style={{ color: darkTheme.text.muted }}>
                        /{plan.duration}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check 
                          className="w-4 h-4 mr-3 flex-shrink-0" 
                          style={{ color: plan.color }} 
                        />
                        <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      selectedPlan === plan.id ? 'text-white' : 'border'
                    }`}
                    style={{
                      background: selectedPlan === plan.id ? plan.color : 'transparent',
                      borderColor: selectedPlan === plan.id ? plan.color : darkTheme.background.glass,
                      color: selectedPlan === plan.id ? 'white' : darkTheme.text.primary
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.id === 'trial') {
                        handleStartTrial();
                      } else {
                        handleSubscribe(plan.id);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {plan.id === 'trial' ? 'Start Free Trial' : 'Subscribe Now'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Process */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-center mb-6" style={{ color: darkTheme.text.primary }}>
              2-Week Free Trial Process
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: darkTheme.neon.green, color: 'white' }}
                >
                  1
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Start Now
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  No credit card required, start experiencing full features immediately
                </p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: darkTheme.neon.cyan, color: 'white' }}
                >
                  2
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Experience Value
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Feel the convenience of life assistant over 14 days
                </p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: darkTheme.neon.purple, color: 'white' }}
                >
                  3
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Choose to Upgrade
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Choose to continue subscription or cancel before expiry
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-center mb-6" style={{ color: darkTheme.text.primary }}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Do I need a credit card for the free trial?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  No. The 2-week free trial is completely free with no payment method required.
                </p>
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Will I be charged automatically after the trial?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  No. After the free trial expires, features will automatically stop unless you actively choose to subscribe.
                </p>
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Can I cancel my subscription anytime?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes. You can cancel your subscription at any time and continue using it until the end of the current billing period.
                </p>
              </div>
            </div>
          </div>

          {/* Business User Notice */}
          {userType === 'business' && (
            <div 
              className="p-6 rounded-xl border text-center"
              style={{
                background: `${darkTheme.neon.yellow}10`,
                borderColor: `${darkTheme.neon.yellow}30`,
              }}
            >
              <Building className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.yellow }} />
              <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                Business User?
              </h3>
              <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
                We provide customized solutions for business users, including team management and business benefits.
              </p>
              <button 
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: darkTheme.neon.yellow, color: 'white' }}
              >
                Contact Business Sales
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
