// src/app/business/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Sparkles,
  ArrowLeft,
  Store,
  Camera,
  Star
} from 'lucide-react';

// Import the business components
import BusinessDashboard from '@/components/business/BusinessDashboard';
import BusinessAdvanced from '@/components/business/BusinessAdvanced';
import BusinessSpecials from '@/components/business/BusinessSpecials';

// Import existing theme and auth (uncomment when integrating)
import { darkTheme } from '@/lib/theme';
// import { useAuth } from '@/components/AuthProvider';

// Types for the dashboard
interface DashboardModule {
  id: 'core' | 'media' | 'specials';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  component: React.ComponentType;
  description: string;
}

export default function BusinessDashboardPage() {
  // Uncomment when integrating with real auth
  // const { currentUser } = useAuth();
  
  // Mock user for demo - remove when integrating with real auth
  const currentUser = {
    user_type: 'professional_business',
    full_name: 'Business Owner',
    email: 'owner@business.com'
  };

  const [activeModule, setActiveModule] = useState<DashboardModule['id']>('core');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is business account
  const isBusinessUser = currentUser && 
    ['free_business', 'professional_business', 'enterprise_business'].includes(currentUser.user_type);

  // Dashboard modules configuration
  const modules: DashboardModule[] = [
    { 
      id: 'core', 
      label: 'Core Management', 
      icon: LayoutDashboard, 
      color: darkTheme.neon.purple,
      component: BusinessDashboard,
      description: 'Menu, hours, areas, compliance'
    },
    { 
      id: 'media', 
      label: 'Media & Reviews', 
      icon: Camera, 
      color: darkTheme.neon.green,
      component: BusinessAdvanced,
      description: 'Photos, reviews, settings'
    },
    { 
      id: 'specials', 
      label: 'Specials & Config', 
      icon: Sparkles, 
      color: darkTheme.neon.pink,
      component: BusinessSpecials,
      description: 'Promotions, industry settings'
    }
  ];

  // Auth guards
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div className="text-center max-w-md mx-auto p-6">
          <Store size={48} className="mx-auto mb-4" style={{ color: darkTheme.neon.purple }} />
          <h2 className="text-xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
            Business Dashboard
          </h2>
          <p className="text-sm mb-6" style={{ color: darkTheme.text.secondary }}>
            Please login to access your business management dashboard
          </p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
            style={{ background: darkTheme.neon.purple, color: darkTheme.text.primary }}
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (!isBusinessUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkTheme.background.primary }}>
        <div className="text-center max-w-md mx-auto p-6">
          <Store size={48} className="mx-auto mb-4" style={{ color: darkTheme.neon.purple }} />
          <h2 className="text-xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
            Business Account Required
          </h2>
          <p className="text-sm mb-6" style={{ color: darkTheme.text.secondary }}>
            Upgrade to a business account to access the business dashboard and manage your services
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/auth/register?type=business'}
              className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
              style={{ background: darkTheme.neon.purple, color: darkTheme.text.primary }}
            >
              Upgrade to Business Account
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
              style={{ background: darkTheme.background.secondary, color: darkTheme.text.secondary }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeModuleData = modules.find(m => m.id === activeModule);
  const ActiveComponent = activeModuleData?.component;

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Header Navigation */}
      <div className="border-b sticky top-0 z-40" style={{ 
        background: darkTheme.background.secondary, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 rounded-lg transition-all hover:scale-105 lg:hidden"
                style={{ color: darkTheme.text.secondary }}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <Store className="mr-3" style={{ color: darkTheme.neon.purple }} size={24} />
                <div>
                  <h1 className="text-lg md:text-xl font-bold" style={{ color: darkTheme.text.primary }}>
                    Business Management
                  </h1>
                  <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                    {activeModuleData?.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium" style={{ color: darkTheme.text.primary }}>
                {currentUser.full_name}
              </div>
              <div className="text-xs" style={{ color: darkTheme.text.muted }}>
                {currentUser.user_type.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          {/* Module Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeModule === module.id ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    borderColor: activeModule === module.id ? module.color : 'transparent',
                    color: activeModule === module.id ? module.color : darkTheme.text.secondary
                  }}
                >
                  <Icon size={18} className="mr-2" />
                  <span className="text-sm font-medium">{module.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {/* Background decorations */}
        <div 
          className="absolute top-10 right-10 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-30"
          style={{ background: `radial-gradient(circle, ${activeModuleData?.color || darkTheme.neon.purple}, transparent)` }}
        />
        <div 
          className="absolute bottom-20 left-10 w-16 h-16 rounded-full blur-xl pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${darkTheme.neon.green}, transparent)` }}
        />

        {/* Module Content */}
        <div className="relative z-10">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>

      {/* Quick Action Floating Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ 
            background: `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.pink})`,
            color: darkTheme.text.primary
          }}
        >
          <Settings size={20} className="mx-auto" />
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Ring color fix for unread notifications */
        .ring-1 {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
        
        .ring-opacity-40 {
          --tw-ring-opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
