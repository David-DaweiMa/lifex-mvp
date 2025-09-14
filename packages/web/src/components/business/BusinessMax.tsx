// src/components/business/BusinessMax.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Mic, 
  ArrowLeft, 
  Sparkles,
  Briefcase,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { Message } from '@lifex/shared';
import { useAuth } from '../../lib/hooks/useAuth';
import { checkAssistantPermission, getAssistantIcon, getAssistantColor, getAssistantDescription } from '../../lib/assistantPermissions';
import { AssistantType } from '../../lib/assistantPermissions';

const BusinessMax: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInConversation, setIsInConversation] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [quota, setQuota] = useState<{
    current: number;
    limit: number;
    remaining: number;
    resetTime?: string;
  } | null>(null);
  const [warning, setWarning] = useState<string>('');

  // Check user permissions
  const subscriptionLevel = user?.subscription_level || 'free';
  const maxPermission = checkAssistantPermission('max', subscriptionLevel as any);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && maxPermission.canUse) {
      const welcomeMessage: Message = {
        type: 'assistant',
        content: `G'day boss! I'm Max, your business growth expert! 💼\n\nI'm here to help you scale your business, optimize operations, and boost your revenue. What's your biggest business challenge today?`,
        assistant: 'max'
      };
      setMessages([welcomeMessage]);
    }
  }, [maxPermission.canUse]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;

    const userMessage: Message = {
      type: 'user',
      content: chatInput
    };

    setMessages(prev => [...prev, userMessage]);
    setIsInConversation(true);
    setIsTyping(true);
    setChatInput('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          userId: user.id,
          sessionId: 'max-session',
          assistantType: 'max'
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const assistantMessage: Message = {
          type: 'assistant',
          content: data.data.message,
          assistant: 'max',
          recommendations: data.data.recommendations
        };

        setMessages(prev => [...prev, assistantMessage]);
        setFollowUpQuestions(data.data.followUpQuestions || []);
        
        // Update quota info
        if (data.data.quota) {
          setQuota(data.data.quota);
        }
        
        // Show warning if approaching limit
        if (data.data.warning) {
          setWarning(data.data.warning);
          setTimeout(() => setWarning(''), 5000);
        }
      } else {
        // Handle limit reached or permission denied
        const errorMessage: Message = {
          type: 'assistant',
          content: data.error || 'Sorry, I\'m having trouble right now. Please try again later.',
          assistant: 'max'
        };
        setMessages(prev => [...prev, errorMessage]);
        
        if (data.data?.quota) {
          setQuota(data.data.quota);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        assistant: 'max'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleBackToMain = () => {
    setIsInConversation(false);
  };

  const renderMessage = (message: Message, index: number) => (
    <div key={index} className="mb-6">
      {message.type === 'user' ? (
        <div className="flex justify-end">
          <div className="bg-lifex-green text-white rounded-2xl rounded-br-md px-3 py-2 max-w-xs text-sm md:text-base md:max-w-md">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: getAssistantColor('max') }}
          >
            <span className="text-white text-sm md:text-lg font-bold">
              {getAssistantIcon('max')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-dark-card border border-dark-glass rounded-2xl rounded-tl-md px-3 py-2">
              <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Show upgrade prompt if user can't use Max
  if (!maxPermission.canUse) {
    return (
      <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary }}>
        <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8">
          <div className="relative z-10 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center mb-6">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mr-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${darkTheme.neon.green}, ${darkTheme.neon.cyan})`,
                    boxShadow: `0 0 30px ${darkTheme.neon.green}40`
                  }}
                >
                  <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                    Max
                  </h1>
                  <p className="text-lg md:text-xl" style={{ color: darkTheme.neon.green }}>
                    Your Business Growth Expert
                  </p>
                </div>
              </div>
              
              {/* Upgrade Required */}
              <div 
                className="p-6 rounded-xl border mb-8 text-center"
                style={{
                  background: `${darkTheme.neon.green}10`,
                  borderColor: `${darkTheme.neon.green}30`,
                }}
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.green }} />
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Premium Required
                </h3>
                <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
                  {maxPermission.upgradeMessage}
                </p>
                <button 
                  className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: darkTheme.neon.green, color: 'white' }}
                >
                  Upgrade to Premium
                </button>
              </div>

              {/* Feature showcase */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {maxPermission.features.map((feature: any, index: any) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl border text-center"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ 
                        background: `${darkTheme.neon.green}20`, 
                        color: darkTheme.neon.green,
                      }}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: darkTheme.text.muted }}>
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  if (isInConversation) {
    return (
      <div className="h-full flex flex-col bg-gradient-background">
        {/* Conversation Header */}
        <div className="p-4 md:p-6 border-b border-dark-glass bg-dark-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBackToMain}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft size={20} className="text-lifex-green" />
              </button>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: getAssistantColor('max') }}
                >
                  <span className="text-white text-sm font-bold">
                    {getAssistantIcon('max')}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-base md:text-lg text-text-primary">Max</h2>
                  <p className="text-xs md:text-sm text-text-secondary">Your business growth expert</p>
                </div>
              </div>
            </div>
            
            {/* Quota indicator */}
            {quota && (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock size={12} />
                <span>{quota.current}/{quota.limit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning message */}
        {warning && (
          <div className="p-3 bg-yellow-500/20 border-b border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertCircle size={14} />
              <span>{warning}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((message: any, index: any) => renderMessage(message, index))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: getAssistantColor('max') }}
                >
                  <span className="text-white text-sm md:text-lg font-bold">
                    {getAssistantIcon('max')}
                  </span>
                </div>
                <div className="bg-dark-card border border-dark-glass rounded-2xl rounded-tl-md px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-lifex-green rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-lifex-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-lifex-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Follow-up Questions */}
            {!isTyping && followUpQuestions.length > 0 && (
              <div className="mt-6">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: getAssistantColor('max') }}
                  >
                    <span className="text-white text-sm md:text-lg font-bold">💡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-text-secondary mb-3">You might also want to ask:</p>
                    <div className="flex flex-wrap gap-2">
                      {followUpQuestions.map((question: any, index: any) => (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(question)}
                          className="px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-105 bg-dark-card border border-dark-glass text-text-primary hover:bg-lifex-green hover:border-lifex-green hover:text-white"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 border-t border-dark-glass bg-dark-card">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Plus size={20} className="text-lifex-green" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Max about your business strategy..."
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-green transition-colors"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-3 rounded-xl bg-lifex-green text-white hover:bg-lifex-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
              <button className="p-3 rounded-xl border border-dark-glass hover:bg-white/5 transition-colors">
                <Mic size={18} className="text-lifex-green" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen
  return (
    <div className="h-full overflow-y-auto bg-gradient-background pb-20">
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* Welcome Message */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start gap-3 mb-6">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: getAssistantColor('max') }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 text-text-primary">
                  G'day boss! I'm Max
                </h1>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed">
                  {getAssistantDescription('max')}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Plus size={20} className="text-lifex-green" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about your business strategy..."
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-green transition-colors"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-3 rounded-xl bg-lifex-green text-white hover:bg-lifex-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
              <button className="p-3 rounded-xl border border-dark-glass hover:bg-white/5 transition-colors">
                <Mic size={18} className="text-lifex-green" />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mb-16 md:mb-20">
            <h2 className="font-semibold mb-2 text-base md:text-lg text-text-primary">Business Questions</h2>
            <div className="space-y-1">
              {[
                ['How can I increase revenue?', 'Help me optimize operations', 'What\'s my market opportunity?'],
                ['How to acquire more customers?', 'Analyze my competition', 'Improve my pricing strategy']
              ].map((row: any, rowIdx: any) => (
                <div key={rowIdx} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {row.map((prompt: any, idx: any) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-105 whitespace-nowrap flex-shrink-0 bg-dark-card border border-dark-glass text-text-primary hover:bg-lifex-green hover:border-lifex-green hover:text-white"
                      style={{ minWidth: 'fit-content' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Business Insights Cards */}
          <div className="mb-8">
            <h2 className="font-semibold mb-4 text-base md:text-lg text-text-primary">Business Insights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: TrendingUp, label: 'Growth Strategy', color: darkTheme.neon.green },
                { icon: Target, label: 'Market Analysis', color: darkTheme.neon.cyan },
                { icon: DollarSign, label: 'Revenue Optimization', color: darkTheme.neon.yellow },
                { icon: Users, label: 'Customer Acquisition', color: darkTheme.neon.pink }
              ].map((insight: any, index: any) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border text-center transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ 
                      background: `${insight.color}20`, 
                      color: insight.color,
                    }}
                  >
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: darkTheme.text.primary }}>
                    {insight.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quota Info */}
          {quota && (
            <div className="mb-8">
              <div 
                className="p-4 rounded-xl border text-center"
                style={{
                  background: `${darkTheme.neon.green}10`,
                  borderColor: `${darkTheme.neon.green}30`,
                }}
              >
                <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: darkTheme.neon.green }} />
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                  You've used {quota.current} of {quota.limit} messages this hour
                </p>
                {quota.resetTime && (
                  <p className="text-xs mt-1" style={{ color: darkTheme.text.muted }}>
                    Resets at {new Date(quota.resetTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessMax;
