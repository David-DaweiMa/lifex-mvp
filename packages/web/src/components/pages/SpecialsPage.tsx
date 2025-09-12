// src/components/pages/SpecialsPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Tag, Filter, Search, Calendar, DollarSign, Users, Eye } from 'lucide-react';
import { darkTheme } from '../../lib/theme';

interface Special {
  id: string;
  businessName: string;
  businessType: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  image: string;
  validUntil: string;
  isVerified: boolean;
  views: number;
  claimed: number;
  maxClaims?: number;
  tags: string[];
}

const SpecialsPage: React.FC = () => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [filteredSpecials, setFilteredSpecials] = useState<Special[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('distance');

  // 从数据库获取specials数据
  const fetchSpecials = async () => {
    try {
      const response = await fetch('/api/specials');
      const data = await response.json();
      
      if (data.success) {
        setSpecials(data.data.specials);
        setFilteredSpecials(data.data.specials);
      } else {
        console.error('获取specials数据失败:', data.message);
        // 如果API失败，使用空数组
        setSpecials([]);
        setFilteredSpecials([]);
      }
    } catch (error) {
      console.error('获取specials数据时出错:', error);
      // 如果请求失败，使用空数组
      setSpecials([]);
      setFilteredSpecials([]);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'food', name: 'Food & Drink', icon: '🍽️' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'services', name: 'Services', icon: '🔧' }
  ];

  useEffect(() => {
    fetchSpecials();
  }, []);

  useEffect(() => {
    let filtered = specials;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(special => special.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(special =>
        special.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        special.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        special.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'discount':
        filtered.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'expiry':
        filtered.sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime());
        break;
    }

    setFilteredSpecials(filtered);
  }, [specials, selectedCategory, searchQuery, sortBy]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    const today = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleClaimSpecial = (specialId: string) => {
    setSpecials(prev => prev.map(special => 
      special.id === specialId 
        ? { ...special, claimed: special.claimed + 1 }
        : special
    ));
  };

  return (
    <div className="p-4 md:p-6 space-y-6" style={{ background: darkTheme.gradients.background }}>
      {/* Page Description */}
      <div className="pb-1">
        <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
          "Grab amazing deals from local businesses"
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: darkTheme.text.secondary }}
          />
          <input
            type="text"
            placeholder="Search specials, businesses, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-0"
            style={{ 
              background: darkTheme.background.card,
              color: darkTheme.text.primary,
              borderColor: darkTheme.background.glass
            }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                background: selectedCategory === category.id 
                  ? darkTheme.neon.purple 
                  : darkTheme.background.card
              }}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: darkTheme.text.secondary }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border-0 text-sm"
            style={{ 
              background: darkTheme.background.card,
              color: darkTheme.text.primary,
              borderColor: darkTheme.background.glass
            }}
          >
            <option value="distance">Sort by Distance</option>
            <option value="discount">Sort by Discount</option>
            <option value="rating">Sort by Rating</option>
            <option value="expiry">Sort by Expiry</option>
          </select>
        </div>
      </div>

      {/* Specials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSpecials.map((special: any) => (
          <div
            key={special.id}
            className="rounded-xl overflow-hidden border"
            style={{ 
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass
            }}
          >
            {/* Special Image */}
            <div className={`h-32 bg-gradient-to-r ${special.image} relative`}>
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                  <Tag size={12} />
                  {special.discountPercent}% OFF
                </div>
              </div>
              <div className="absolute top-3 right-3">
                {special.isVerified && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{special.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{getDaysUntilExpiry(special.validUntil)} days left</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Content */}
            <div className="p-4 space-y-3">
              {/* Business Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: darkTheme.text.primary }}>
                    {special.businessName}
                  </h3>
                  <p className="text-xs" style={{ color: darkTheme.text.secondary }}>
                    {special.businessType}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs" style={{ color: darkTheme.text.secondary }}>
                    {special.rating} ({special.reviewCount})
                  </span>
                </div>
              </div>

              {/* Special Title */}
              <h4 className="font-bold text-base" style={{ color: darkTheme.text.primary }}>
                {special.title}
              </h4>

              {/* Description */}
              <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                {special.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: darkTheme.neon.green }}>
                  {formatPrice(special.discountPrice)}
                </span>
                <span className="text-sm line-through" style={{ color: darkTheme.text.secondary }}>
                  {formatPrice(special.originalPrice)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ 
                  background: darkTheme.neon.green + '20',
                  color: darkTheme.neon.green
                }}>
                  Save {formatPrice(special.originalPrice - special.discountPrice)}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {special.tags.map((tag: any, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{ 
                      background: darkTheme.background.glass,
                      color: darkTheme.text.secondary
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs" style={{ color: darkTheme.text.secondary }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{special.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{special.claimed} claimed</span>
                  </div>
                </div>
                {special.maxClaims && (
                  <div className="text-xs">
                    {special.maxClaims - special.claimed} left
                  </div>
                )}
              </div>

              {/* Claim Button */}
              <button
                onClick={() => handleClaimSpecial(special.id)}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: darkTheme.neon.purple }}
              >
                Claim This Deal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSpecials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: darkTheme.text.primary }}>
            No specials found
          </h3>
          <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SpecialsPage;
