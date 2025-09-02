// src/components/business/BusinessAdvanced.tsx
import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Upload,
  Camera,
  Award,
  Image,
  Star,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

// Types
interface MediaItem {
  id: number;
  type: 'image' | 'certificate';
  name: string;
  category: 'food' | 'ambiance' | 'certificate';
  url: string;
}

interface Review {
  id: number;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  responded: boolean;
  response?: string;
}

interface NotificationSettings {
  customerInquiries: boolean;
  reviews: boolean;
  systemUpdates: boolean;
  promotions: boolean;
}

interface BusinessPreferences {
  autoResponse: boolean;
  publicProfile: boolean;
  advanceNotice: number;
  language: string;
}

// Dark theme configuration
const darkTheme = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1A1625',
    card: '#1A1625',
    glass: '#8B5CF620'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B794F6',
    muted: '#805AD5'
  },
  neon: {
    purple: '#8B5CF6',
    green: '#10B981',
    pink: '#EC4899'
  }
};

// Media & Portfolio Management Component
const MediaManagement: React.FC = () => {
  const [portfolio, setPortfolio] = useState<MediaItem[]>([
    { id: 1, type: 'image', name: 'Signature Dish 1', category: 'food', url: '/api/placeholder/300/200' },
    { id: 2, type: 'image', name: 'Interior View', category: 'ambiance', url: '/api/placeholder/300/200' },
    { id: 3, type: 'certificate', name: 'Food Safety Certificate', category: 'certificate', url: '/api/placeholder/300/200' },
    { id: 4, type: 'image', name: 'Chef Special', category: 'food', url: '/api/placeholder/300/200' }
  ]);

  const [activeCategory, setActiveCategory] = useState<'all' | MediaItem['category']>('all');

  const categories = [
    { id: 'all' as const, name: 'All Media', color: darkTheme.neon.purple },
    { id: 'food' as const, name: 'Food & Products', color: darkTheme.neon.green },
    { id: 'ambiance' as const, name: 'Ambiance & Space', color: darkTheme.neon.pink },
    { id: 'certificate' as const, name: 'Certificates', color: '#F59E0B' }
  ];

  const filteredPortfolio = activeCategory === 'all' 
    ? portfolio 
    : portfolio.filter(item => item.category === activeCategory);

  const deleteMedia = (id: number) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Camera className="mr-2" style={{ color: darkTheme.neon.green }} /> 
        Media & Portfolio
      </h2>
      
      {/* Upload Section */}
      <div className="rounded-xl p-6 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>Upload Media</h3>
        <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-opacity-60" style={{ borderColor: darkTheme.background.glass }}>
          <Upload className="mx-auto mb-3" style={{ color: darkTheme.text.muted }} size={32} />
          <p className="mb-3 text-sm" style={{ color: darkTheme.text.secondary }}>
            Drag and drop files here, or click to browse
          </p>
          <button 
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
            style={{ 
              background: darkTheme.neon.purple, 
              color: darkTheme.text.primary 
            }}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                activeCategory === category.id ? 'scale-105' : ''
              }`}
              style={{
                background: activeCategory === category.id ? `${category.color}20` : darkTheme.background.secondary,
                color: activeCategory === category.id ? category.color : darkTheme.text.secondary,
                border: `1px solid ${activeCategory === category.id ? category.color + '40' : darkTheme.background.glass}`
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="rounded-xl border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="p-4 border-b" style={{ borderColor: darkTheme.background.glass }}>
          <h3 className="font-semibold" style={{ color: darkTheme.text.primary }}>Portfolio & Certificates</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortfolio.map((item) => (
              <div key={item.id} className="border rounded-xl overflow-hidden group" style={{ borderColor: darkTheme.background.glass }}>
                <div className="h-32 flex items-center justify-center relative" style={{ background: darkTheme.background.secondary }}>
                  {item.type === 'certificate' ? (
                    <Award style={{ color: darkTheme.neon.green }} size={24} />
                  ) : (
                    <Image style={{ color: darkTheme.text.muted }} size={24} />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button className="p-2 rounded-full" style={{ background: darkTheme.neon.purple }}>
                      <Eye size={16} style={{ color: darkTheme.text.primary }} />
                    </button>
                    <button 
                      onClick={() => deleteMedia(item.id)}
                      className="p-2 rounded-full bg-red-500"
                    >
                      <Trash2 size={16} style={{ color: darkTheme.text.primary }} />
                    </button>
                  </div>
                </div>
                <div className="p-3" style={{ background: darkTheme.background.secondary }}>
                  <p className="font-medium text-sm" style={{ color: darkTheme.text.primary }}>{item.name}</p>
                  <p className="text-xs capitalize mt-1" style={{ color: darkTheme.text.muted }}>{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Settings Component
const BusinessSettings: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    customerInquiries: true,
    reviews: true,
    systemUpdates: false,
    promotions: true
  });

  const [preferences, setPreferences] = useState<BusinessPreferences>({
    autoResponse: false,
    publicProfile: true,
    advanceNotice: 24,
    language: 'en'
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });
  };

  const updatePreference = (key: keyof BusinessPreferences, value: string | number | boolean) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Settings className="mr-2" style={{ color: darkTheme.neon.purple }} /> 
        Settings
      </h2>
      
      {/* Notifications */}
      <div className="rounded-xl p-6 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4 flex items-center" style={{ color: darkTheme.text.primary }}>
          <Bell className="mr-2" size={18} style={{ color: darkTheme.neon.green }} />
          Notifications
        </h3>
        
        <div className="space-y-4">
          {(Object.entries(notifications) as [keyof NotificationSettings, boolean][]).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: darkTheme.text.secondary }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateNotification(key, e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className="w-11 h-6 rounded-full transition-all cursor-pointer"
                  style={{ 
                    background: value ? darkTheme.neon.purple : '#374151' 
                  }}
                  onClick={() => updateNotification(key, !value)}
                >
                  <div 
                    className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    } mt-1`}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Business Preferences */}
      <div className="rounded-xl p-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4 flex items-center" style={{ color: darkTheme.text.primary }}>
          <Shield className="mr-2" size={18} style={{ color: darkTheme.neon.pink }} />
          Business Preferences
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm" style={{ color: darkTheme.text.secondary }}>Auto-response to inquiries</span>
            <div className="relative">
              <div 
                className="w-11 h-6 rounded-full transition-all cursor-pointer"
                style={{ 
                  background: preferences.autoResponse ? darkTheme.neon.green : '#374151' 
                }}
                onClick={() => updatePreference('autoResponse', !preferences.autoResponse)}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                    preferences.autoResponse ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </div>
            </div>
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm" style={{ color: darkTheme.text.secondary }}>Public profile visibility</span>
            <div className="relative">
              <div 
                className="w-11 h-6 rounded-full transition-all cursor-pointer"
                style={{ 
                  background: preferences.publicProfile ? darkTheme.neon.purple : '#374151' 
                }}
                onClick={() => updatePreference('publicProfile', !preferences.publicProfile)}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                    preferences.publicProfile ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </div>
            </div>
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
              Advance notice required (hours)
            </label>
            <input
              type="number"
              value={preferences.advanceNotice}
              onChange={(e) => updatePreference('advanceNotice', parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
              min={1}
              max={168}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reviews Management Component
const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    { 
      id: 1, 
      customer: 'Sarah M.', 
      rating: 5, 
      comment: 'Amazing food and great service! Highly recommend the pasta.', 
      date: '2025-01-20',
      responded: false
    },
    { 
      id: 2, 
      customer: 'John D.', 
      rating: 4, 
      comment: 'Good atmosphere, friendly staff. The dessert was outstanding.', 
      date: '2025-01-18',
      responded: true,
      response: 'Thank you for your wonderful feedback!'
    },
    { 
      id: 3, 
      customer: 'Mike R.', 
      rating: 5, 
      comment: 'Best spa experience I have ever had. Very relaxing and professional.', 
      date: '2025-01-15',
      responded: false
    }
  ]);

  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const respondToReview = (reviewId: number) => {
    if (responseText.trim()) {
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, responded: true, response: responseText.trim() }
          : review
      ));
      setResponseText('');
      setRespondingTo(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Star className="mr-2" style={{ color: '#F59E0B' }} /> 
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="rounded-xl p-4 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: darkTheme.text.primary }}>Overall Rating</h3>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-bold mr-2" style={{ color: '#F59E0B' }}>{avgRating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(avgRating) ? 'fill-current' : ''}
                    style={{ color: i < Math.floor(avgRating) ? '#F59E0B' : '#374151' }}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm" style={{ color: darkTheme.text.muted }}>({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl p-4 border" style={{
            background: darkTheme.background.card,
            borderColor: darkTheme.background.glass
          }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-medium" style={{ color: darkTheme.text.primary }}>{review.customer}</span>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'fill-current' : ''}
                      style={{ color: i < review.rating ? '#F59E0B' : '#374151' }}
                    />
                  ))}
                  <span className="ml-2 text-xs" style={{ color: darkTheme.text.muted }}>{review.date}</span>
                </div>
              </div>
              <span 
                className={`px-2 py-1 rounded-full text-xs ${review.responded ? 'opacity-100' : 'opacity-60'}`}
                style={{ 
                  background: review.responded ? `${darkTheme.neon.green}20` : `${darkTheme.neon.purple}20`,
                  color: review.responded ? darkTheme.neon.green : darkTheme.neon.purple
                }}
              >
                {review.responded ? 'Responded' : 'New'}
              </span>
            </div>
            
            <p className="text-sm mb-3" style={{ color: darkTheme.text.secondary }}>{review.comment}</p>

            {review.response && (
              <div className="p-3 rounded-lg mb-3" style={{ background: darkTheme.background.secondary }}>
                <p className="text-xs font-medium mb-1" style={{ color: darkTheme.neon.purple }}>Your Response:</p>
                <p className="text-sm" style={{ color: darkTheme.text.secondary }}>{review.response}</p>
              </div>
            )}

            {!review.responded && (
              <div className="mt-3">
                {respondingTo === review.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response..."
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      style={{ 
                        background: darkTheme.background.secondary, 
                        borderColor: darkTheme.background.glass,
                        color: darkTheme.text.primary
                      }}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => respondToReview(review.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ 
                          background: darkTheme.neon.green, 
                          color: darkTheme.text.primary 
                        }}
                      >
                        Send Response
                      </button>
                      <button 
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText('');
                        }}
                        className="px-3 py-1 rounded-lg text-xs transition-all hover:scale-105"
                        style={{ 
                          background: darkTheme.background.secondary, 
                          color: darkTheme.text.muted 
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setRespondingTo(review.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{ 
                      background: darkTheme.neon.purple, 
                      color: darkTheme.text.primary 
                    }}
                  >
                    Respond
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Enhanced Dashboard
const BusinessAdvanced: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'media' | 'reviews' | 'settings'>('media');
  
  const sections = [
    { id: 'media' as const, label: 'Media', icon: Camera, color: darkTheme.neon.green, component: MediaManagement },
    { id: 'reviews' as const, label: 'Reviews', icon: Star, color: '#F59E0B', component: ReviewsManagement },
    { id: 'settings' as const, label: 'Settings', icon: Settings, color: darkTheme.neon.purple, component: BusinessSettings }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Navigation */}
      <div className="border-b" style={{ 
        background: darkTheme.background.secondary, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="flex overflow-x-auto px-4 md:px-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeSection === section.id ? 'transform scale-105' : 'hover:scale-102'
                }`}
                style={{
                  borderColor: activeSection === section.id ? section.color : 'transparent',
                  color: activeSection === section.id ? section.color : darkTheme.text.secondary
                }}
              >
                <Icon size={18} className="mr-2" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default BusinessAdvanced;