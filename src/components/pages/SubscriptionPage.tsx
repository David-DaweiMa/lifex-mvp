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
  Sparkles,
  Heart,
  Coffee,
  Home,
  Info
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
      icon: <Heart className="w-5 h-5" />,
      title: "Your Personal AI Companion",
      description: "A warm, caring assistant that understands your life",
      color: darkTheme.neon.pink
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Smart Life Management",
      description: "Organize your days with love and care",
      color: darkTheme.neon.green
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      title: "Local Discoveries",
      description: "Find hidden gems and cozy spots near you",
      color: darkTheme.neon.yellow
    },
    {
      icon: <Home className="w-5 h-5" />,
      title: "Life Made Easier",
      description: "From daily tasks to special moments",
      color: darkTheme.neon.cyan
    }
  ];

  const plans = [
    {
      id: 'trial',
      name: "2-Week Free Trial",
      price: "Free",
      duration: "14 days",
      description: "Experience the warmth of Coly, no commitment required",
      features: [
        "Full AI Life Assistant access",
        "Smart calendar & reminders",
        "Local recommendations",
        "Personalized insights"
      ],
      popular: false,
      color: darkTheme.neon.green
    },
    {
      id: 'personal',
      name: "Personal Plan",
      price: "NZ$9.9",
      duration: "month",
      description: "Your dedicated life companion",
      features: [
        "Unlimited AI conversations",
        "Advanced life planning",
        "Priority recommendations",
        "Spending insights",
        "24/7 support"
      ],
      popular: true,
      color: darkTheme.neon.purple
    },
    {
      id: 'family',
      name: "Family Plan",
      price: "NZ$14.9",
      duration: "month",
      description: "Share the love with your family",
      features: [
        "All Personal features",
        "Family calendar sharing",
        "Kids activity planning",
        "Family spending analysis",
        "Up to 5 family members"
      ],
      popular: false,
      color: darkTheme.neon.cyan
    }
  ];

  const handleStartTrial = async () => {
    setIsLoading(true);
    // TODO: Implement free trial logic with payment method collection
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
      {/* Warm background decorations */}
      <div 
        className="absolute top-[5%] right-[5%] w-20 h-20 md:w-32 md:h-32 rounded-full blur-2xl pointer-events-none opacity-30"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.pink}40, transparent)` }}
      />
      <div 
        className="absolute bottom-[20%] left-[10%] w-16 h-16 md:w-24 md:h-24 rounded-full blur-xl pointer-events-none opacity-40"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.yellow}30, transparent)` }}
      />
      <div 
        className="absolute top-[60%] left-[50%] w-12 h-12 md:w-20 md:h-20 rounded-full blur-lg pointer-events-none opacity-50"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.cyan}20, transparent)` }}
      />

      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center mb-6">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mr-4"
                style={{ 
                  background: `linear-gradient(135deg, ${darkTheme.neon.pink}, ${darkTheme.neon.purple})`,
                  boxShadow: `0 0 30px ${darkTheme.neon.pink}40`
                }}
              >
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                  Coly
                </h1>
                <p className="text-lg md:text-xl" style={{ color: darkTheme.neon.pink }}>
                  Your Warm Life Assistant
                </p>
              </div>
            </div>
            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: darkTheme.text.secondary }}>
              Meet Coly, your caring AI companion who makes every day feel a little more special. 
              <br />Available to all LifeX premium subscribers at no extra cost.
            </p>
            
            {/* Membership System Link */}
            <div className="mb-8">
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ 
                  background: `${darkTheme.neon.purple}20`, 
                  color: darkTheme.neon.purple,
                  border: `1px solid ${darkTheme.neon.purple}40`
                }}
              >
                <Info className="w-4 h-4" />
                View LifeX Membership Plans
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Feature showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border text-center transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                    boxShadow: `0 4px 20px ${feature.color}10`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ 
                      background: `${feature.color}20`, 
                      color: feature.color,
                      boxShadow: `0 0 20px ${feature.color}30`
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: darkTheme.text.primary }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: darkTheme.text.muted }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Integration Notice */}
          <div 
            className="p-6 rounded-xl border mb-8 text-center"
            style={{
              background: `${darkTheme.neon.green}10`,
              borderColor: `${darkTheme.neon.green}30`,
            }}
          >
            <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.green }} />
            <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
              Already a LifeX Premium Member?
            </h3>
            <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
              Coly is included in your existing LifeX premium subscription! No additional cost required.
            </p>
            <button 
              onClick={onNavigateToChat}
              className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{ background: darkTheme.neon.green, color: 'white' }}
            >
              Start Using Coly Now
            </button>
          </div>

          {/* Subscription Plans */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6" style={{ color: darkTheme.text.primary }}>
              Start Your Journey with Coly
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
                    borderWidth: selectedPlan === plan.id ? '2px' : '1px',
                    boxShadow: selectedPlan === plan.id ? `0 8px 30px ${plan.color}20` : 'none'
                  }}
                  onClick={() => setSelectedPlan(plan.id as any)}
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
                      Most Loved
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
              How Your Free Trial Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${darkTheme.neon.green}, ${darkTheme.neon.cyan})`, 
                    color: 'white',
                    boxShadow: `0 4px 15px ${darkTheme.neon.green}30`
                  }}
                >
                  1
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Start Free Trial
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Add payment method and enjoy full features for 14 days
                </p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${darkTheme.neon.cyan}, ${darkTheme.neon.purple})`, 
                    color: 'white',
                    boxShadow: `0 4px 15px ${darkTheme.neon.cyan}30`
                  }}
                >
                  2
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Experience Coly
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Feel the warmth and convenience of your AI companion
                </p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.pink})`, 
                    color: 'white',
                    boxShadow: `0 4px 15px ${darkTheme.neon.purple}30`
                  }}
                >
                  3
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Choose Your Path
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Continue with subscription or cancel before trial ends
                </p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                     style={{ 
                     background: `linear-gradient(135deg, ${darkTheme.neon.pink}, ${darkTheme.neon.yellow})`, 
                     color: 'white',
                     boxShadow: `0 4px 15px ${darkTheme.neon.pink}30`
                   }}
                >
                  4
                </div>
                <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Stay Connected
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Keep enjoying Coly's warmth and care every day
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
                  Do I need a payment method for the free trial?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes, we require a payment method to start your free trial. You won't be charged during the 14-day trial period.
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
                  What happens after the trial ends?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  If you don't cancel before the trial ends, your subscription will automatically continue and you'll be charged the monthly fee.
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
                  Can I cancel anytime?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes! You can cancel your subscription at any time. If you cancel during the trial, you won't be charged.
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
                  Is Coly included in my LifeX premium subscription?
                </h4>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Yes! If you're already a LifeX premium subscriber, Coly is included at no additional cost. Just start using it right away!
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
