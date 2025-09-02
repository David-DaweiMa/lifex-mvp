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
  Star,
  Briefcase,
  BarChart3
} from 'lucide-react';

// Import the business components
import BusinessDashboard from '@/components/business/BusinessDashboard';
import BusinessAdvanced from '@/components/business/BusinessAdvanced';
import BusinessSpecials from '@/components/business/BusinessSpecials';
import BusinessMax from '@/components/business/BusinessMax';
import QuotaDisplay from '@/components/business/QuotaDisplay';

// Import existing theme and auth
import { darkTheme } from '@/lib/theme';
import { useAuth } from '@/lib/hooks/useAuth';

// Types for the dashboard
interface DashboardModule {
  id: 'core' | 'media' | 'specials' | 'max' | 'quota';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  component: React.ComponentType;
  description: string;
}

export default function BusinessDashboardPage() {
  // Real auth integration
  const { user: currentUser } = useAuth();

  const [activeModule, setActiveModule] = useState<DashboardModule['id']>('core');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is business account
  const isBusinessUser = currentUser && currentUser.has_business_features;

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
    },
    { 
      id: 'max', 
      label: 'Max Assistant', 
      icon: Briefcase, 
      color: darkTheme.neon.cyan,
      component: BusinessMax,
      description: 'Business growth expert'
    },
    { 
      id: 'quota', 
      label: 'Quota & Usage', 
      icon: BarChart3, 
      color: darkTheme.neon.yellow,
      component: QuotaDisplay,
      description: 'Usage limits and quotas'
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ color: darkTheme.text.secondary }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: darkTheme.text.primary }}>
                  Business Dashboard
                </h1>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  Welcome back, {currentUser.full_name || currentUser.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ 
                background: `${darkTheme.neon.green}20`,
                color: darkTheme.neon.green 
              }}>
                <Star size={14} />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 border-r transform ${
        sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
        style={{ 
          background: darkTheme.background.secondary, 
          borderColor: darkTheme.background.glass 
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: darkTheme.background.glass }}>
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: `${darkTheme.neon.purple}20` }}
            >
              <Store style={{ color: darkTheme.neon.purple }} size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: darkTheme.text.primary }}>
                Business Hub
              </h2>
              <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                {currentUser.subscription_level}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeModule === module.id ? 
                    'transform scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    background: activeModule === module.id ? `${module.color}20` : 'transparent',
                    borderColor: activeModule === module.id ? module.color : 'transparent',
                    color: activeModule === module.id ? module.color : darkTheme.text.secondary,
                    border: activeModule === module.id ? `1px solid ${module.color}30` : '1px solid transparent'
                  }}
                >
                  <Icon size={18} className="mr-3" />
                  <div>
                    <div className="text-sm font-medium">{module.label}</div>
                    <div className="text-xs opacity-75">{module.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-64">
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
          <div className="relative z-10 p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
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