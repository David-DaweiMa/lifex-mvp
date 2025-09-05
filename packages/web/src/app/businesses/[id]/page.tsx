'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Phone, MapPin, Globe, Clock, Heart, Share2, ArrowLeft, Mail } from 'lucide-react';
import { darkTheme } from '../../../lib/theme';
import { businessService, Business } from '../../../lib/businessService';

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const businessData = await businessService.getBusinessById(businessId);
      setBusiness(businessData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: darkTheme.neon.purple }}></div>
            <p style={{ color: darkTheme.text.secondary }}>Loading business details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load business</p>
            <button
              onClick={loadBusiness}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{ background: darkTheme.neon.purple, color: 'white' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className={`h-64 md:h-80 bg-gradient-to-br ${business.image} relative`}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Business Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {business.name}
              </h1>
              <p className="text-white/90 mb-3">
                {business.type}
              </p>
              
              {/* Rating and Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{business.rating.toFixed(1)}</span>
                  <span className="text-white/80">({business.review_count} reviews)</span>
                </div>
                <span className="text-white/80">•</span>
                <span className="text-white/80">{business.price}</span>
                <span className="text-white/80">•</span>
                <span className="text-white/80">{business.distance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => window.open(`tel:${business.phone}`)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all"
            style={{ background: darkTheme.neon.purple, color: 'white' }}
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
          
          <button
            onClick={() => window.open(business.google_maps_url)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all border"
            style={{ 
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
          >
            <MapPin className="w-4 h-4" />
            <span>Directions</span>
          </button>
          
          {business.website && (
            <button
              onClick={() => window.open(business.website)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all border"
              style={{ 
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </button>
          )}
          
          <button
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all border"
            style={{ 
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
          >
            <Clock className="w-4 h-4" />
            <span>Hours</span>
          </button>
        </div>

        {/* Business Details */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* AI Recommendation */}
            <div 
              className="rounded-xl p-6"
              style={{
                background: `${darkTheme.neon.purple}15`,
                border: `1px solid ${darkTheme.neon.purple}30`,
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
                AI Recommendation
              </h3>
              <p style={{ color: darkTheme.text.secondary }}>
                {business.aiReason}
              </p>
            </div>

            {/* Description */}
            <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
              <h3 className="font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
                About
              </h3>
              <p style={{ color: darkTheme.text.secondary }}>
                {business.type}
              </p>
              {business.descriptions && business.descriptions.length > 0 && (
                <div className="mt-4">
                  {business.descriptions.map((desc: any, index: number) => (
                    <p key={index} className="text-sm mt-2" style={{ color: darkTheme.text.secondary }}>
                      {desc.content}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Highlights */}
            {business.highlights.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
                <h3 className="font-semibold mb-3" style={{ color: darkTheme.text.primary }}>
                  Highlights
                </h3>
                <div className="flex flex-wrap gap-2">
                  {business.highlights.map((highlight: any, index: any) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: `${darkTheme.neon.purple}20`,
                        color: darkTheme.neon.purple,
                      }}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Gallery */}
            {business.photos && business.photos.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
                <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                  Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {business.photos.slice(0, 6).map((photo: any, index: number) => (
                    <div 
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden"
                      style={{ background: darkTheme.background.secondary }}
                    >
                      {photo.photo_url ? (
                        <img 
                          src={photo.photo_url} 
                          alt={`${business.name} photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                            Photo {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {business.reviews && business.reviews.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
                <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {business.reviews.slice(0, 5).map((review: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-b-0" style={{ borderColor: darkTheme.background.glass }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_: any, i: any) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-400'} 
                            />
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: darkTheme.text.muted }}>
                          {review.author_name || 'Anonymous'}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: darkTheme.text.secondary }}>
                        {review.text || review.content || 'No review text available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
              <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                Contact Information
              </h3>
              
              <div className="space-y-3">
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" style={{ color: darkTheme.text.muted }} />
                    <span style={{ color: darkTheme.text.secondary }}>{business.phone}</span>
                  </div>
                )}
                
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5" style={{ color: darkTheme.text.muted }} />
                    <span style={{ color: darkTheme.text.secondary }}>{business.address}</span>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4" style={{ color: darkTheme.text.muted }} />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" style={{ color: darkTheme.text.muted }} />
                    <a
                      href={`mailto:${business.email}`}
                      className="text-blue-400 hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Status */}
            <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
              <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                Business Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: darkTheme.text.secondary }}>Status</span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      business.isOpen 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {business.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span style={{ color: darkTheme.text.secondary }}>Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span style={{ color: darkTheme.text.primary }}>{business.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span style={{ color: darkTheme.text.secondary }}>Reviews</span>
                  <span style={{ color: darkTheme.text.primary }}>{business.review_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span style={{ color: darkTheme.text.secondary }}>Price Range</span>
                  <span style={{ color: darkTheme.text.primary }}>{business.price}</span>
                </div>

                {business.city && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: darkTheme.text.secondary }}>Location</span>
                    <span style={{ color: darkTheme.text.primary }}>
                      {business.city}{business.country ? `, ${business.country}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            {business.opening_hours && (
              <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
                <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                  Opening Hours
                </h3>
                
                <div className="space-y-2 text-sm">
                  {business.opening_hours && typeof business.opening_hours === 'string' && (
                    <div style={{ color: darkTheme.text.secondary }}>
                      {business.opening_hours}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Preview */}
            {business.menus && business.menus.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: darkTheme.background.card }}>
                <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>
                  Menu
                </h3>
                
                <div className="space-y-2">
                  {business.menus.slice(0, 3).map((menu: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span style={{ color: darkTheme.text.primary }}>{menu.name || `Menu ${index + 1}`}</span>
                      {menu.description && (
                        <p className="text-xs mt-1" style={{ color: darkTheme.text.muted }}>
                          {menu.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {business.menus.length > 3 && (
                    <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                      +{business.menus.length - 3} more menus
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
