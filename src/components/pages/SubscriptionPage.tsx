// src/components/pages/SubscriptionPage.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Crown,
  Building,
  ArrowRight,
  Heart,
  Coffee,
  Home,
  Info
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';

interface SubscriptionPageProps {
  onNavigateToChat: () => void;
  onNavigateToMembership: () => void;
  userType?: 'personal' | 'business';
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onNavigateToChat,
  onNavigateToMembership,
  userType = 'personal'
}) => {
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
                onClick={onNavigateToMembership}
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
