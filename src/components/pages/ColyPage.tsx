// src/components/pages/ColyPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Mic, 
  ArrowLeft, 
  Star, 
  Phone, 
  MapPin, 
  Sparkles,
  Heart,
  Calendar,
  Coffee,
  Home,
  Info,
  Crown,
  AlertCircle,
  Clock
} from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { Message } from '../../lib/types';
import { useAuth } from '../../lib/hooks/useAuth';
import { checkAssistantPermission, getAssistantIcon, getAssistantColor, getAssistantDescription } from '../../lib/assistantPermissions';
import { AssistantType } from '../../lib/assistantPermissions';

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
  const colyPermission = checkAssistantPermission('coly', subscriptionLevel as any);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && colyPermission.canUse) {
      const welcomeMessage: Message = {
        type: 'assistant',
        content: `G'day! I'm Coly, your personal life assistant! 🌟\n\nI'm here to help you plan your day, find local recommendations, and make life a little easier. What would you like to do today?`,
        assistant: 'coly'
      };
      setMessages([welcomeMessage]);
    }
  }, [colyPermission.canUse]);

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
          sessionId: 'coly-session',
          assistantType: 'coly'
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const assistantMessage: Message = {
          type: 'assistant',
          content: data.data.message,
          assistant: 'coly',
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
          assistant: 'coly'
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
        assistant: 'coly'
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
          <div className="bg-lifex-purple text-white rounded-2xl rounded-br-md px-3 py-2 max-w-xs text-sm md:text-base md:max-w-md">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: getAssistantColor('coly') }}
          >
            <span className="text-white text-sm md:text-lg font-bold">
              {getAssistantIcon('coly')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-dark-card border border-dark-glass rounded-2xl rounded-tl-md px-3 py-2">
              <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {message.recommendations && (
              <div className="mt-4 space-y-4">
                {message.recommendations.map(rec => (
                  <div 
                    key={rec.id} 
                    className="bg-dark-card border border-dark-glass rounded-xl overflow-hidden"
                  >
                    <div className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm md:text-base mb-1 truncate text-text-primary">{rec.name}</h4>
                          <p className="text-xs md:text-sm text-text-secondary">{rec.type}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Star size={12} className="text-lifex-yellow fill-lifex-yellow" />
                            <span className="font-medium text-xs md:text-sm text-text-primary">{rec.rating}</span>
                            <span className="text-xs text-text-muted">({rec.reviews})</span>
                          </div>
                          <p className="font-medium text-xs md:text-sm text-lifex-green">{rec.price}</p>
                        </div>
                      </div>

                      <div className="bg-lifex-purple/20 border border-lifex-purple/40 rounded-lg p-2.5 mb-3">
                        <p className="text-xs md:text-sm text-text-primary mb-2">{rec.aiReason}</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.tags.map((tag, tagIdx) => (
                            <span 
                              key={tagIdx}
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                color: '#a855f7',
                                border: '1px solid rgba(168, 85, 247, 0.4)'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 text-xs md:text-sm text-text-secondary hover:text-lifex-purple transition-colors">
                            <Phone size={12} className="md:w-3 md:h-3" />
                            <span>{rec.phone}</span>
                          </button>
                          <button className="flex items-center gap-1 text-xs md:text-sm text-text-secondary hover:text-lifex-purple transition-colors">
                            <MapPin size={12} className="md:w-3 md:h-3" />
                            <span className="truncate">{rec.distance}</span>
                          </button>
                        </div>
                        <button className="px-3 py-1.5 bg-lifex-purple text-white rounded-lg text-xs md:text-sm font-medium hover:bg-lifex-purple/90 transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Show upgrade prompt if user can't use Coly
  if (!colyPermission.canUse) {
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
              
              {/* Upgrade Required */}
              <div 
                className="p-6 rounded-xl border mb-8 text-center"
                style={{
                  background: `${darkTheme.neon.purple}10`,
                  borderColor: `${darkTheme.neon.purple}30`,
                }}
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: darkTheme.neon.purple }} />
                <h3 className="font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
                  Upgrade Required
                </h3>
                <p className="text-sm mb-4" style={{ color: darkTheme.text.secondary }}>
                  {colyPermission.upgradeMessage}
                </p>
                <button 
                  onClick={onNavigateToMembership}
                  className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: darkTheme.neon.purple, color: 'white' }}
                >
                  View Membership Plans
                </button>
              </div>

              {/* Feature showcase */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {colyPermission.features.map((feature, index) => (
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
                        background: `${darkTheme.neon.pink}20`, 
                        color: darkTheme.neon.pink,
                      }}
                    >
                      <Heart className="w-5 h-5" />
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
                <ArrowLeft size={20} className="text-lifex-purple" />
              </button>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: getAssistantColor('coly') }}
                >
                  <span className="text-white text-sm font-bold">
                    {getAssistantIcon('coly')}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-base md:text-lg text-text-primary">Coly</h2>
                  <p className="text-xs md:text-sm text-text-secondary">Your personal life assistant</p>
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
            {messages.map((message, index) => renderMessage(message, index))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: getAssistantColor('coly') }}
                >
                  <span className="text-white text-sm md:text-lg font-bold">
                    {getAssistantIcon('coly')}
                  </span>
                </div>
                <div className="bg-dark-card border border-dark-glass rounded-2xl rounded-tl-md px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-lifex-purple rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-lifex-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-lifex-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    style={{ background: getAssistantColor('coly') }}
                  >
                    <span className="text-white text-sm md:text-lg font-bold">💡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-text-secondary mb-3">You might also want to ask:</p>
                    <div className="flex flex-wrap gap-2">
                      {followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(question)}
                          className="px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-105 bg-dark-card border border-dark-glass text-text-primary hover:bg-lifex-purple hover:border-lifex-purple hover:text-white"
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
                <Plus size={20} className="text-lifex-purple" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Coly anything about your day..."
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-purple transition-colors"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-3 rounded-xl bg-lifex-purple text-white hover:bg-lifex-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
              <button className="p-3 rounded-xl border border-dark-glass hover:bg-white/5 transition-colors">
                <Mic size={18} className="text-lifex-purple" />
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
                style={{ background: getAssistantColor('coly') }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 text-text-primary">
                  G'day! I'm Coly
                </h1>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed">
                  {getAssistantDescription('coly')}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Plus size={20} className="text-lifex-purple" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your day..."
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-purple transition-colors"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-3 rounded-xl bg-lifex-purple text-white hover:bg-lifex-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
              <button className="p-3 rounded-xl border border-dark-glass hover:bg-white/5 transition-colors">
                <Mic size={18} className="text-lifex-purple" />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mb-16 md:mb-20">
            <h2 className="font-semibold mb-2 text-base md:text-lg text-text-primary">Quick Questions</h2>
            <div className="space-y-1">
              {[
                ['What should I do today?', 'Help me plan my weekend', 'Find me a good coffee shop'],
                ['What\'s the weather like?', 'Recommend a restaurant', 'Help me organize my day']
              ].map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {row.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-105 whitespace-nowrap flex-shrink-0 bg-dark-card border border-dark-glass text-text-primary hover:bg-lifex-purple hover:border-lifex-purple hover:text-white"
                      style={{ minWidth: 'fit-content' }}
                    >
                      {prompt}
                    </button>
                  ))}
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

export default ColyPage;
