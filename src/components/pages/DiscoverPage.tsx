// src/components/pages/DiscoverPage.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Camera, Star, Phone, MapPin, Sparkles, Search, Loader2, UserPlus, Store, Building2, Filter } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { discoverCategories, discoverContent } from '../../lib/mockData';
import { businessService, Business, BusinessFilters } from '../../lib/businessService';
import { getCurrentUser } from '../../lib/authService';

interface DiscoverPageProps {
  selectedServiceCategory: string;
  setSelectedServiceCategory: (category: string) => void;
}

// Discovery menu options
const discoveryMenus = [
  { id: 'following', label: 'Following', icon: Heart, description: 'Businesses you follow' },
  { id: 'recommend', label: 'Recommend', icon: Sparkles, description: 'AI recommendations for you' },
  { id: 'nearby', label: 'Nearby', icon: MapPin, description: 'Businesses near your location' }
];

const DiscoverPage: React.FC<DiscoverPageProps> = ({
  selectedServiceCategory,
  setSelectedServiceCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiscoveryMenu, setSelectedDiscoveryMenu] = useState('recommend');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Business data state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // User state for business features
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  // Load user on component mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load businesses on component mount and category change
  useEffect(() => {
    loadBusinesses();
  }, [selectedServiceCategory, selectedDiscoveryMenu, searchQuery]);

  const loadCurrentUser = async () => {
    const result = await getCurrentUser();
    if (result.success) {
      setCurrentUser(result.user);
    }
  };

  const loadBusinesses = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let filters: BusinessFilters = {
        page,
        limit: 20,
        category: selectedServiceCategory === 'all' ? undefined : selectedServiceCategory,
        search: searchQuery || undefined,
        sortBy: 'rating',
        sortOrder: 'desc'
      };

      // Apply discovery menu filters
      switch (selectedDiscoveryMenu) {
        case 'following':
          // Filter for followed businesses (mock implementation)
          filters.sortBy = 'name';
          break;
        case 'nearby':
          // Filter for nearby businesses (mock implementation)
          filters.sortBy = 'name';
          break;
        case 'recommend':
        default:
          // AI recommendations (default behavior)
          filters.sortBy = 'rating';
          break;
      }

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
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadBusinesses(currentPage + 1, true);
    }
  };

  // Check if user is a business member
  const isBusinessMember = currentUser && ['free_business', 'professional_business', 'enterprise_business'].includes(currentUser.user_type);

  // Handle scroll for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleClaimBusiness = () => {
    if (!currentUser) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }
    
    if (!isBusinessMember) {
      // Show upgrade to business member modal
      setShowBusinessModal(true);
      return;
    }
    
    // Redirect to claim business page
    window.location.href = '/business/claim';
  };

  const handleJoinBusiness = () => {
    if (!currentUser) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }
    
    if (!isBusinessMember) {
      // Show upgrade to business member modal
      setShowBusinessModal(true);
      return;
    }
    
    // Redirect to join business page
    window.location.href = '/business/join';
  };

  const handleUpgradeToBusiness = () => {
    // Redirect to business registration page
    window.location.href = '/auth/register?type=business';
  };

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Fixed Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          background: `${darkTheme.background.primary}95`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                Discover
              </h2>
              <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
                Local businesses & community insights
              </p>
            </div>

            {/* Discovery Menu - Following/Recommend/Nearby */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {discoveryMenus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => setSelectedDiscoveryMenu(menu.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 whitespace-nowrap"
                    style={{
                      background: selectedDiscoveryMenu === menu.id ? `${darkTheme.neon.purple}20` : darkTheme.background.card,
                      borderColor: selectedDiscoveryMenu === menu.id ? `${darkTheme.neon.purple}40` : darkTheme.background.glass,
                    }}
                  >
                    <menu.icon 
                      size={16} 
                      style={{ color: selectedDiscoveryMenu === menu.id ? darkTheme.neon.purple : darkTheme.text.muted }} 
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        color: selectedDiscoveryMenu === menu.id ? darkTheme.neon.purple : darkTheme.text.secondary 
                      }}
                    >
                      {menu.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Member Actions - Only show to business members */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={handleClaimBusiness}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 whitespace-nowrap"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <Building2 
                    size={16} 
                    style={{ color: darkTheme.text.muted }} 
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: darkTheme.text.secondary }}
                  >
                    Claim Business
                  </span>
                </button>
                
                <button
                  onClick={handleJoinBusiness}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 whitespace-nowrap"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <UserPlus 
                    size={16} 
                    style={{ color: darkTheme.text.muted }} 
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: darkTheme.text.secondary }}
                  >
                    Join Business
                  </span>
                </button>
              </div>
              
              {!isBusinessMember && currentUser && (
                <div className="mt-2 text-xs" style={{ color: darkTheme.text.muted }}>
                  <span>Business member features require upgrading your account. </span>
                  <button 
                    onClick={handleUpgradeToBusiness}
                    className="underline hover:text-purple-400 transition-colors"
                    style={{ color: darkTheme.neon.purple }}
                  >
                    Upgrade now
                  </button>
                </div>
              )}
              
              {!currentUser && (
                <div className="mt-2 text-xs" style={{ color: darkTheme.text.muted }}>
                  <span>Business features require account registration. </span>
                  <button 
                    onClick={() => window.location.href = '/auth/register'}
                    className="underline hover:text-purple-400 transition-colors"
                    style={{ color: darkTheme.neon.purple }}
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-40">
        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
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
                          color: selectedServiceCategory === category.id ? category.color : darkTheme.text.secondary 
                        }}
                      >
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Discovery Menu Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl border" style={{
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
              }}>
                {(() => {
                  const currentMenu = discoveryMenus.find(m => m.id === selectedDiscoveryMenu);
                  return currentMenu ? (
                    <>
                      <currentMenu.icon size={20} style={{ color: darkTheme.neon.purple }} />
                      <div>
                        <h3 className="font-medium text-sm" style={{ color: darkTheme.text.primary }}>
                          {currentMenu.label}
                        </h3>
                        <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                          {currentMenu.description}
                        </p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 rounded-xl border" style={{
                background: `${darkTheme.neon.red}10`,
                borderColor: `${darkTheme.neon.red}30`,
              }}>
                <p className="text-sm" style={{ color: darkTheme.neon.red }}>
                  {error}
                </p>
                <button 
                  onClick={() => loadBusinesses()}
                  className="text-xs underline mt-2 hover:no-underline"
                  style={{ color: darkTheme.neon.red }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && businesses.length === 0 && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: darkTheme.neon.purple }} />
              </div>
            )}

            {/* Business Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {businesses.map((business, index) => (
                <div 
                  key={`${business.id}-${index}`}
                  className="rounded-xl border overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                  onClick={() => window.location.href = `/businesses/${business.id}`}
                >
                  {/* Business Image */}
                  <div 
                    className="h-32 md:h-40 flex items-center justify-center text-white font-bold text-lg"
                    style={{ 
                      background: business.cover_photo_url 
                        ? `url(${business.cover_photo_url}) center/cover` 
                        : `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.blue})` 
                    }}
                  >
                    {!business.cover_photo_url && (
                      <Store size={24} />
                    )}
                  </div>

                  {/* Business Info */}
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        className="font-semibold text-sm md:text-base line-clamp-2"
                        style={{ color: darkTheme.text.primary }}
                      >
                        {business.name}
                      </h3>
                      <button className="ml-2 hover:scale-110 transition-transform">
                        <Heart size={16} style={{ color: darkTheme.text.muted }} />
                      </button>
                    </div>

                    <p 
                      className="text-xs md:text-sm mb-2 line-clamp-2"
                      style={{ color: darkTheme.text.secondary }}
                    >
                      {business.descriptions?.[0]?.description || business.type}
                    </p>

                    {/* Rating and Distance */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-current" style={{ color: '#fbbf24' }} />
                        <span style={{ color: darkTheme.text.primary }}>
                          {business.rating?.toFixed(1) || '4.5'}
                        </span>
                        <span style={{ color: darkTheme.text.muted }}>
                          ({business.review_count || 0})
                        </span>
                      </div>
                      <span style={{ color: darkTheme.text.muted }}>
                        {business.distance || '1.2km'}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button 
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: darkTheme.background.secondary,
                          color: darkTheme.text.primary,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${business.phone || ''}`, '_self');
                        }}
                      >
                        <Phone size={12} className="inline mr-1" />
                        Call
                      </button>
                      <button 
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: darkTheme.neon.purple,
                          color: 'white',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to business details
                        }}
                      >
                        <MapPin size={12} className="inline mr-1" />
                        Visit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>

      {/* Business Upgrade Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="max-w-md w-full rounded-xl p-6 border"
            style={{
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass,
            }}
          >
            <div className="text-center mb-6">
              <Building2 size={48} style={{ color: darkTheme.neon.purple }} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                Upgrade to Business Member
              </h3>
              <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                Access business features like claiming your business and managing listings.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: darkTheme.background.secondary }}>
                <Store size={16} style={{ color: darkTheme.neon.purple }} />
                <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                  Claim and manage your business
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: darkTheme.background.secondary }}>
                <Camera size={16} style={{ color: darkTheme.neon.purple }} />
                <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                  Upload photos and menus
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: darkTheme.background.secondary }}>
                <Sparkles size={16} style={{ color: darkTheme.neon.purple }} />
                <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                  Enhanced visibility and analytics
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBusinessModal(false)}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
                style={{
                  background: darkTheme.background.secondary,
                  color: darkTheme.text.primary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeToBusiness}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
                style={{
                  background: darkTheme.neon.purple,
                  color: 'white',
                }}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

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