// src/components/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, BookOpen, Sparkles, BarChart3, Bell, Shield, Globe, HelpCircle, Settings, ChevronRight, LogOut, Edit3 } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { useAuth } from '../../lib/hooks/useAuth';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const settingsItems = [
    { icon: Bell, label: "Notifications", desc: "Manage your alerts", color: darkTheme.neon.blue },
    { icon: Shield, label: "Privacy & Security", desc: "Control your data", color: darkTheme.neon.green },
    { icon: Globe, label: "Language & Region", desc: "Auckland, New Zealand", color: darkTheme.neon.purple },
    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance", color: darkTheme.neon.yellow },
    { icon: Settings, label: "App Settings", desc: "Customize your experience", color: darkTheme.neon.cyan }
  ];

  const quickActions = [
    { icon: Heart, label: "My Favorites", desc: "15 saved places", color: darkTheme.neon.pink },
    { icon: BookOpen, label: "My Reviews", desc: "8 reviews posted", color: darkTheme.neon.blue },
    { icon: Sparkles, label: "AI Preferences", desc: "Customize recommendations", color: darkTheme.neon.yellow },
    { icon: BarChart3, label: "Activity Stats", desc: "View your insights", color: darkTheme.neon.green }
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: darkTheme.neon.purple }}></div>
          <p style={{ color: darkTheme.text.secondary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: darkTheme.neon.purple }}
          >
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
            Sign in to LifeX
          </h2>
          <p className="text-sm mb-6" style={{ color: darkTheme.text.secondary }}>
            Create an account to save favorites, track your activity, and get personalized recommendations
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all"
              style={{ background: darkTheme.neon.purple, color: 'white' }}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all border"
              style={{ 
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const premiumFeatures = [
    "Unlimited AI recommendations",
    "Priority customer support", 
    "Exclusive local deals",
    "Advanced booking features"
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Profile Header */}
          <div 
            className="p-4 md:p-6 rounded-xl border mb-6 text-center"
            style={{
              background: `${darkTheme.neon.purple}10`,
              borderColor: `${darkTheme.neon.purple}30`,
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => router.push('/auth/profile/edit')}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: darkTheme.text.muted }}
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: darkTheme.text.muted }}
              >
                <LogOut size={16} />
              </button>
            </div>
            
            <div 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: darkTheme.neon.purple }}
            >
              <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
              {user.full_name || user.username || 'LifeX User'}
            </h2>
            <p className="text-sm md:text-base mb-1" style={{ color: darkTheme.text.secondary }}>
              {user.email}
            </p>
            <p className="text-xs mb-4" style={{ color: darkTheme.text.muted }}>
              LifeX member since {new Date(user.created_at).toLocaleDateString()}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>28</p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>AI Chats</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>15</p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>Saved Places</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>7</p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>Bookings</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold mb-4 text-base md:text-lg" style={{ color: darkTheme.text.primary }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
                {quickActions.map((item, idx) => (
                  <button 
                    key={idx}
                    className="p-4 md:p-5 rounded-xl border text-left transition-all hover:scale-105"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                  >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 mb-3" style={{ color: item.color }} />
                    <h4 className="font-medium text-sm md:text-base mb-1" style={{ color: darkTheme.text.primary }}>
                      {item.label}
                    </h4>
                    <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings & Premium */}
            <div>
              {/* Settings Menu */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-base md:text-lg" style={{ color: darkTheme.text.primary }}>
                  Settings & Privacy
                </h3>
                
                <div className="space-y-3">
                  {settingsItems.map((item, idx) => (
                    <button
                      key={idx}
                      className="w-full p-3 md:p-4 rounded-xl border text-left transition-all hover:scale-[1.02] flex items-center justify-between"
                      style={{
                        background: darkTheme.background.card,
                        borderColor: darkTheme.background.glass,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                        >
                          <item.icon size={16} className="md:w-5 md:h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                            {item.label}
                          </h4>
                          <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Upgrade */}
              <div 
                className="p-4 md:p-6 rounded-xl border"
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.neon.purple}20, ${darkTheme.neon.pink}20)`,
                  borderColor: `${darkTheme.neon.purple}30`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: darkTheme.neon.purple }} />
                  <h3 className="font-semibold text-base md:text-lg" style={{ color: darkTheme.text.primary }}>
                    LifeX Premium
                  </h3>
                </div>
                <p className="text-sm md:text-base mb-4" style={{ color: darkTheme.text.secondary }}>
                  Unlock unlimited AI recommendations, exclusive local insights, and priority booking access
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                      Starting from
                    </p>
                    <p className="text-lg md:text-xl font-bold" style={{ color: darkTheme.text.primary }}>
                      $4.99<span className="text-sm font-normal">/month</span>
                    </p>
                  </div>
                  <button 
                    className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
                    style={{ background: darkTheme.neon.purple, color: 'white' }}
                  >
                    Upgrade Now
                  </button>
                </div>
                
                {/* Premium Features List */}
                <div className="space-y-2">
                  {premiumFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ background: darkTheme.neon.purple }}
                      />
                      <span className="text-xs md:text-sm" style={{ color: darkTheme.text.primary }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;