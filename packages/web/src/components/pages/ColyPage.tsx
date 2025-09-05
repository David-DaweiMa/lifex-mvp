// src/components/pages/ColyPage.tsx
import React, { useState } from 'react';
import { 
  MessageCircle,
  Calendar,
  DollarSign,
  MapPin,
  Bell,
  Car,
  Home,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Target,
  TrendingUp
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
  const [expandedDemo, setExpandedDemo] = useState(false);

  // Demo conversation messages
  const [demoMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "Good morning! I've got a few things for you today:\n\n🚗 Your WOF expires on March 15th (in 5 days)\n⚡ Power bill due tomorrow - $142.50\n🌧️ Rain expected this afternoon - bring an umbrella\n\nShall I help you sort the WOF appointment first?",
      assistant: 'coly'
    },
    {
      type: 'user',
      content: "Yes please, find WOF places near me"
    },
    {
      type: 'assistant',
      content: "I've found 3 nearby options based on your location and preferences:\n\n🚗 AA Centre Queen St - Usually quieter mornings\n🚗 VTNZ Penrose - Good reviews, slightly cheaper  \n🚗 VINZ Mt Eden - Closest to your work\n\nRemembering you prefer morning appointments, AA Centre has slots available this Saturday 9am-11am. Want me to set a reminder to call them?",
      assistant: 'coly'
    },
    {
      type: 'user',
      content: "Perfect, set that reminder"
    },
    {
      type: 'assistant',
      content: "Done! I've set a reminder for today 2pm to call AA Centre.\n\n📋 I'll also remind you to:\n• Bring registration papers\n• Check your fuel light (it was low yesterday)\n• Book next year's WOF in February 2025\n\nNow, about that power bill - want me to check if you're on the best rate?",
      assistant: 'coly'
    }
  ]);

  const extendedMessages = [
    ...demoMessages,
    {
      type: 'user',
      content: "Yes, check my power rate"
    },
    {
      type: 'assistant',
      content: "I've compared your current Contact Energy plan with 5 other providers:\n\n💡 Mercury Energy could save you $23/month\n💡 Electric Kiwi has a better night rate for your usage pattern\n\nYour last 3 months show you use more power 7pm-11pm (Netflix & heating). Electric Kiwi's 'Hour of Power' could work well for you.\n\nI'll keep monitoring and alert you when better deals appear. Also - I noticed you've been asking about WOF every few months. Want me to just handle all your car reminders automatically?",
      assistant: 'coly'
    }
  ];

  const valuePropositions = [
    {
      icon: Target,
      title: "Save 8+ Hours Per Week",
      description: "Automatic bill payments, appointment booking, and deadline tracking",
      stat: "8 hours",
      statLabel: "saved weekly",
      color: "primary"
    },
    {
      icon: DollarSign,
      title: "Save $200+ Per Month",
      description: "Find better deals on power, insurance, fuel, and everyday purchases",
      stat: "$200+",
      statLabel: "saved monthly",
      color: "yellow"
    },
    {
      icon: TrendingUp,
      title: "98% Never Miss Deadlines",
      description: "Smart reminders for WOF, rego, rates, insurance, and all Kiwi essentials",
      stat: "98%",
      statLabel: "success rate",
      color: "blue"
    }
  ];

  const kiwiBenefits = [
    {
      icon: Car,
      title: "Never Miss WOF or Rego",
      description: "Automatic reminders for car registration, WOF, and insurance",
      example: "WOF expires in 2 weeks - 3 nearby stations found",
      color: "primary"
    },
    {
      icon: DollarSign,
      title: "Save Money Like a Local",
      description: "Track spending, find deals, optimize your KiwiSaver",
      example: "Fuel cheaper at BP Newmarket - save $8 this week",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Manage NZ Life",
      description: "School terms, public holidays, family schedules",
      example: "School holidays start Monday - 47 activities nearby",
      color: "yellow"
    },
    {
      icon: MapPin,
      title: "Local Knowledge",
      description: "Weather alerts, traffic, events, and recommendations",
      example: "Rain expected - indoor activities for the kids?",
      color: "primary"
    }
  ];

  const dailyScenarios = [
    {
      time: "7:00 AM",
      title: "Morning Brief",
      content: "Good morning! Auckland traffic is heavy on the Southern Motorway. Leave 15 minutes early for work. Your power bill is due tomorrow - shall I pay it?",
      icon: "🌅"
    },
    {
      time: "12:30 PM", 
      title: "Lunch Break",
      content: "That new cafe on Ponsonby Road has great reviews for coffee. Only a 3-minute walk from your office. Want directions?",
      icon: "☕"
    },
    {
      time: "4:00 PM",
      title: "Family Time",
      content: "Kids finish school in 30 minutes. Soccer practice is cancelled due to wet fields - pickup at 3:30 instead. Emma's friend's mum can give her a ride home.",
      icon: "🏫"
    },
    {
      time: "6:30 PM",
      title: "Evening Planning", 
      content: "Weekend looks sunny! Mission Bay farmers market on Saturday, or Cornwall Park for a family walk? Both dog-friendly if you bring Max.",
      icon: "🌤️"
    }
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: `${darkTheme.neon.green}20` }}
            >
              <MessageCircle size={32} style={{ color: darkTheme.neon.green }} />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
              Meet Coly
            </h1>
            <p className="text-xl mb-2" style={{ color: darkTheme.text.secondary }}>
              Your Digital Helper for New Zealand Life
            </p>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: darkTheme.text.muted }}>
              Never miss another WOF, forget a bill payment, or miss out on a good deal. 
              Coly keeps track of the things that matter in New Zealand - so you don't have to.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Never Miss", value: "WOF & Rego", color: "primary" },
              { label: "Stay On Top", value: "Bills & Tasks", color: "blue" },
              { label: "Find Deals", value: "Save Money", color: "yellow" },
              { label: "Built Local", value: "NZ Data", color: "primary" }
            ].map((stat: any, index: any) => (
              <div 
                key={index}
                className="p-4 rounded-lg border text-center"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <div className="font-bold text-lg" style={{ color: darkTheme.neon.green }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: darkTheme.text.muted }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                document.getElementById('demo-section')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{ background: darkTheme.neon.green, color: 'white' }}
            >
              <MessageCircle size={20} />
              See How It Works
            </button>
            <button 
              onClick={onNavigateToChat}
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border"
              style={{ 
                background: 'transparent', 
                color: darkTheme.neon.green,
                borderColor: darkTheme.neon.green
              }}
            >
              <MessageCircle size={20} />
              Try Coly Now
            </button>
          </div>
        </div>

        {/* Extended Demo Section */}
        <div id="demo-section" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: darkTheme.text.primary }}>
            See How Coly Works
          </h2>
          <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: darkTheme.text.muted }}>
            Simple, practical help for everyday New Zealand tasks
          </p>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
                Chat with Coly
              </h3>
              <div 
                className="p-6 rounded-2xl border overflow-y-auto"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                  height: expandedDemo ? '500px' : '350px'
                }}
              >
                <div className="space-y-4">
                  {(expandedDemo ? extendedMessages : demoMessages).map((message: any, index: any) => (
                    <div key={index} className="flex flex-col">
                      {message.type === 'user' ? (
                        <div className="flex justify-end">
                          <div 
                            className="px-4 py-3 rounded-2xl rounded-br-md max-w-xs text-sm"
                            style={{ 
                              background: darkTheme.neon.green, 
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
                            style={{ background: darkTheme.neon.green }}
                          >
                            <span className="text-white text-sm font-bold">C</span>
                          </div>
                          <div 
                            className="px-4 py-3 rounded-2xl rounded-tl-md max-w-md"
                            style={{
                              background: darkTheme.background.primary,
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
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setExpandedDemo(!expandedDemo)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  style={{ 
                    color: darkTheme.neon.green,
                    background: `${darkTheme.neon.green}10`
                  }}
                >
                  {expandedDemo ? 'Show Less' : 'See More Examples'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
                What Coly Does
              </h3>
              <div className="space-y-4">
                {kiwiBenefits.map((benefit: any, index: any) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ background: `${darkTheme.neon.green}20` }}
                      >
                        <benefit.icon size={20} style={{ color: darkTheme.neon.green }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: darkTheme.text.primary }}>
                          {benefit.title}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: darkTheme.text.muted }}>
                          {benefit.description}
                        </p>
                        <p className="text-xs italic" style={{ color: darkTheme.text.secondary }}>
                          Example: "{benefit.example}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* A Day with Coly */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: darkTheme.text.primary }}>
            A Complete Day with Coly
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: darkTheme.text.muted }}>
            Experience how Coly seamlessly integrates into your New Zealand lifestyle
          </p>
          
          <div className="space-y-6">
            {dailyScenarios.map((scenario: any, index: any) => (
              <div 
                key={index}
                className="p-6 rounded-xl border"
                style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-2xl mb-2">{scenario.icon}</div>
                    <div 
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ 
                        background: `${darkTheme.neon.green}20`,
                        color: darkTheme.neon.green 
                      }}
                    >
                      {scenario.time}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                      {scenario.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: darkTheme.text.muted }}>
                      {scenario.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: darkTheme.text.primary }}>
            Choose Your Plan
          </h2>
          <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: darkTheme.text.muted }}>
            Start with a 14-day free trial. No commitment, cancel anytime.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Essential Plan */}
            <div 
              className="p-6 rounded-2xl border relative transform scale-105"
              style={{
                background: `${darkTheme.neon.green}10`,
                borderColor: darkTheme.neon.green,
                borderWidth: '2px'
              }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span 
                  className="px-4 py-1 rounded-full text-xs font-bold"
                  style={{ 
                    background: darkTheme.neon.green, 
                    color: 'white' 
                  }}
                >
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                  Essential
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold" style={{ color: darkTheme.neon.green }}>
                    $9.90
                  </span>
                  <span style={{ color: darkTheme.text.muted }}>/month</span>
                </div>
                <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                  Perfect for personal use
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    <strong>Coly personal assistant</strong> (50 calls/hour)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    NZ-specific reminders (WOF, rego, rates)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Weather & traffic alerts
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Basic platform access (100 products max)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Priority support
                  </span>
                </div>
              </div>

              <button 
                onClick={onNavigateToMembership}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 mb-3"
                style={{ 
                  background: darkTheme.neon.green,
                  color: 'white'
                }}
              >
                Start 14-Day Free Trial
              </button>
              <p className="text-xs text-center" style={{ color: darkTheme.text.muted }}>
                Free for 14 days • Cancel anytime
              </p>
            </div>

            {/* Premium Plan */}
            <div 
              className="p-6 rounded-2xl border"
              style={{
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
              }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                  Premium
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold" style={{ color: darkTheme.neon.green }}>
                    $19.90
                  </span>
                  <span style={{ color: darkTheme.text.muted }}>/month</span>
                </div>
                <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                  Full access to everything
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    <strong>Coly personal assistant</strong> (50 calls/hour)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    <strong>Max business assistant</strong> (50 calls/hour)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Advanced business tools (1000 products max)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Enhanced trending content (200 posts/month)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: darkTheme.neon.green }} />
                  <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                    Priority support & advanced analytics
                  </span>
                </div>
              </div>

              <button 
                onClick={onNavigateToMembership}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 mb-3"
                style={{ 
                  background: 'transparent',
                  color: darkTheme.neon.green,
                  border: `1px solid ${darkTheme.neon.green}`
                }}
              >
                Start 14-Day Free Trial
              </button>
              <p className="text-xs text-center" style={{ color: darkTheme.text.muted }}>
                Free for 14 days • Cancel anytime
              </p>
            </div>
          </div>

          {/* Free vs Paid Distinction */}
          <div className="mt-8 text-center">
            <div 
              className="inline-block p-4 rounded-lg border"
              style={{
                background: `${darkTheme.neon.blue}10`,
                borderColor: darkTheme.neon.blue
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                Free Users
              </h4>
              <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                Access to platform features but <strong>no AI assistant access</strong>.<br/>
                Upgrade to Essential or Premium to unlock Coly's smart assistance.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: darkTheme.text.muted }}>
              <strong>All plans include:</strong> 14-day free trial • Cancel anytime • No long-term contracts
            </p>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: darkTheme.text.primary }}>
            Built for New Zealand
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${darkTheme.neon.green}20` }}
              >
                <Shield size={32} style={{ color: darkTheme.neon.green }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                Your Data Stays Local
              </h3>
              <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                All your information is stored securely in New Zealand. We never share your personal details with anyone.
              </p>
            </div>

            <div className="text-center p-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${darkTheme.neon.blue}20` }}
              >
                <MapPin size={32} style={{ color: darkTheme.neon.blue }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                Kiwi Team & Support
              </h3>
              <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                Built by New Zealanders who understand local needs. Get help from our Auckland-based team.
              </p>
            </div>

            <div className="text-center p-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                 style={{ background: `${darkTheme.neon.yellow}20` }}
               >
                 <Zap size={32} style={{ color: darkTheme.neon.yellow }} />
               </div>
               <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                 Simple & Reliable
               </h3>
               <p className="text-sm" style={{ color: darkTheme.text.muted }}>
                 No complicated setup. Just practical reminders and helpful suggestions that actually work.
               </p>
             </div>
           </div>
         </div>
 
         {/* Final CTA */}
         <div className="text-center">
           <div 
             className="p-8 rounded-2xl border max-w-3xl mx-auto"
             style={{
               background: `${darkTheme.neon.green}15`,
               borderColor: `${darkTheme.neon.green}30`,
             }}
           >
             <h2 className="text-3xl font-bold mb-4" style={{ color: darkTheme.text.primary }}>
               Ready for a Smarter Kiwi Life?
             </h2>
             <p className="text-lg mb-6" style={{ color: darkTheme.text.muted }}>
               Join thousands of New Zealanders who use Coly to stay organized and save time.
             </p>
             
             <div className="flex justify-center gap-4">
               <button 
                 onClick={onNavigateToMembership}
                 className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                 style={{ background: darkTheme.neon.green, color: 'white' }}
               >
                 <MessageCircle size={20} />
                 Start Your 14-Day Free Trial
               </button>
               <button 
                 onClick={onNavigateToChat}
                 className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border"
                 style={{ 
                   background: 'transparent', 
                   color: darkTheme.neon.green,
                   borderColor: darkTheme.neon.green
                 }}
               >
                 <MessageCircle size={20} />
                 Try Coly Now
               </button>
             </div>
 
             <p className="text-sm mt-4" style={{ color: darkTheme.text.muted }}>
               Start your free trial today • No charges for 14 days • Cancel anytime
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default ColyPage;
