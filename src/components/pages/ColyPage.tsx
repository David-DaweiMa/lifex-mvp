// src/components/pages/ColyPage.tsx
import React, { useState } from 'react';
import { 
  Heart,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Utensils,
  TrendingUp,
  Star,
  Clock,
  ArrowRight
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { Message } from '../../lib/types';
import { useAuth } from '../../lib/hooks/useAuth';
import { getAssistantIcon, getAssistantColor } from '../../lib/assistantPermissions';

interface ColyPageProps {
  onNavigateToChat: () => void;
  onNavigateToMembership: () => void;
  userType?: 'personal' | 'business';
}

const ColyPage: React.FC<ColyPageProps> = ({
  onNavigateToChat,
  onNavigateToMembership,
  userType = 'personal'
}) => {
  const { user } = useAuth();

  // Demo conversation messages
  const [demoMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "G'day! I'm Coly, your personal life assistant! 🌟\n\nI'm here to help you plan your day, find local recommendations, and make life a little easier. What would you like to do today?",
      assistant: 'coly'
    },
    {
      type: 'user',
      content: "Help me plan my day"
    },
    {
      type: 'assistant',
      content: "Perfect! Let me check your schedule and the weather...\n\n🌤️ Today's forecast: 18°C, partly cloudy\n\n📅 Your day:\n• 9:00 AM - Work meeting\n• 12:00 PM - Lunch break\n• 4:30 PM - Kids' soccer practice\n• 7:00 PM - Dinner plans\n\n💡 Smart suggestions:\n• Your car WOF expires next week - I can book an inspection\n• Your favorite café has a lunch special today\n• I found parking near the soccer field\n\nWould you like me to help with any of these?",
      assistant: 'coly'
    }
  ]);

  // Value statistics
  const [valueStats] = useState({
    monthlySavings: 150,
    timeSaved: 20,
    tasksCompleted: 0,
    familyCoordination: 'Perfect'
  });

  // Core features - simplified to 4 key features
  const features = [
    {
      icon: Calendar,
      title: "智能日程",
      description: "自动整合安排，智能提醒",
      color: "pink"
    },
    {
      icon: DollarSign,
      title: "省钱推荐",
      description: "个性化优惠，消费分析",
      color: "green"
    },
    {
      icon: Users,
      title: "家庭管理",
      description: "全家共享助手，多人日程",
      color: "blue"
    },
    {
      icon: CheckCircle,
      title: "代办提醒",
      description: "WOF/保险，自动预约",
      color: "purple"
    }
  ];

  // Usage scenarios - simplified to 2 key moments
  const scenarios = [
    {
      time: "7:30 AM",
      content: "早安！今天有小雨，记得带伞。你的车WOF下周到期，我帮你预约了周六上午9点的检查。",
      icon: "🌅"
    },
    {
      time: "12:00 PM",
      content: "你常去的咖啡店今天有午餐特价，$15牛油果鸡肉沙拉+咖啡，离你办公室5分钟路程。",
      icon: "🍽️"
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-background pb-20">
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8">
        <div className="relative z-10 max-w-5xl mx-auto">
          
          {/* Hero Section - Simplified */}
          <div className="text-center mb-12 md:mb-16">
            <div className="mb-8">
              <div className="text-left max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3" style={{ color: darkTheme.text.primary }}>
                  Meet Coly
                </h1>
                <p className="text-xl md:text-2xl mb-4" style={{ color: darkTheme.neon.pink }}>
                  Your Personal Life Assistant
                </p>
                <p className="text-lg md:text-xl mb-8" style={{ color: darkTheme.text.secondary }}>
                  "Stop managing life. Start living it."
                </p>
              </div>
            </div>
          </div>

          {/* Value Demonstration Section - Simplified */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Left: Demo Conversation */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6" style={{ color: darkTheme.text.primary }}>
                Experience Coly
              </h2>
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  minHeight: '350px'
                }}
              >
                {demoMessages.map((message, index) => (
                  <div key={index} className="mb-4">
                    {message.type === 'user' ? (
                      <div className="flex justify-end">
                        <div 
                          className="px-4 py-2 rounded-2xl rounded-br-md max-w-xs text-sm"
                          style={{ 
                            background: darkTheme.neon.purple, 
                            color: 'white' 
                          }}
                        >
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: getAssistantColor('coly') }}
                        >
                          <span className="text-white text-sm font-bold">
                            {getAssistantIcon('coly')}
                          </span>
                        </div>
                        <div 
                          className="px-4 py-2 rounded-2xl rounded-tl-md max-w-md"
                          style={{
                            background: darkTheme.background.secondary,
                            border: `1px solid ${darkTheme.background.glass}`
                          }}
                        >
                          <p className="text-sm whitespace-pre-wrap" style={{ color: darkTheme.text.primary }}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Value Statistics - Simplified */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: darkTheme.text.primary }}>
                What Coly Saves You
              </h2>
              
              {/* Stats Grid - Simplified to 2x2 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className="p-6 rounded-xl border text-center"
                  style={{
                    background: `${darkTheme.neon.green}10`,
                    borderColor: `${darkTheme.neon.green}30`,
                  }}
                >
                  <DollarSign className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.green }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: darkTheme.text.primary }}>
                    ${valueStats.monthlySavings}+
                  </div>
                  <div className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    平均每月节省
                  </div>
                </div>
                
                <div 
                  className="p-6 rounded-xl border text-center"
                  style={{
                    background: `${darkTheme.neon.blue}10`,
                    borderColor: `${darkTheme.neon.blue}30`,
                  }}
                >
                  <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.blue }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: darkTheme.text.primary }}>
                    {valueStats.timeSaved}+
                  </div>
                  <div className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    时间节省(小时)
                  </div>
                </div>
                
                <div 
                  className="p-6 rounded-xl border text-center"
                  style={{
                    background: `${darkTheme.neon.purple}10`,
                    borderColor: `${darkTheme.neon.purple}30`,
                  }}
                >
                  <CheckCircle className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.purple }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: darkTheme.text.primary }}>
                    {valueStats.tasksCompleted}
                  </div>
                  <div className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    代办事项遗漏
                  </div>
                </div>
                
                <div 
                  className="p-6 rounded-xl border text-center"
                  style={{
                    background: `${darkTheme.neon.pink}10`,
                    borderColor: `${darkTheme.neon.pink}30`,
                  }}
                >
                  <Users className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.pink }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: darkTheme.text.primary }}>
                    {valueStats.familyCoordination}
                  </div>
                  <div className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    家庭协调
                  </div>
                </div>
              </div>

              {/* User Feedback - Simplified */}
              <div 
                className="p-6 rounded-xl border"
                style={{
                  background: `${darkTheme.neon.yellow}10`,
                  borderColor: `${darkTheme.neon.yellow}30`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm mb-2" style={{ color: darkTheme.text.primary }}>
                      "Coly帮我每月省了$200，还帮我记住了所有重要事项"
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className="text-yellow-500 fill-yellow-500" />
                      ))}
                      <span className="text-xs ml-2" style={{ color: darkTheme.text.muted }}>
                        - Sarah M.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase - Simplified to 2x2 grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: darkTheme.text.primary }}>
              How Coly Works
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border text-center transition-all hover:scale-105"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      background: `${darkTheme.neon[feature.color as keyof typeof darkTheme.neon]}20`,
                      color: darkTheme.neon[feature.color as keyof typeof darkTheme.neon],
                    }}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Scenarios - Simplified to 2 scenarios */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: darkTheme.text.primary }}>
              A Day with Coly
            </h2>
            <div className="space-y-6">
              {scenarios.map((scenario, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">{scenario.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: darkTheme.neon.purple }}>
                          {scenario.time}
                        </span>
                        <span className="text-sm" style={{ color: darkTheme.text.secondary }}>
                          Coly Assistant
                        </span>
                      </div>
                      <p className="text-base" style={{ color: darkTheme.text.primary }}>
                        {scenario.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action - Simplified */}
          <div className="text-center">
            <div 
              className="p-8 rounded-2xl border"
              style={{
                background: `${darkTheme.neon.purple}10`,
                borderColor: `${darkTheme.neon.purple}30`,
              }}
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
                Ready to Transform Your Life?
              </h2>
              <p className="text-lg mb-4" style={{ color: darkTheme.text.secondary }}>
                Start your 2-week free trial today and experience the difference Coly can make in your daily life.
              </p>
              <p className="text-sm mb-6" style={{ color: darkTheme.text.muted }}>
                Cancel anytime after your free trial ends. No commitment required.
              </p>
              <button 
                onClick={onNavigateToMembership}
                className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                style={{ background: darkTheme.neon.purple, color: 'white' }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColyPage;
