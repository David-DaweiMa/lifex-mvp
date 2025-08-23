// src/components/pages/DiscoverPage.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Camera, Star, Phone, MapPin, Sparkles, Search, Loader2, UserPlus, Store, Building2, Filter, Plus, TrendingUp } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { discoverCategories, discoverContent } from '../../lib/mockData';
import { businessService, Business, BusinessFilters } from '../../lib/businessService';
import { getCurrentUser } from '../../lib/authService';

interface DiscoverPageProps {
  selectedServiceCategory: string;
  setSelectedServiceCategory: (category: string) => void;
}

// Discovery tabs like in the second image
const discoveryTabs = [
  { id: 'hot', label: 'Hot', icon: TrendingUp },
  { id: 'recommended', label: 'Recommended', icon: Star },
  { id: 'nearby', label: 'Nearby', icon: MapPin }
];

const DiscoverPage: React.FC<DiscoverPageProps> = ({
  selectedServiceCategory,
  setSelectedServiceCategory
}) => {
  const [selectedTab, setSelectedTab] = useState('hot');
  
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
  }, [selectedServiceCategory, selectedTab, searchQuery]);

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

      // Apply tab filters
      switch (selectedTab) {
        case 'hot':
          filters.sortBy = 'review_count';
          break;
        case 'nearby':
          filters.sortBy = 'name';
          break;
        case 'recommended':
        default:
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

  const handleBusinessAction = () => {
    if (!currentUser) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (!isBusinessMember) {
      setShowBusinessModal(true);
      return;
    }
    
    setShowBusinessModal(true);
  };

  const handleUpgradeToBusiness = () => {
    window.location.href = '/auth/register?type=business';
  };

  // 瀑布流布局 - 将数据分成两列
  const getColumnData = (data: Business[], columnIndex: number) => {
    return data.filter((_, index) => index % 2 === columnIndex);
  };

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Description */}
          <div className="mb-4">
            <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
              Find services
            </p>
          </div>

          {/* Discovery Tabs - 像第二个图片那样 */}
          <div className="flex gap-2 mb-6">
            {discoveryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: selectedTab === tab.id ? darkTheme.neon.purple : 'transparent',
                  color: selectedTab === tab.id ? 'white' : darkTheme.text.secondary,
                  border: selectedTab === tab.id ? 'none' : `1px solid ${darkTheme.background.glass}`,
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
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
          <div className="mb-6">
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

          {/* 小红书风格瀑布流 - 两列布局 */}
          {businesses.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
              {/* Left Column */}
              <div className="space-y-3 md:space-y-4">
                {getColumnData(businesses, 0).map((business) => (
                  <div 
                    key={business.id}
                    className="rounded-xl border overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                    onClick={() => window.location.href = `/businesses/${business.id}`}
                  >
                    {/* Business Image - 随机高度营造瀑布流效果 */}
                    <div 
                      className="relative overflow-hidden"
                      style={{ 
                        height: `${160 + (parseInt(business.id) % 3) * 40}px`,
                        background: business.cover_photo_url 
                          ? `url(${business.cover_photo_url}) center/cover` 
                          : `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.blue})` 
                      }}
                    >
                      {!business.cover_photo_url && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Store size={24} />
                        </div>
                      )}
                      
                      {/* Heart Button */}
                      <button 
                        className="absolute top-2 right-2 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Heart size={14} className="text-white" />
                      </button>
                    </div>

                    {/* Business Info */}
                    <div className="p-3">
                      <h3 
                        className="font-semibold text-sm mb-1 line-clamp-1"
                        style={{ color: darkTheme.text.primary }}
                      >
                        {business.name}
                      </h3>
                      
                      <p 
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: darkTheme.text.secondary }}
                      >
                        {business.descriptions?.[0]?.description || business.type}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-current text-yellow-400" />
                          <span style={{ color: darkTheme.text.primary }}>
                            {business.rating?.toFixed(1) || '4.5'}
                          </span>
                        </div>
                        <span style={{ color: darkTheme.text.muted }}>
                          {business.distance || '1.2km'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-3 md:space-y-4">
                {getColumnData(businesses, 1).map((business) => (
                  <div 
                    key={business.id}
                    className="rounded-xl border overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                    onClick={() => window.location.href = `/businesses/${business.id}`}
                  >
                    {/* Business Image - 随机高度营造瀑布流效果 */}
                    <div 
                      className="relative overflow-hidden"
                      style={{ 
                        height: `${160 + ((parseInt(business.id) + 1) % 3) * 40}px`,
                        background: business.cover_photo_url 
                          ? `url(${business.cover_photo_url}) center/cover` 
                          : `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.blue})` 
                      }}
                    >
                      {!business.cover_photo_url && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Store size={24} />
                        </div>
                      )}
                      
                      {/* Heart Button */}
                      <button 
                        className="absolute top-2 right-2 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Heart size={14} className="text-white" />
                      </button>
                    </div>

                    {/* Business Info */}
                    <div className="p-3">
                      <h3 
                        className="font-semibold text-sm mb-1 line-clamp-1"
                        style={{ color: darkTheme.text.primary }}
                      >
                        {business.name}
                      </h3>
                      
                      <p 
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: darkTheme.text.secondary }}
                      >
                        {business.descriptions?.[0]?.description || business.type}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-current text-yellow-400" />
                          <span style={{ color: darkTheme.text.primary }}>
                            {business.rating?.toFixed(1) || '4.5'}
                          </span>
                        </div>
                        <span style={{ color: darkTheme.text.muted }}>
                          {business.distance || '1.2km'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && businesses.length > 0 && (
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
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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

      {/* Floating Business Action Button */}
      <button
        onClick={handleBusinessAction}
        className="fixed bottom-20 right-4 md:right-6 w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 z-50 floating-button"
        style={{
          background: `linear-gradient(135deg, ${darkTheme.neon.purple}, ${darkTheme.neon.pink})`,
          boxShadow: `0 8px 32px ${darkTheme.neon.purple}40`,
        }}
      >
        <Building2 className="w-6 h-6 text-white" />
      </button>

      {/* Business Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="max-w-md w-full rounded-xl p-6 border"
            style={{
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass,
            }}
          >
            {!isBusinessMember ? (
              // Upgrade Modal
              <>
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
              </>
            ) : (
              // Business Actions Modal
              <>
                <div className="text-center mb-6">
                  <Building2 size={48} style={{ color: darkTheme.neon.purple }} className="mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                    Business Actions
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => window.location.href = '/business/claim'}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-opacity-80"
                    style={{ background: darkTheme.background.secondary }}
                  >
                    <Building2 size={16} style={{ color: darkTheme.neon.purple }} />
                    <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                      Claim Business
                    </span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/business/join'}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-opacity-80"
                    style={{ background: darkTheme.background.secondary }}
                  >
                    <UserPlus size={16} style={{ color: darkTheme.neon.purple }} />
                    <span className="text-sm" style={{ color: darkTheme.text.primary }}>
                      Join Business
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setShowBusinessModal(false)}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    background: darkTheme.background.secondary,
                    color: darkTheme.text.primary,
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 瀑布流布局优化 */
        .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .grid-cols-2 {
            gap: 1rem;
          }
        }

        /* 悬浮按钮动画 */
        .floating-button {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        /* 标签页样式优化 */
        .discovery-tabs button {
          min-width: fit-content;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default DiscoverPage;