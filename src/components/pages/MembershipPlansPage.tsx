// src/components/pages/MembershipPlansPage.tsx
import React, { useState } from 'react';
import { 
  Crown,
  Check,
  ArrowLeft,
  Star,
  Zap,
  MessageCircle,
  TrendingUp,
  Store,
  CreditCard,
  Users,
  Sparkles,
  Heart,
  Building
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { QUOTA_CONFIG } from '../../lib/quotaConfig';

interface MembershipPlansPageProps {
  onNavigateBack: () => void;
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({
  onNavigateBack
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('essential');

  const plans = [
    {
      id: 'free',
      name: "Free",
      price: "$0",
      duration: "forever",
      description: "Perfect for getting started",
      color: darkTheme.neon.green,
      popular: false,
      features: [
        "Basic AI conversations (10/day)",
        "Limited trending views",
        "Basic recommendations",
        "Community access",
        "Business features enabled",
        "20 product listings"
      ]
    },
    {
      id: 'essential',
      name: "Essential",
      price: "$9.9",
      duration: "month",
      description: "Most popular choice",
      color: darkTheme.neon.purple,
      popular: true,
      features: [
        "Coly Life Assistant",
        "Unlimited AI conversations",
        "Advanced recommendations",
        "Business features enabled",
        "100 product listings",
        "Priority support"
      ]
    },
    {
      id: 'premium',
      name: "Premium",
      price: "$19.9",
      duration: "month",
      description: "For power users & businesses",
      color: darkTheme.neon.cyan,
      popular: false,
      features: [
        "All Essential features",
        "Max Business Assistant",
        "Unlimited product listings",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
        "Team collaboration"
      ]
    }
  ];

  const getQuotaDisplay = (planId: string, feature: string) => {
    const quota = QUOTA_CONFIG[planId];
    if (!quota) return "N/A";
    
    const featureQuota = quota[feature as keyof typeof quota];
    if (!featureQuota) return "N/A";
    
    // Handle different quota types
    if (typeof featureQuota === 'object' && featureQuota !== null) {
      if ('hourly' in featureQuota) {
        return featureQuota.hourly === 0 ? 'Not available' : `${featureQuota.hourly}/hour`;
      } else if ('monthly' in featureQuota) {
        return `${featureQuota.monthly}/month`;
      } else if ('total' in featureQuota) {
        return `${featureQuota.total} total`;
      }
    } else if (typeof featureQuota === 'boolean') {
      return featureQuota ? 'Available' : 'Not available';
    }
    
    return "Unlimited";
  };

  const handleSubscribe = async (planId: string) => {
    // TODO: Implement subscription logic
    console.log('Subscribing to plan:', planId);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary }}>
      {/* Header */}
      <div 
        className="p-4 md:p-6 border-b flex-shrink-0"
        style={{
          background: darkTheme.background.card,
          borderColor: darkTheme.background.glass,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: darkTheme.text.muted }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-lg md:text-xl" style={{ color: darkTheme.text.primary }}>
                LifeX Membership Plans
              </h1>
              <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                One account, all features - Personal & Business
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Unified Plans */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6" style={{ color: darkTheme.neon.pink }} />
                  <span className="text-2xl">+</span>
                  <Building className="w-6 h-6" style={{ color: darkTheme.neon.green }} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                Choose Your Plan
              </h2>
              <p className="text-lg" style={{ color: darkTheme.text.secondary }}>
                All plans include both personal and business features
              </p>
            </div>

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
                    borderWidth: selectedPlan === plan.id ? '2px' : '1px',
                    boxShadow: selectedPlan === plan.id ? `0 8px 30px ${plan.color}20` : 'none'
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: `linear-gradient(135deg, ${plan.color}, ${darkTheme.neon.pink})`, 
                        color: 'white',
                        boxShadow: `0 4px 15px ${plan.color}40`
                      }}
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

                  {/* Quota Details */}
                  <div className="mb-6 p-4 rounded-lg" style={{ background: `${plan.color}10` }}>
                    <h4 className="font-semibold mb-3 text-sm" style={{ color: plan.color }}>
                      Key Limits
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: darkTheme.text.secondary }}>AI Chat:</span>
                        <span style={{ color: darkTheme.text.primary }}>
                          {getQuotaDisplay(plan.id, 'chat')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: darkTheme.text.secondary }}>Products:</span>
                        <span style={{ color: darkTheme.text.primary }}>
                          {getQuotaDisplay(plan.id, 'products')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: darkTheme.text.secondary }}>Coly Assistant:</span>
                        <span style={{ color: darkTheme.text.primary }}>
                          {plan.id === 'free' ? 'Not available' : 'Available'}
                        </span>
                      </div>
                    </div>
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
                      handleSubscribe(plan.id);
                    }}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* FAQ Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-center mb-6" style={{ color: darkTheme.text.primary }}>
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Can I use both personal and business features?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes! All plans include both personal and business features. You can switch between roles seamlessly.
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
                  What's included in the free trial?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Get 2 weeks free access to all Essential features. Cancel anytime with no commitment required.
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
                  Can I change my plan anytime?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
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
                  Do you offer refunds?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div 
            className="p-6 rounded-xl border text-center"
            style={{
              background: `${darkTheme.neon.purple}10`,
              borderColor: `${darkTheme.neon.purple}30`,
            }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.purple }} />
            <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
              Need Help Choosing?
            </h3>
            <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <button 
              className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{ background: darkTheme.neon.purple, color: 'white' }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansPage;
