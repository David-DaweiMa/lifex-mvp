// src/components/location/LocationManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, MessageCircle, Settings, Users, Star, Phone, Clock, RefreshCw } from 'lucide-react';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

interface LocationPreferences {
  maxDistance: number;
  transportMode: 'walking' | 'driving' | 'cycling' | 'public_transport';
  autoLocationUpdate: boolean;
}

interface LocationBasedBusiness {
  id: string;
  name: string;
  rating: number;
  distance: number;
  address: string;
  phone: string;
  estimatedTime: string;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  recommendations?: LocationBasedBusiness[];
  isLocationBased: boolean;
  timestamp: number;
}

export default function LocationManager() {
  const [activeTab, setActiveTab] = useState<'nearby' | 'chat' | 'settings'>('nearby');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [preferences, setPreferences] = useState<LocationPreferences>({
    maxDistance: 5,
    transportMode: 'walking',
    autoLocationUpdate: true
  });
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Businesses state
  const [nearbyBusinesses, setNearbyBusinesses] = useState<LocationBasedBusiness[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);

  useEffect(() => {
    checkLocationStatus();
  }, []);

  useEffect(() => {
    if (location && preferences.autoLocationUpdate) {
      loadNearbyBusinesses();
    }
  }, [location, preferences.maxDistance, preferences.transportMode]);

  const checkLocationStatus = async () => {
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions?.query({ name: 'geolocation' });
        if (permission?.state === 'granted') {
          await requestLocation();
        }
      }
    } catch (error) {
      console.warn('Permission check failed:', error);
    }
  };

  const requestLocation = async () => {
    setLocationStatus('requesting');
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        city: 'Auckland', // Mock city detection
        country: 'New Zealand',
        address: 'Auckland, New Zealand'
      };

      setLocation(newLocation);
      setLocationStatus('granted');
      
      // Store location
      localStorage.setItem('user_location', JSON.stringify(newLocation));
      
    } catch (error) {
      console.error('Location request failed:', error);
      setLocationStatus('denied');
    }
  };

  const loadNearbyBusinesses = async () => {
    if (!location) return;
    
    setBusinessesLoading(true);
    try {
      const response = await fetch('/api/location/nearby-businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: preferences.maxDistance,
          transportMode: preferences.transportMode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNearbyBusinesses(data.businesses || []);
      } else {
        // Fallback to mock data
        const mockBusinesses: LocationBasedBusiness[] = [
          {
            id: '1',
            name: 'Federal Delicatessen',
            rating: 4.5,
            distance: 0.3,
            address: '86 Federal Street, Auckland CBD',
            phone: '+64 9 363 7091',
            estimatedTime: '4 min'
          },
          {
            id: '2',
            name: 'Allpress Espresso',
            rating: 4.3,
            distance: 0.5,
            address: '8-10 Federal Street, Auckland CBD',
            phone: '+64 9 309 0054',
            estimatedTime: '6 min'
          },
          {
            id: '3',
            name: 'Sky Tower Restaurant',
            rating: 4.2,
            distance: 0.2,
            address: 'Federal Street, Auckland CBD',
            phone: '+64 9 363 6000',
            estimatedTime: '3 min'
          }
        ];
        setNearbyBusinesses(mockBusinesses);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
      // Use mock data as fallback
      setNearbyBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;
    
    setChatLoading(true);
    const messageId = Date.now().toString();
    
    try {
      const response = await fetch('/api/chat-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          userId: 'demo-user',
          sessionId: 'demo-session',
          userLocation: location,
          locationPreferences: {
            maxDistance: preferences.maxDistance,
            transportMode: preferences.transportMode
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const chatMessage: ChatMessage = {
          id: messageId,
          message: currentMessage,
          response: data.response,
          recommendations: data.recommendations,
          isLocationBased: data.locationContext?.isLocationBased || false,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, chatMessage]);
      } else {
        // Fallback response
        const mockResponse: ChatMessage = {
          id: messageId,
          message: currentMessage,
          response: `I found some great places for "${currentMessage}" in ${location?.city || 'your area'}! Here are my top recommendations based on your location.`,
          recommendations: nearbyBusinesses.slice(0, 2),
          isLocationBased: true,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, mockResponse]);
      }
      
      setCurrentMessage('');
      
    } catch (error) {
      console.error('Chat message failed:', error);
      // Fallback response
      const fallbackResponse: ChatMessage = {
        id: messageId,
        message: currentMessage,
        response: "I'm having trouble connecting right now, but I'd love to help you find great places nearby!",
        recommendations: [],
        isLocationBased: false,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, fallbackResponse]);
      setCurrentMessage('');
    } finally {
      setChatLoading(false);
    }
  };

  const openNavigation = (business: LocationBasedBusiness) => {
    const query = `${business.name} ${business.address}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.location.href = `maps://maps.google.com/?q=${encodeURIComponent(query)}`;
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const renderBusinessCard = (business: LocationBasedBusiness, showActions = true) => (
    <div key={business.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{business.name}</h4>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm">{business.rating}</span>
        </div>
      </div>
      
      <div className="space-y-1 mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          <span>{business.distance}km away</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          <span>{business.estimatedTime} {preferences.transportMode}</span>
        </div>
        <p className="text-sm text-gray-600">{business.address}</p>
      </div>
      
      {showActions && (
        <div className="flex space-x-2">
          <button
            onClick={() => openNavigation(business)}
            className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
          >
            <Navigation className="h-3 w-3" />
            <span>Directions</span>
          </button>
          {business.phone && (
            <button
              onClick={() => makeCall(business.phone)}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
            >
              <Phone className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderLocationStatus = () => {
    switch (locationStatus) {
      case 'requesting':
        return (
          <div className="text-center py-6">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Getting your location...</p>
          </div>
        );
      
      case 'denied':
        return (
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Location access needed for personalized recommendations</p>
            <button
              onClick={requestLocation}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Enable Location
            </button>
          </div>
        );
      
      case 'granted':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                {location?.city}, {location?.country}
              </span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-6">
            <Navigation className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Location-Based Recommendations</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get personalized suggestions with accurate distances and directions
            </p>
            <button
              onClick={requestLocation}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Enable Location Services
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Location Services</h1>
        <p className="text-blue-100">
          Discover nearby places with AI-powered recommendations and precise location data
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'nearby', label: 'Nearby Places', icon: MapPin },
            { id: 'chat', label: 'AI Chat', icon: MessageCircle },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'nearby' && (
          <div>
            {renderLocationStatus()}
            
            {location && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Places within {preferences.maxDistance}km
                  </h2>
                  <button
                    onClick={loadNearbyBusinesses}
                    disabled={businessesLoading}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${businessesLoading ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                  </button>
                </div>

                {businessesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                    ))}
                  </div>
                ) : nearbyBusinesses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nearbyBusinesses.map(business => renderBusinessCard(business))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No places found in your area</p>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, maxDistance: 20 }))}
                      className="mt-2 text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Expand search to 20km
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">AI Location Assistant</h2>
              <p className="text-sm text-gray-600">
                Ask me about nearby restaurants, cafes, attractions, or anything else you'd like to discover!
              </p>
            </div>

            {!location && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Tip:</strong> Enable location services to get personalized recommendations with accurate distances and directions.
                </p>
              </div>
            )}

            {/* Chat messages */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start a conversation to get personalized recommendations!</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">Try asking:</p>
                    <div className="space-x-2">
                      {[
                        "Find restaurants near me",
                        "Best coffee shops nearby",
                        "What attractions should I visit?"
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => setCurrentMessage(suggestion)}
                          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                chatMessages.map(chat => (
                  <div key={chat.id} className="space-y-3">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                    
                    {/* AI response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                        <p className="text-sm text-gray-800 mb-2">{chat.response}</p>
                        
                        {/* Recommendations */}
                        {chat.recommendations && chat.recommendations.length > 0 && (
                          <div className="space-y-2 mt-3">
                            <p className="text-xs text-gray-600 font-medium">Recommendations:</p>
                            {chat.recommendations.map(business => renderBusinessCard(business, false))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask me about places near you..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !currentMessage.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Location Preferences</h2>
            
            <div className="space-y-6">
              {/* Location Status */}
              <div>
                <h3 className="font-medium mb-2">Location Access</h3>
                {renderLocationStatus()}
              </div>

              {/* Search Radius */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Search Radius: {preferences.maxDistance}km
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={preferences.maxDistance}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    maxDistance: Number(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1km</span>
                  <span>10km</span>
                  <span>20km</span>
                </div>
              </div>

              {/* Transport Mode */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Preferred Transport Mode
                </label>
                <select
                  value={preferences.transportMode}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    transportMode: e.target.value as any
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="walking">🚶 Walking (5 km/h)</option>
                  <option value="cycling">🚴 Cycling (15 km/h)</option>
                  <option value="driving">🚗 Driving (40 km/h)</option>
                  <option value="public_transport">🚌 Public Transport (25 km/h)</option>
                </select>
              </div>

              {/* Auto Update */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.autoLocationUpdate}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      autoLocationUpdate: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Automatically update recommendations when location changes</span>
                </label>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Privacy & Data</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your location is stored locally on your device</li>
                  <li>• Location data is only used to provide relevant recommendations</li>
                  <li>• You can disable location access at any time</li>
                  <li>• We never share your location with third parties</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}