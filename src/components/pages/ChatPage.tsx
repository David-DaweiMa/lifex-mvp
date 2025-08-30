// src/components/pages/ChatPage.tsx
import React, { useRef, useEffect } from 'react';
import { Send, Plus, Mic, ArrowLeft, Star, Phone, MapPin, Sparkles } from 'lucide-react';
import { Message, Business } from '../../lib/types';
import { quickPrompts, recentDiscoveries } from '../../lib/mockData';

interface ChatPageProps {
  messages: Message[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isInConversation: boolean;
  isTyping: boolean;
  onSendMessage: () => void;
  onQuickPrompt: (prompt: string) => void;
  onBackToMain: () => void;
  followUpQuestions?: string[];
}

const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  chatInput,
  setChatInput,
  isInConversation,
  isTyping,
  onSendMessage,
  onQuickPrompt,
  onBackToMain,
  followUpQuestions = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-lifex-purple">
            <span className="text-white text-sm md:text-lg font-bold">⚡</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-dark-card border border-dark-glass rounded-2xl rounded-tl-md px-3 py-2">
              <p className="text-sm md:text-base text-text-primary">{message.content}</p>
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

  if (isInConversation) {
    return (
      <div className="h-full flex flex-col bg-gradient-background">
        {/* Conversation Header */}
        <div className="p-4 md:p-6 border-b border-dark-glass bg-dark-card">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToMain}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={20} className="text-lifex-purple" />
            </button>
            <div>
              <h2 className="font-bold text-base md:text-lg text-text-primary">LifeX AI</h2>
              <p className="text-xs md:text-sm text-text-secondary">Your AI companion</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => renderMessage(message, index))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-lifex-purple">
                  <span className="text-white text-sm md:text-lg font-bold">⚡</span>
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
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-lifex-purple">
                    <span className="text-white text-sm md:text-lg font-bold">💡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-text-secondary mb-3">You might also want to ask:</p>
                    <div className="flex flex-wrap gap-2">
                      {followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => onQuickPrompt(question)}
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
                  onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                  placeholder="Ask me anything about New Zealand..."
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-purple transition-colors"
                />
              </div>
              <button 
                onClick={onSendMessage}
                className="p-3 rounded-xl bg-lifex-purple text-white hover:bg-lifex-purple/90 transition-colors"
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

  return (
    <div className="h-full overflow-y-auto bg-gradient-background pb-20">
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
                     {/* Large Chat Dialog with Welcome Message */}
           <div className="mb-6 md:mb-8 mt-16 md:mt-24">
             <div className="bg-dark-card border border-dark-glass rounded-2xl p-6 md:p-8">
               {/* Welcome Message in Top Left */}
               <div className="mb-6">
                 <h1 className="text-lg md:text-xl font-semibold text-text-primary">
                   G'day! What can I help you find today?
                 </h1>
               </div>
               
               {/* Chat Input Inside Dialog */}
               <div className="flex items-center gap-3">
                 <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                   <Plus size={20} className="text-lifex-purple" />
                 </button>
                 <div className="flex-1 relative">
                   <input
                     type="text"
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                     placeholder="Ask me anything about New Zealand..."
                     className="w-full px-4 py-3 bg-dark-secondary border border-dark-glass rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-lifex-purple transition-colors text-base"
                   />
                 </div>
                 <button 
                   onClick={onSendMessage}
                   className="p-3 rounded-xl bg-lifex-purple text-white hover:bg-lifex-purple/90 transition-colors"
                 >
                   <Send size={18} />
                 </button>
               </div>
             </div>
           </div>

                     {/* Quick Prompts - Reduced spacing */}
           <div className="mb-16 md:mb-20">
             <h2 className="font-semibold mb-2 text-base md:text-lg text-text-primary">Quick Questions</h2>
             <div className="space-y-1">
               {quickPrompts.map((row, rowIdx) => (
                 <div key={rowIdx} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                   {row.map((prompt, idx) => (
                     <button
                       key={idx}
                       onClick={() => onQuickPrompt(prompt)}
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

           {/* Recent Discoveries - Content only */}
           <div className="mb-8">
             <div className="flex items-center justify-between mb-4">
               <h2 className="font-semibold text-base md:text-lg text-text-primary">Recent Discoveries</h2>
               <button className="text-sm text-lifex-purple hover:text-lifex-purple/80 transition-colors">
                 See all
               </button>
             </div>
             
             {/* Discovery content cards */}
             <div className="space-y-3">
               {recentDiscoveries.map((discovery, idx) => (
                 <div 
                   key={idx}
                   className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-glass cursor-pointer hover:bg-dark-secondary transition-colors"
                 >
                   <div className="text-2xl">{discovery.icon}</div>
                   <div className="flex-1">
                     <p className="text-sm text-text-primary">{discovery.text}</p>
                   </div>
                   <button className="text-lifex-purple hover:text-lifex-purple/80 transition-colors">
                     <Sparkles size={16} />
                   </button>
                 </div>
               ))}
             </div>
           </div>

                     
        </div>
      </div>
    </div>
  );
};

export default ChatPage;