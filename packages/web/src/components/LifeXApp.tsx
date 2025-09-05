// src/components/LifeXApp.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageCircle, Zap, Camera, Crown, User, Heart } from 'lucide-react';
import { darkTheme } from '../lib/theme';
import { ViewType, Message, Booking } from '../lib/types';
import { mockBookings } from '../lib/mockData';
import { chatService, ChatServiceResponse } from '../lib/chatService';
import { useAuth } from '../lib/hooks/useAuth';

// Import page components
import ChatPage from './pages/ChatPage';
import TrendingPage from './pages/TrendingPage';
import DiscoverPage from './pages/DiscoverPage';
import ColyPage from './pages/ColyPage';
import ProfilePage from './pages/ProfilePage';
import MembershipPlansPage from './pages/MembershipPlansPage';

// 修复：定义响应式容器样式
const getResponsiveContainer = () => ({
  width: '100%',
  maxWidth: 'min(430px, 100vw)',
  margin: '0 auto',
  minHeight: '100vh',
});

const LifeXApp: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  
  // Core state
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isInConversation, setIsInConversation] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  
  // Data state
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?",
      assistant: 'lifex'
    }
  ]);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  // Mock recommendations for demo
  const mockRecommendations = [
    {
      id: 1,
      name: "Café Supreme",
      type: "Coffee & Workspace",
      category: "food",
      rating: 4.8,
      reviews: 234,
      distance: "0.3km",
      price: "$$",
      tags: ["Fast WiFi", "Quiet", "Great Coffee"],
      highlights: ["Fast WiFi", "Quiet", "Great Coffee"],
      aiReason: "Perfect for remote work with excellent coffee and reliable WiFi.",
      phone: "09-555-0123",
      address: "118 Ponsonby Road, Auckland",
      image: "from-amber-400 to-orange-500",
      isOpen: true
    }
  ];

  // Chat handlers
  const handleUserQuery = async (query: string) => {
    const userMessage: Message = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsInConversation(true); // Switch to dedicated conversation mode
    setIsTyping(true);
    
    try {
      // 传递用户ID（如果已登录）
      const userId = user?.id;
      const response: ChatServiceResponse = await chatService.sendMessage(query, userId);
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.message,
        assistant: 'lifex',
        recommendations: response.recommendations
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(response.followUpQuestions || []);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Fallback message
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        assistant: 'lifex'
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    await handleUserQuery(chatInput);
    setChatInput('');
  };

  const handleQuickPrompt = async (prompt: string) => {
    await handleUserQuery(prompt);
  };

  const handleBackToMain = () => {
    setIsInConversation(false);
  };

  const handleNavigateToChat = () => {
    setCurrentView('chat');
  };

  const handleNavigateToMembership = () => {
    setCurrentView('membership');
  };

  const handleNavigateBack = () => {
    setCurrentView('subscription');
  };

  // 修复：使用正确的渐变背景属性
  const containerStyle = {
    ...getResponsiveContainer(),
    background: darkTheme.background.primary, // 改为纯黑色
    WebkitFontSmoothing: 'antialiased' as const,
    textRendering: 'optimizeLegibility' as const
  };

  return (
    <div 
      className="flex flex-col relative overflow-hidden h-screen"
      style={containerStyle}
    >
      {/* Background decorations */}
      <div 
        className="absolute top-[10%] right-[10%] w-16 h-16 md:w-24 md:h-24 rounded-full blur-xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.purple}20, transparent)` }}
      />
      <div 
        className="absolute bottom-[20%] left-[5%] w-12 h-12 md:w-20 md:h-20 rounded-full blur-lg pointer-events-none"
        style={{ background: `radial-gradient(circle, ${darkTheme.neon.green}20, transparent)` }}
      />

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
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: darkTheme.neon.purple }}
            >
              <span className="text-white text-sm md:text-lg font-bold relative z-10">LX</span>
              <div className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-1 h-1 bg-white/30 rounded-full" />
              <div className="absolute bottom-1 left-1 md:bottom-1.5 md:left-1.5 w-1 h-1 bg-white/20 rounded-full" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg flex items-center" style={{ color: darkTheme.text.primary }}>
                Life<span 
                  className="font-extrabold italic text-base md:text-lg ml-0.5"
                  style={{ color: darkTheme.neon.purple }}
                >X</span>
              </h1>
              <p className="text-xs md:text-sm font-medium" style={{ color: darkTheme.text.secondary }}>
                Explore Kiwi's hidden gems with AI
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 rounded-lg transition-colors hover:bg-white/5">
              <Search size={16} className="md:w-5 md:h-5" style={{ color: darkTheme.neon.purple }} />
            </button>
            <button className="p-2 rounded-lg transition-colors hover:bg-white/5">
              <Bell size={16} className="md:w-5 md:h-5" style={{ color: darkTheme.neon.purple }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, background: darkTheme.gradients.background }}>
        {currentView === 'chat' && (
          <ChatPage
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isInConversation={isInConversation}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onQuickPrompt={handleQuickPrompt}
            onBackToMain={handleBackToMain}
            followUpQuestions={followUpQuestions}
          />
        )}

        {currentView === 'trending' && (
          <TrendingPage />
        )}

        {currentView === 'discover' && (
          <DiscoverPage
            selectedServiceCategory={selectedServiceCategory}
            setSelectedServiceCategory={setSelectedServiceCategory}
          />
        )}

        {currentView === 'subscription' && (
          <ColyPage
            onNavigateToChat={handleNavigateToChat}
            onNavigateToMembership={handleNavigateToMembership}
            userType="personal"
          />
        )}

        {currentView === 'membership' && (
          <MembershipPlansPage
            onNavigateBack={handleNavigateBack}
          />
        )}

        {currentView === 'profile' && <ProfilePage />}
      </div>

      {/* Bottom Navigation - Fixed */}
      <div 
        className="p-2 md:p-3 border-t flex-shrink-0"
        style={{
          background: darkTheme.background.card,
          borderColor: darkTheme.background.glass,
        }}
      >
        <div className="flex justify-around">
          {[
            { id: 'chat' as ViewType, icon: MessageCircle, label: 'Chat' },
            { id: 'trending' as ViewType, icon: Zap, label: 'Trending' },
            { id: 'discover' as ViewType, icon: Camera, label: 'Discover' },
            { id: 'subscription' as ViewType, icon: Heart, label: 'Coly' },
            { id: 'profile' as ViewType, icon: User, label: 'Profile' }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className="flex flex-col items-center py-2 md:py-3 px-3 md:px-4 transition-all"
              style={{
                color: currentView === tab.id ? darkTheme.neon.purple : '#9CA3AF',
              }}
              onMouseEnter={(e) => {
                if (currentView !== tab.id) {
                  e.currentTarget.style.color = darkTheme.neon.purple;
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== tab.id) {
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <tab.icon size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
        
        input::placeholder {
          color: ${darkTheme.text.muted} !important;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: ${darkTheme.background.secondary};
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${darkTheme.neon.purple}40;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${darkTheme.neon.purple}60;
        }
        
        /* Responsive scrollbar */
        @media (max-width: 768px) {
          .overflow-y-auto::-webkit-scrollbar {
            width: 2px;
          }
        }

        /* Hide scrollbar on mobile Safari */
        @supports (-webkit-touch-callout: none) {
          .overflow-y-auto {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }

        /* Custom responsive breakpoints */
        @media (min-width: 768px) {
          .container-responsive {
            max-width: 600px;
          }
        }

        @media (min-width: 1024px) {
          .container-responsive {
            max-width: 800px;
          }
        }

        /* Touch optimizations */
        button, input {
          touch-action: manipulation;
        }

        /* Prevent text selection on buttons */
        button {
          -webkit-user-select: none;
          user-select: none;
        }

        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default LifeXApp;