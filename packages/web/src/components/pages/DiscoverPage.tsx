// src/components/pages/DiscoverPage.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Camera, Star, Phone, MapPin, Sparkles, Search, Loader2, UserPlus, Store, Building2, Filter, Plus, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { discoverCategories, discoverContent } from '../../lib/mockData';
import { businessService, Business, BusinessFilters } from '../../lib/businessService';
import { getCurrentUser } from '../../lib/authService';
import FloatingButton from '../ui/FloatingButton';

interface DiscoverPageProps {
  selectedServiceCategory: string;
  setSelectedServiceCategory: (category: string) => void;
}

// Discovery tabs like in the second image
const discoveryTabs = [
  { id: 'following', label: 'Following', icon: Heart },
  { id: 'recommended', label: 'Recommended', icon: Star },
  { id: 'nearby', label: 'Nearby', icon: MapPin }
];

const DiscoverPage: React.FC<DiscoverPageProps> = ({
  selectedServiceCategory,
  setSelectedServiceCategory
}) => {
  const [selectedTab, setSelectedTab] = useState('recommended');
  
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
    if ((result as any).success) {
      setCurrentUser((result as any).user);
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
        case 'following':
          filters.sortBy = 'rating';
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
  const isBusinessMember = currentUser && currentUser.subscription_level !== 'free';

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

  // 生成随机价格范围
  const getPriceRange = () => {
    const ranges = ['$', '$$', '$$$', '$$$$'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  };

  // 生成随机营业状态
  const getOpenStatus = () => {
    return Math.random() > 0.3; // 70% 概率营业
  };

  // 生成随机标签
  const getTags = () => {
    const allTags = ['Popular', 'New', 'Trending', 'Best Rated', 'Local Favorite', 'Quick Service'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  };

  return (
    <div className="w-full" style={{ background: darkTheme.background.primary }}>
      {/* Page Description */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-1">
        <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
          "Discover local gems & amazing businesses"
        </p>
      </div>

      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Service Categories */}
          <div className="mb-4">
          </div>

                     {/* Discovery Tabs - 统一样式 */}
           <div className="flex items-center justify-center mb-6">
             <div 
               className="flex rounded-2xl p-1"
               style={{ background: darkTheme.background.glass }}
             >
               {discoveryTabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setSelectedTab(tab.id)}
                   className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all min-w-[120px] justify-center ${
                     selectedTab === tab.id ? 'shadow-lg' : ''
                   }`}
                   style={{
                     background: selectedTab === tab.id ? '#A855F7' : 'transparent',
                     color: selectedTab === tab.id ? 'white' : '#A855F7',
                   }}
                 >
                   <tab.icon size={16} />
                   {tab.label}
                 </button>
               ))}
             </div>
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
                                     '--tw-ring-color': '#A855F7',
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
                  className="p-3 md:p-4 rounded-xl border transition-all hover:scale-105 h-20 md:h-24 min-w-[80px]"
                                     style={{
                     background: selectedServiceCategory === category.id 
                       ? (category.id === 'all' ? '#A855F720' : `${category.color}20`) 
                       : darkTheme.background.card,
                     borderColor: selectedServiceCategory === category.id 
                       ? (category.id === 'all' ? '#A855F740' : `${category.color}40`) 
                       : darkTheme.background.glass,
                   }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 h-full">
                                         <category.icon 
                       size={18} 
                       className="md:w-5 md:h-5"
                       style={{ 
                         color: selectedServiceCategory === category.id 
                           ? (category.id === 'all' ? '#A855F7' : category.color) 
                           : '#A855F7' 
                       }} 
                     />
                     <span 
                       className="text-xs md:text-sm font-medium text-center leading-tight px-1"
                       style={{ 
                         color: selectedServiceCategory === category.id 
                           ? (category.id === 'all' ? '#A855F7' : category.color) 
                           : '#A855F7' 
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
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#A855F7' }} />
            </div>
          )}

          {/* 大众点评风格卡片布局 */}
          {businesses.length > 0 && (
            <div className="space-y-4 mb-8">
              {businesses.map((business) => (
                <div 
                  key={(business as any).id}
                  className="rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                  onClick={() => window.location.href = `/businesses/${(business as any).id}`}
                >
                  <div className="flex">
                    {/* Business Image */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                      <div 
                        className="w-full h-full relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, #A855F7, ${darkTheme.neon.blue})` 
                        }}
                      >
                        {/* 尝试显示图片，如果失败则显示渐变背景 */}
                        {(business as any).cover_photo_url && (
                          <img
                            src={(business as any).cover_photo_url}
                            alt={(business as any).name}
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => {
                              // 图片加载失败时隐藏图片，显示渐变背景
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* 默认图标 - 当没有图片或图片加载失败时显示 */}
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Store size={24} />
                        </div>
                      </div>
                      
                      {/* Heart Button */}
                      <button 
                        className="absolute top-2 right-2 w-6 h-6 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Heart size={12} className="text-white" />
                      </button>
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 
                          className="font-semibold text-base md:text-lg line-clamp-1"
                          style={{ color: darkTheme.text.primary }}
                        >
                          {(business as any).name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-current text-yellow-400" />
                          <span className="text-sm font-medium" style={{ color: darkTheme.text.primary }}>
                            {(business as any).rating?.toFixed(1) || '4.5'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getTags().map((tag: any, index: any) => (
                          <span 
                            key={index}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                                                       style={{
                             background: `#A855F720`,
                             color: '#A855F7',
                           }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p 
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: darkTheme.text.secondary }}
                      >
                        {(business as any).descriptions?.[0]?.description || (business as any).type}
                      </p>

                      {/* Bottom Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs">
                          {/* Price Range */}
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} style={{ color: darkTheme.text.muted }} />
                            <span style={{ color: darkTheme.text.muted }}>
                              {getPriceRange()}
                            </span>
                          </div>
                          
                          {/* Distance */}
                          <div className="flex items-center gap-1">
                            <MapPin size={12} style={{ color: darkTheme.text.muted }} />
                            <span style={{ color: darkTheme.text.muted }}>
                              {(business as any).distance || '1.2km'}
                            </span>
                          </div>
                          
                          {/* Open Status */}
                          <div className="flex items-center gap-1">
                            <Clock size={12} style={{ color: getOpenStatus() ? '#10B981' : '#EF4444' }} />
                            <span style={{ color: getOpenStatus() ? '#10B981' : '#EF4444' }}>
                              {getOpenStatus() ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </div>

                        {/* Review Count */}
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          {Math.floor(Math.random() * 500) + 50} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                   background: loading ? darkTheme.background.secondary : '#A855F7', 
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
      <div className="fixed bottom-20 right-4 md:right-6 z-50">
        <FloatingButton
          icon={Building2}
          onClick={handleBusinessAction}
          variant="primary"
          size="md"
        />
      </div>

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