"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, MapPin, Phone, Clock, Star, Sparkles, User, Search, Calendar, Camera, MessageCircle, Zap, Plus, Mic } from 'lucide-react';

// 定义样式常量
const styles = {
  container: {
    width: '100%',
    maxWidth: '28rem',
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem',
    flexShrink: 0,
  },
  logo: {
    width: '2.5rem',
    height: '2.5rem',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  chatBg: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'linear-gradient(135deg, #fff7ed, #fed7aa, #fdba74)',
  },
  headerSection: {
    position: 'relative' as const,
    padding: '2rem 1.5rem 1.5rem',
    color: '#1e293b',
    overflow: 'hidden',
    flexShrink: 0,
  },
  picksSection: {
    position: 'relative' as const,
    padding: '0 1.5rem 1rem',
    flexShrink: 0,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '1rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto' as const,
    backgroundColor: 'white',
    borderRadius: '1.5rem 1.5rem 0 0',
    position: 'relative' as const,
  },
  inputArea: {
    backgroundColor: 'white',
    padding: '1.5rem',
    flexShrink: 0,
  },
  bottomNav: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '0.5rem',
    flexShrink: 0,
    borderTop: '1px solid #e5e7eb',
  },
  button: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '1rem',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: '9999px',
    padding: '0.75rem 1rem',
    paddingRight: '3rem',
    color: '#1e293b',
    border: 'none',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  promptBtn: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '0.5rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    border: '1px solid rgba(249, 115, 22, 0.2)',
    color: '#020029',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// Type definitions
interface Message {
  type: 'user' | 'assistant';
  content: string;
  assistant?: string;
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  highlights: string[];
  aiReason: string;
  phone: string;
  assistant: string;
  address: string;
  hasOnlineBooking: boolean;
  bookingUrl: string;
}

const LifeXApp = () => {
  const [currentView, setCurrentView] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?",
      assistant: 'lifex'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockRecommendations: Recommendation[] = [
    {
      id: 1,
      name: "Café Supreme",
      type: "Coffee & Workspace",
      rating: 4.8,
      reviews: 234,
      distance: "0.3km",
      price: "$$",
      highlights: ["Fast WiFi", "Quiet", "Great Coffee"],
      aiReason: "Perfect for remote work with excellent coffee and reliable WiFi.",
      phone: "09-555-0123",
      assistant: 'lifex',
      address: "118 Ponsonby Road, Auckland",
      hasOnlineBooking: true,
      bookingUrl: "https://www.opentable.com/cafe-supreme"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserQuery = (query: string) => {
    const userMessage: Message = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "Here are some great recommendations for you:",
        assistant: 'lifex',
        recommendations: mockRecommendations.slice(0, 1)
      }]);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    handleUserQuery(chatInput);
    setChatInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    handleUserQuery(prompt);
  };

  const renderMessage = (message: Message, index: number) => (
    <div key={index} style={{ marginBottom: '1.5rem' }}>
      {message.type === 'user' ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white',
            borderRadius: '1rem 1rem 0.25rem 1rem',
            padding: '0.75rem 1rem',
            maxWidth: '18rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}>
            {message.content}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}>
            <span style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold' }}>⚡</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem 1rem 1rem 0.25rem',
              border: '1px solid #fed7aa',
              padding: '0.75rem 1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{ color: '#374151', margin: 0 }}>{message.content}</p>
            </div>
            
            {message.recommendations && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {message.recommendations.map(rec => (
                  <div key={rec.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.125rem', margin: '0 0 0.25rem 0' }}>{rec.name}</h4>
                          <p style={{ color: '#6b7280', margin: 0 }}>{rec.type}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                            <span style={{ fontWeight: 500 }}>{rec.rating}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>({rec.reviews})</span>
                          </div>
                          <p style={{ color: '#ea580c', fontWeight: 500, margin: 0 }}>{rec.price}</p>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: '#fff7ed',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Sparkles size={16} style={{ color: '#f97316', marginTop: '0.125rem' }} />
                          <p style={{ color: '#c2410c', fontSize: '0.875rem', margin: 0 }}>{rec.aiReason}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button 
                          onClick={() => window.open(`tel:${rec.phone}`)}
                          style={{
                            ...styles.button,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            padding: '0.625rem 1rem',
                          }}
                        >
                          <Phone size={14} />
                          <span style={{ fontSize: '0.875rem' }}>Call Now</span>
                        </button>
                        
                        <button 
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(rec.name + ' Auckland')}`)}
                          style={{
                            backgroundColor: '#fff7ed',
                            color: '#c2410c',
                            padding: '0.625rem 1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <MapPin size={14} />
                          <span style={{ fontSize: '0.875rem' }}>Directions</span>
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.logo}>
              <span style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold' }}>LX</span>
              <div style={{
                position: 'absolute',
                top: '0.375rem',
                right: '0.375rem',
                width: '0.25rem',
                height: '0.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '0.375rem',
                left: '0.375rem',
                width: '0.25rem',
                height: '0.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
              }}></div>
            </div>
            <div>
              <h1 style={{
                fontWeight: 'bold',
                fontSize: '1.125rem',
                display: 'flex',
                alignItems: 'center',
                color: '#020029',
                margin: 0,
              }}>
                Life<span style={{
                  fontWeight: 800,
                  fontStyle: 'italic',
                  fontSize: '1.125rem',
                  marginLeft: '0.125rem',
                  color: '#f97316',
                }}>X</span>
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: 500,
                margin: 0,
              }}>Explore Kiwi's hidden gems with AI</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={{
              padding: '0.5rem',
              color: '#6b7280',
              borderRadius: '0.5rem',
              transition: 'colors 0.3s ease',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}>
              <Search size={18} />
            </button>
            <button style={{
              padding: '0.5rem',
              color: '#6b7280',
              borderRadius: '0.5rem',
              transition: 'colors 0.3s ease',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}>
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {currentView === 'chat' && (
          <div style={styles.chatBg}>
            
            {/* Header Section */}
            <div style={styles.headerSection}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent)',
              }}></div>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '8rem',
                height: '8rem',
                backgroundColor: 'rgba(30, 41, 59, 0.1)',
                borderRadius: '50%',
                transform: 'translate(4rem, -4rem)',
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '6rem',
                height: '6rem',
                backgroundColor: 'rgba(251, 146, 60, 0.3)',
                borderRadius: '50%',
                transform: 'translate(-3rem, 3rem)',
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <button style={{
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#fed7aa',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    <svg width="20" height="20" style={{ color: '#FF7710' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: '#fed7aa',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <User size={16} style={{ color: '#FF7710' }} />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#020029' }}>Ask me</h1>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#020029' }}>a question</h1>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>AI-powered recommendations for authentic New Zealand living</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Recent prompts</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      "Best coffee shops",
                      "Family restaurants", 
                      "Weekend activities",
                      "Quick lunch spots"
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt)}
                        style={styles.promptBtn}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                  {[
                    { label: "Trending", active: true },
                    { label: "Food & Drink", active: false },
                    { label: "Activities", active: false },
                    { label: "Services", active: false }
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      style={{
                        paddingBottom: '0.5rem',
                        borderBottom: tag.active ? '2px solid #f97316' : '2px solid transparent',
                        transition: 'colors 0.3s ease',
                        color: tag.active ? '#020029' : '#64748b',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Kiwi Picks */}
            <div style={styles.picksSection}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#020029' }}>Today's Kiwi Picks</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div 
                    onClick={() => handleQuickPrompt("AI tools for daily tasks and automation")}
                    style={styles.card}
                  >
                    <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#020029' }}>Smart Living with AI:</h4>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Discover how AI can enhance your daily Kiwi lifestyle.</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        backgroundColor: '#fed7aa',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" style={{ color: '#FF7710' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleQuickPrompt("Modern food trends and gourmet restaurants")}
                    style={styles.card}
                  >
                    <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#020029' }}>Kiwi Food Culture:</h4>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Explore NZ's vibrant food scene from local cafés.</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        backgroundColor: '#fed7aa',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ color: '#ea580c', fontSize: '0.875rem' }}>🍽️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Discoveries */}
            <div style={{ position: 'relative', padding: '0 1.5rem 1rem', flexShrink: 0 }}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 600, color: '#020029', margin: 0 }}>Recent Discoveries</h3>
                  <button style={{ color: '#64748b', fontSize: '0.875rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>See all</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    {
                      title: "Auckland Coffee Culture:",
                      subtitle: "Where do locals go for the best flat white?",
                      icon: "☕",
                    },
                    {
                      title: "Wellington Lifestyle:",
                      subtitle: "Best neighborhoods for young professionals?",
                      icon: "🏙️",
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleQuickPrompt(item.subtitle)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <div style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        background: 'linear-gradient(135deg, #fed7aa, #fbbf24)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '0.75rem' }}>{item.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 500, fontSize: '0.875rem', color: '#020029', margin: '0 0 0.125rem 0' }}>{item.title}</h4>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={styles.chatArea}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3rem',
                height: '0.25rem',
                backgroundColor: '#fb923c',
                borderRadius: '9999px',
                marginTop: '0.75rem',
              }}></div>
              
              {messages.length > 1 && (
                <div style={{ padding: '1.5rem', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.slice(1).map((message, index) => renderMessage(message, index + 1))}
                  
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}>
                        <span style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold' }}>⚡</span>
                      </div>
                      <div style={{
                        backgroundColor: '#fff7ed',
                        borderRadius: '1rem 1rem 1rem 0.25rem',
                        padding: '0.75rem 1rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            backgroundColor: '#fb923c',
                            borderRadius: '50%',
                            animation: 'bounce 1s infinite',
                          }}></div>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            backgroundColor: '#fb923c',
                            borderRadius: '50%',
                            animation: 'bounce 1s infinite 0.1s',
                          }}></div>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            backgroundColor: '#fb923c',
                            borderRadius: '50%',
                            animation: 'bounce 1s infinite 0.2s',
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={styles.inputArea}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button style={{
                  padding: '0.5rem',
                  color: '#fb923c',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}>
                  <Plus size={20} />
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.25rem',
                    color: '#fb923c',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    <Mic size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  style={{
                    ...styles.button,
                    padding: '0.75rem',
                    borderRadius: '50%',
                    opacity: !chatInput.trim() ? 0.5 : 1,
                    cursor: !chatInput.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 其他视图 */}
        {currentView !== 'chat' && (
          <div style={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #fff7ed, #fed7aa, #fdba74)', 
            padding: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#020029' }}>
              {currentView === 'discover' && 'Discover'}
              {currentView === 'booking' && 'My Bookings'} 
              {currentView === 'profile' && 'Profile'}
            </h2>
            <p style={{ color: '#6b7280' }}>Coming soon...</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'discover', icon: Camera, label: 'Discover' },
            { id: 'booking', icon: Calendar, label: 'Book' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                transition: 'all 0.3s ease',
                color: currentView === tab.id ? '#ea580c' : '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <tab.icon size={20} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 添加CSS动画 */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default LifeXApp;