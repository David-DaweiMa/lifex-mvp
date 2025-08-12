// src/components/pages/TrendingPage.tsx
import React from 'react';
import { TrendingUp, Plus, Heart, MessageCircle, MapPin } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { trendingData, trendingPosts } from '../../lib/mockData';
import { Category } from '../../lib/types';

interface TrendingPageProps {
  selectedServiceCategory: string;
  setSelectedServiceCategory: (category: string) => void;
}

const TrendingPage: React.FC<TrendingPageProps> = ({
  selectedServiceCategory,
  setSelectedServiceCategory
}) => {
  
  const getFilteredTrendingPosts = () => {
    if (selectedServiceCategory === 'all') return trendingPosts;
    return trendingPosts.filter(post => post.category === selectedServiceCategory);
  };

  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                What's Trending
              </h2>
              <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
                Discover what's hot in New Zealand right now
              </p>
            </div>
          </div>

          {/* Trending Categories */}
          <div className="flex gap-2 md:gap-3 text-sm mb-6 md:mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { label: "All Trends", active: true },
              { label: "Technology", active: false },
              { label: "Food & Drink", active: false },
              { label: "Lifestyle", active: false },
              { label: "Business", active: false }
            ].map((tag, idx) => (
              <button
                key={idx}
                className="px-3 md:px-4 py-2 rounded-full transition-all whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
                style={{
                  background: tag.active ? darkTheme.neon.purple : darkTheme.background.card,
                  borderColor: tag.active ? darkTheme.neon.purple : darkTheme.background.glass,
                  color: tag.active ? 'white' : darkTheme.text.primary,
                  border: '1px solid',
                  minWidth: 'fit-content',
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Content Layout - Pinterest/Small Red Book Style Two Column Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Left Column */}
            <div className="space-y-3 md:space-y-4">
              {/* Top Trending in left column */}
              {trendingData.filter((_, index) => index % 2 === 0).map((trend, idx) => (
                <div 
                  key={trend.id}
                  className="p-4 md:p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${trend.color}20`, border: `1px solid ${trend.color}40` }}
                    >
                      <trend.icon size={20} className="md:w-6 md:h-6" style={{ color: trend.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm md:text-base pr-2" style={{ color: darkTheme.text.primary }}>
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp size={12} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.green }} />
                          <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.green }}>
                            {trend.growth}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm mb-2" style={{ color: darkTheme.text.secondary }}>
                        {trend.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 md:px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${trend.color}20`,
                            color: trend.color,
                            border: `1px solid ${trend.color}40`
                          }}
                        >
                          {trend.category}
                        </span>
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          #{idx * 2 + 1} trending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Community Posts in left column */}
              {getFilteredTrendingPosts().filter((_, index) => index % 2 === 0).map((post) => (
                <div 
                  key={post.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg flex-shrink-0"
                        style={{ background: `${darkTheme.neon.purple}20` }}
                      >
                        {post.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm md:text-base block truncate" style={{ color: darkTheme.text.primary }}>
                          {post.author.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          <MapPin size={10} className="md:w-3 md:h-3" />
                          <span className="truncate">{post.location}</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-sm md:text-base mb-2" style={{ color: darkTheme.text.primary }}>
                      {post.title}
                    </h3>

                    <p className="text-sm md:text-base mb-3" style={{ color: darkTheme.text.secondary }}>
                      {post.content}
                    </p>

                    <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
                      {post.images.map((image, imgIdx) => (
                        <div 
                          key={imgIdx}
                          className={`bg-gradient-to-br ${image} rounded-xl h-24 md:h-32 relative`}
                        >
                          <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: darkTheme.background.glass }}>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1">
                          <Heart size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.pink }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1">
                          <MessageCircle size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3 md:space-y-4">
              {/* Top Trending in right column */}
              {trendingData.filter((_, index) => index % 2 === 1).map((trend, idx) => (
                <div 
                  key={trend.id}
                  className="p-4 md:p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${trend.color}20`, border: `1px solid ${trend.color}40` }}
                    >
                      <trend.icon size={20} className="md:w-6 md:h-6" style={{ color: trend.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm md:text-base pr-2" style={{ color: darkTheme.text.primary }}>
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp size={12} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.green }} />
                          <span className="text-xs md:text-sm font-medium" style={{ color: darkTheme.neon.green }}>
                            {trend.growth}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm mb-2" style={{ color: darkTheme.text.secondary }}>
                        {trend.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 md:px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${trend.color}20`,
                            color: trend.color,
                            border: `1px solid ${trend.color}40`
                          }}
                        >
                          {trend.category}
                        </span>
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          #{idx * 2 + 2} trending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Community Posts in right column */}
              {getFilteredTrendingPosts().filter((_, index) => index % 2 === 1).map((post) => (
                <div 
                  key={post.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    background: darkTheme.background.card,
                    borderColor: darkTheme.background.glass,
                  }}
                >
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg flex-shrink-0"
                        style={{ background: `${darkTheme.neon.purple}20` }}
                      >
                        {post.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm md:text-base block truncate" style={{ color: darkTheme.text.primary }}>
                          {post.author.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                          <MapPin size={10} className="md:w-3 md:h-3" />
                          <span className="truncate">{post.location}</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-sm md:text-base mb-2" style={{ color: darkTheme.text.primary }}>
                      {post.title}
                    </h3>

                    <p className="text-sm md:text-base mb-3" style={{ color: darkTheme.text.secondary }}>
                      {post.content}
                    </p>

                    <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
                      {post.images.map((image, imgIdx) => (
                        <div 
                          key={imgIdx}
                          className={`bg-gradient-to-br ${image} rounded-xl h-24 md:h-32 relative`}
                        >
                          <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: darkTheme.background.glass }}>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1">
                          <Heart size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.neon.pink }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1">
                          <MessageCircle size={14} className="md:w-4 md:h-4" style={{ color: darkTheme.text.muted }} />
                          <span className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;