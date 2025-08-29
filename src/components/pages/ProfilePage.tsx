// src/components/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Heart, 
  BookOpen, 
  Sparkles, 
  BarChart3, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Edit3,
  Store,
  ArrowRight,
  Loader2,
  Star,
  Calendar,
  Award,
  Camera,  // Added Camera import
  Info
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { useAuth } from '../../lib/hooks/useAuth';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Check if user is business account
  const isBusinessUser = user && user.has_business_features;

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

  const premiumFeatures = [
    "Unlimited AI recommendations",
    "Priority booking access", 
    "Exclusive local insights",
    "Advanced analytics",
    "Premium support"
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: darkTheme.neon.purple }} />
          <p style={{ color: darkTheme.text.secondary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary }}>
      {/* Background decorations */}
      <div 
        className="absolute top-[10%] right-[10%] w-16 h-16 md:w-24 md:h-24 rounded-full blur-xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.purple}20, transparent)` }}
      />
      <div 
        className="absolute bottom-[30%] left-[5%] w-12 h-12 md:w-20 md:h-20 rounded-full blur-lg pointer-events-none"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.green}20, transparent)` }}
      />

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
                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
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

            {/* Account Type Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4" style={{
              background: isBusinessUser ? `${darkTheme.neon.green}20` : `${darkTheme.neon.purple}20`,
              color: isBusinessUser ? darkTheme.neon.green : darkTheme.neon.purple
            }}>
              {isBusinessUser ? (
                <>
                  <Store size={12} className="mr-1" />
                  Business Account
                </>
              ) : (
                <>
                  <User size={12} className="mr-1" />
                  Personal Account
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>28</p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>Favorites</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>12</p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>Reviews</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-bold" style={{ color: darkTheme.text.primary }}>
                  {isBusinessUser ? '4.8' : '156'}
                </p>
                <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                  {isBusinessUser ? 'Rating' : 'Visits'}
                </p>
              </div>
            </div>
          </div>

          {/* Business Dashboard Entry (Only for Business Users) */}
          {isBusinessUser && (
            <div className="mb-6">
              <button
                onClick={() => router.push('/business/dashboard')}
                className="w-full p-4 md:p-6 rounded-xl border transition-all hover:scale-105 group"
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.neon.purple}15, ${darkTheme.neon.pink}10)`,
                  borderColor: `${darkTheme.neon.purple}40`
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${darkTheme.neon.purple}30` }}
                  >
                    <Store style={{ color: darkTheme.neon.purple }} size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-base md:text-lg mb-1" style={{ color: darkTheme.text.primary }}>
                      Business Dashboard
                    </h3>
                    <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                      Manage your business profile, services, and customer interactions
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-xs">
                      <span className="flex items-center" style={{ color: darkTheme.neon.green }}>
                        <Calendar size={12} className="mr-1" />
                        Menu & Hours
                      </span>
                      <span className="flex items-center" style={{ color: darkTheme.neon.pink }}>
                        <Camera size={12} className="mr-1" />
                        Media & Reviews
                      </span>
                      <span className="flex items-center" style={{ color: '#F59E0B' }}>
                        <Award size={12} className="mr-1" />
                        Compliance
                      </span>
                    </div>
                  </div>
                  <ArrowRight 
                    size={20} 
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: darkTheme.text.muted }}
                  />
                </div>
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="p-3 md:p-4 rounded-xl border text-left transition-all hover:scale-105 group"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: `${action.color}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <action.icon 
                      className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" 
                      style={{ color: action.color }} 
                    />
                    <ChevronRight 
                      size={14} 
                      className="group-hover:translate-x-1 transition-transform"
                      style={{ color: darkTheme.text.muted }}
                    />
                  </div>
                  <h4 className="font-medium text-sm md:text-base mb-1" style={{ color: darkTheme.text.primary }}>
                    {action.label}
                  </h4>
                  <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                    {action.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
              Settings
            </h3>
            <div className="space-y-2 md:space-y-3">
              {settingsItems.map((setting, index) => (
                <button
                  key={index}
                  className="w-full p-3 md:p-4 rounded-xl border flex items-center justify-between transition-all hover:scale-105 group"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-center">
                    <div 
                      className="p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform"
                      style={{ background: `${setting.color}20` }}
                    >
                      <setting.icon size={16} style={{ color: setting.color }} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                        {setting.label}
                      </h4>
                      <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                        {setting.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: darkTheme.text.muted }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Premium Upgrade (Only for Non-Business Users) */}
          {!isBusinessUser && (
            <div className="mb-6">
              <div 
                className="p-4 md:p-6 rounded-xl border relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.neon.purple}15, ${darkTheme.neon.pink}10)`,
                  borderColor: `${darkTheme.neon.purple}30`,
                }}
              >
                <div className="relative z-10">
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
                      className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all hover:scale-105 text-sm md:text-base"
                      style={{ background: darkTheme.neon.purple, color: 'white' }}
                    >
                      Upgrade Now
                    </button>
                  </div>
                  
                  {/* Membership System Link */}
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => router.push('/membership')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ 
                        background: `${darkTheme.neon.purple}20`, 
                        color: darkTheme.neon.purple,
                        border: `1px solid ${darkTheme.neon.purple}40`
                      }}
                    >
                      <Info className="w-3 h-3" />
                      View All Membership Plans
                      <ArrowRight className="w-3 h-3" />
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
          )}

          {/* Business Account Upgrade (Only for Personal Users) */}
          {!isBusinessUser && (
            <div className="mb-6">
              <div 
                className="p-4 md:p-6 rounded-xl border relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.neon.green}15, ${darkTheme.neon.purple}10)`,
                  borderColor: `${darkTheme.neon.green}30`,
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Store className="w-5 h-5 md:w-6 md:h-6" style={{ color: darkTheme.neon.green }} />
                    <h3 className="font-semibold text-base md:text-lg" style={{ color: darkTheme.text.primary }}>
                      Business Account
                    </h3>
                  </div>
                  <p className="text-sm md:text-base mb-4" style={{ color: darkTheme.text.secondary }}>
                    List your business on LifeX and connect with local customers. Manage your services, track reviews, and grow your business.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                        Free to start
                      </p>
                      <p className="text-lg md:text-xl font-bold" style={{ color: darkTheme.text.primary }}>
                        $0<span className="text-sm font-normal">/month</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/auth/register?type=business')}
                      className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all hover:scale-105 text-sm md:text-base"
                      style={{ background: darkTheme.neon.green, color: 'white' }}
                    >
                      Join as Business
                    </button>
                  </div>
                  
                  {/* Business Features */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} style={{ color: darkTheme.neon.green }} />
                      <span style={{ color: darkTheme.text.primary }}>Manage Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={12} style={{ color: darkTheme.neon.green }} />
                      <span style={{ color: darkTheme.text.primary }}>Track Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera size={12} style={{ color: darkTheme.neon.green }} />
                      <span style={{ color: darkTheme.text.primary }}>Photo Gallery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={12} style={{ color: darkTheme.neon.green }} />
                      <span style={{ color: darkTheme.text.primary }}>Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
              Account Information
            </h3>
            <div 
              className="p-4 md:p-6 rounded-xl border"
              style={{
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: darkTheme.text.muted }}>Account Type</span>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      background: `${darkTheme.neon.purple}20`,
                      color: darkTheme.neon.purple 
                    }}
                  >
                    {user.subscription_level.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: darkTheme.text.muted }}>Member Since</span>
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: darkTheme.text.muted }}>Status</span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (user.is_active ?? true) 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {(user.is_active ?? true) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {isBusinessUser && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: darkTheme.text.muted }}>Business Rating</span>
                    <div className="flex items-center">
                      <Star size={12} className="mr-1 fill-current" style={{ color: '#F59E0B' }} />
                      <span className="text-sm font-medium" style={{ color: darkTheme.text.primary }}>4.8</span>
                      <span className="text-xs ml-1" style={{ color: darkTheme.text.muted }}>(127 reviews)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="mb-8">
            <h3 className="text-base md:text-lg font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
              Support & Legal
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Business Obligations', href: '/legal/business-obligations' },
                { label: 'Contact Support', href: '/support' }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(item.href)}
                  className="w-full p-3 rounded-lg flex items-center justify-between transition-all hover:scale-105 group text-left"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <span className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    {item.label}
                  </span>
                  <ChevronRight 
                    size={14} 
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: darkTheme.text.muted }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* App Version */}
          <div className="text-center">
            <p className="text-xs" style={{ color: darkTheme.text.muted }}>
              LifeX v1.0.0 • Made with ❤️ in New Zealand
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;