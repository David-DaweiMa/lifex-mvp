// src/components/pages/DiscoverPage.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Camera, Star, Phone, MapPin, Sparkles, Search, Loader2 } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { discoverCategories, discoverContent } from '../../lib/mockData';
import { businessService, Business, BusinessFilters } from '../../lib/businessService';

interface DiscoverPageProps {
  selectedServiceCategory: string;
  setSelectedServiceCategory: (category: string) => void;
}

const DiscoverPage: React.FC<DiscoverPageProps> = ({
  selectedServiceCategory,
  setSelectedServiceCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Business data state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load businesses on component mount and category change
  useEffect(() => {
    loadBusinesses();
  }, [selectedServiceCategory, searchQuery]);

  const loadBusinesses = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const filters: BusinessFilters = {
        page,
        limit: 20,
        category: selectedServiceCategory === 'all' ? undefined : selectedServiceCategory,
        search: searchQuery || undefined,
        sortBy: 'rating',
        sortOrder: 'desc'
      };

      const response = await businessService.getBusinesses(filters);
      
      if (append) {
        setBusinesses(prev => [...prev, ...response.data]);
      } else {
        setBusinesses(response.data);
      }
      
      setHasMore(page < response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses');
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadBusinesses(currentPage + 1, true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past initial 100px
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const getFilteredContent = () => {
    if (selectedServiceCategory === 'all') return discoverContent;
    return discoverContent.filter(item => item.category === selectedServiceCategory);
  };

  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header - Scrollable */}
          <div 
            className={`transition-transform duration-300 ease-in-out ${
              isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                Discover
              </h2>
              <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
                Local businesses & community insights
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkTheme.text.muted }} />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary,
                    '--tw-ring-color': darkTheme.neon.purple,
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6 md:mb-8">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {discoverCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedServiceCategory(category.id)}
                    className="p-2 md:p-3 rounded-xl border transition-all hover:scale-105 h-16 md:h-20"
                    style={{
                      background: selectedServiceCategory === category.id ? `${category.color}20` : darkTheme.background.card,
                      borderColor: selectedServiceCategory === category.id ? `${category.color}40` : darkTheme.background.glass,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2 h-full">
                      <category.icon 
                        size={16} 
                        className="md:w-4 md:h-4"
                        style={{ color: selectedServiceCategory === category.id ? category.color : darkTheme.text.muted }} 
                      />
                      <span 
                        className="text-xs font-medium text-center leading-tight"
                        style={{ 
                          color: selectedServiceCategory === category.id ? category.color : darkTheme.text.muted 
                        }}
                      >
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && businesses.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: darkTheme.neon.purple }} />
                <span style={{ color: darkTheme.text.secondary }}>Loading businesses...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && businesses.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-400 mb-2">Failed to load businesses</p>
                <button
                  onClick={() => loadBusinesses()}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ background: darkTheme.neon.purple, color: 'white' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Content Layout - Pinterest/Small Red Book Style Two Column Grid */}
          {businesses.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Left Column */}
            <div className="space-y-3 md:space-y-4">
              {getFilteredContent().filter((_, index) => index % 2 === 0).map((item) => (
                <div 
                  key={item.id}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div 
                    className={`h-32 md:h-40 bg-gradient-to-br ${item.image} relative`}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-3 left-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, tagIdx) => (
                          <span 
                            key={tagIdx} 
                            className="bg-white/80 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {item.readTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2" style={{ color: darkTheme.text.primary }}>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm mb-3 line-clamp-2" style={{ color: darkTheme.text.secondary }}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                          style={{ background: darkTheme.neon.purple }}
                        >
                          <span className="text-white text-xs">👤</span>
                        </div>
                        <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          {item.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 md:w-4 md:h-4" style={{ color: darkTheme.neon.pink }} />
                        <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.pink }}>
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Business cards in left column */}
              {businesses.filter((_, index) => index % 2 === 0).map((business: Business) => (
                <div 
                  key={business.id}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                  onClick={() => window.location.href = `/businesses/${business.id}`}
                >
                  <div 
                    className={`h-20 md:h-24 bg-gradient-to-br ${business.image} relative`}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-3 left-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          business.isOpen 
                            ? 'bg-green-500/80 text-white' 
                            : 'bg-red-500/80 text-white'
                        }`}
                      >
                        {business.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base mb-1 truncate" style={{ color: darkTheme.text.primary }}>
                          {business.name}
                        </h3>
                        <p className="text-xs md:text-sm mb-1" style={{ color: darkTheme.text.secondary }}>
                          {business.type}
                        </p>
                        <div className="flex items-center gap-1 text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          <MapPin size={12} />
                          <span>{business.distance}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={12} style={{ color: darkTheme.neon.yellow, fill: darkTheme.neon.yellow }} />
                          <span className="font-medium text-xs md:text-sm" style={{ color: darkTheme.text.primary }}>
                            {business.rating}
                          </span>
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>({business.review_count})</span>
                        </div>
                        <p className="font-medium text-xs md:text-sm" style={{ color: darkTheme.neon.green }}>
                          {business.price}
                        </p>
                      </div>
                    </div>

                    <div 
                      className="rounded-lg p-3 mb-3"
                      style={{
                        background: `${darkTheme.neon.purple}15`,
                        border: `1px solid ${darkTheme.neon.purple}30`,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={12} style={{ color: darkTheme.neon.purple }} className="flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm" style={{ color: darkTheme.text.primary }}>
                          {business.aiReason}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => window.open(`tel:${business.phone}`)}
                        className="py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 text-xs md:text-sm transition-all"
                        style={{ background: darkTheme.neon.purple, color: 'white' }}
                      >
                        <Phone size={12} />
                        <span>Call</span>
                      </button>
                      
                      <button 
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(business.name + ' Auckland')}`)}
                        className="py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 text-xs md:text-sm transition-all"
                        style={{
                          background: darkTheme.background.secondary,
                          color: darkTheme.text.primary,
                          border: `1px solid ${darkTheme.text.primary}40`,
                        }}
                      >
                        <MapPin size={12} />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3 md:space-y-4">
              {getFilteredContent().filter((_, index) => index % 2 === 1).map((item) => (
                <div 
                  key={item.id}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div 
                    className={`h-32 md:h-40 bg-gradient-to-br ${item.image} relative`}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-3 left-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, tagIdx) => (
                          <span 
                            key={tagIdx} 
                            className="bg-white/80 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {item.readTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2" style={{ color: darkTheme.text.primary }}>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm mb-3 line-clamp-2" style={{ color: darkTheme.text.secondary }}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                          style={{ background: darkTheme.neon.purple }}
                        >
                          <span className="text-white text-xs">👤</span>
                        </div>
                        <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          {item.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 md:w-4 md:h-4" style={{ color: darkTheme.neon.pink }} />
                        <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.pink }}>
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Business cards in right column */}
              {businesses.filter((_, index) => index % 2 === 1).map((business: Business) => (
                <div 
                  key={business.id}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                  onClick={() => window.location.href = `/businesses/${business.id}`}
                >
                  <div 
                    className={`h-20 md:h-24 bg-gradient-to-br ${business.image} relative`}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-3 left-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          business.isOpen 
                            ? 'bg-green-500/80 text-white' 
                            : 'bg-red-500/80 text-white'
                        }`}
                      >
                        {business.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base mb-1 truncate" style={{ color: darkTheme.text.primary }}>
                          {business.name}
                        </h3>
                        <p className="text-xs md:text-sm mb-1" style={{ color: darkTheme.text.secondary }}>
                          {business.type}
                        </p>
                        <div className="flex items-center gap-1 text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          <MapPin size={12} />
                          <span>{business.distance}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={12} style={{ color: darkTheme.neon.yellow, fill: darkTheme.neon.yellow }} />
                          <span className="font-medium text-xs md:text-sm" style={{ color: darkTheme.text.primary }}>
                            {business.rating}
                          </span>
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>({business.review_count})</span>
                        </div>
                        <p className="font-medium text-xs md:text-sm" style={{ color: darkTheme.neon.green }}>
                          {business.price}
                        </p>
                      </div>
                    </div>

                    <div 
                      className="rounded-lg p-3 mb-3"
                      style={{
                        background: `${darkTheme.neon.purple}15`,
                        border: `1px solid ${darkTheme.neon.purple}30`,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={12} style={{ color: darkTheme.neon.purple }} className="flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm" style={{ color: darkTheme.text.primary }}>
                          {business.aiReason}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => window.open(`tel:${business.phone}`)}
                        className="py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 text-xs md:text-sm transition-all"
                        style={{ background: darkTheme.neon.purple, color: 'white' }}
                      >
                        <Phone size={12} />
                        <span>Call</span>
                      </button>
                      
                      <button 
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(business.name + ' Auckland')}`)}
                        className="py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 text-xs md:text-sm transition-all"
                        style={{
                          background: darkTheme.background.secondary,
                          color: darkTheme.text.primary,
                          border: `1px solid ${darkTheme.text.primary}40`,
                        }}
                      >
                        <MapPin size={12} />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Load More Button */}
          {hasMore && businesses.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{ 
                  background: loading ? darkTheme.background.secondary : darkTheme.neon.purple, 
                  color: 'white',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}

          {/* Create Content Section - Removed */}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 768px) {
          .grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 768px) {
          .md\\:grid-cols-6 {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default DiscoverPage;