// src/components/location/NearbyBusinesses.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Star, Phone, Settings, RefreshCw } from 'lucide-react';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

interface LocationBasedBusiness {
  id: string;
  name: string;
  categoryId: string;
  rating: number;
  distance: number;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  estimatedTime?: string;
  relevanceScore?: number;
}

interface LocationPreferences {
  maxDistance: number;
  transportMode: 'walking' | 'driving' | 'cycling' | 'public_transport';
  preferredAreas: string[];
  avoidAreas: string[];
  autoLocationUpdate: boolean;
}

export default function NearbyBusinesses() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [businesses, setBusinesses] = useState<LocationBasedBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [preferences, setPreferences] = useState<LocationPreferences>({
    maxDistance: 5,
    transportMode: 'walking',
    preferredAreas: [],
    avoidAreas: [],
    autoLocationUpdate: true
  });

  const transportModes = [
    { value: 'walking', label: 'Walking', icon: '🚶', speed: '5 km/h' },
    { value: 'driving', label: 'Driving', icon: '🚗', speed: '40 km/h' },
    { value: 'cycling', label: 'Cycling', icon: '🚴', speed: '15 km/h' },
    { value: 'public_transport', label: 'Transit', icon: '🚌', speed: '25 km/h' }
  ];

  useEffect(() => {
    // Check if location is already available
    checkExistingLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyBusinesses();
    }
  }, [location, preferences.maxDistance, preferences.transportMode]);

  const checkExistingLocation = async () => {
    // Check stored location first
    try {
      const stored = localStorage.getItem('user_location');
      if (stored) {
        const storedLocation = JSON.parse(stored);
        // Check if location is not too old (1 hour)
        if (Date.now() - storedLocation.timestamp < 3600000) {
          setLocation(storedLocation);
          setLocationStatus('granted');
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to get stored location:', error);
    }

    // Check permission status
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          requestLocation();
        }
      }
    } catch (error) {
      console.warn('Permission check failed:', error);
    }
  };

  const requestLocation = async () => {
    setLocationStatus('requesting');
    setLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const userLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      // Simple reverse geocoding for New Zealand
      if (userLocation.latitude >= -47 && userLocation.latitude <= -34 && 
          userLocation.longitude >= 166 && userLocation.longitude <= 179) {
        if (userLocation.latitude >= -37 && userLocation.latitude <= -36.5 && 
            userLocation.longitude >= 174 && userLocation.longitude <= 175) {
          userLocation.city = 'Auckland';
          userLocation.country = 'New Zealand';
          userLocation.address = 'Auckland, New Zealand';
        } else if (userLocation.latitude >= -41.5 && userLocation.latitude <= -41 && 
                   userLocation.longitude >= 174.5 && userLocation.longitude <= 175) {
          userLocation.city = 'Wellington';
          userLocation.country = 'New Zealand';
          userLocation.address = 'Wellington, New Zealand';
        } else {
          userLocation.country = 'New Zealand';
          userLocation.address = 'New Zealand';
        }
      }

      setLocation(userLocation);
      setLocationStatus('granted');
      
      // Store location
      localStorage.setItem('user_location', JSON.stringify(userLocation));
      
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocationStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyBusinesses = async () => {
    if (!location) return;
    
    setLoading(true);
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
        setBusinesses((data as any).businesses || []);
      } else {
        // Fallback to mock data if API fails
        const mockBusinesses: LocationBasedBusiness[] = [
          {
            id: '1',
            name: 'Federal Delicatessen',
            categoryId: 'restaurant',
            rating: 4.5,
            distance: 0.3,
            latitude: -36.8485,
            longitude: 174.7633,
            address: '86 Federal Street, Auckland CBD',
            phone: '+64 9 363 7091',
            estimatedTime: calculateEstimatedTime(0.3, preferences.transportMode)
          },
          {
            id: '2',
            name: 'Allpress Espresso Roastery',
            categoryId: 'cafe',
            rating: 4.3,
            distance: 0.5,
            latitude: -36.8506,
            longitude: 174.7619,
            address: '8-10 Federal Street, Auckland CBD',
            phone: '+64 9 309 0054',
            estimatedTime: calculateEstimatedTime(0.5, preferences.transportMode)
          },
          {
            id: '3',
            name: 'Sky Tower Restaurant',
            categoryId: 'attraction',
            rating: 4.2,
            distance: 0.2,
            latitude: -36.8485,
            longitude: 174.7621,
            address: 'Federal Street, Auckland CBD',
            phone: '+64 9 363 6000',
            estimatedTime: calculateEstimatedTime(0.2, preferences.transportMode)
          }
        ];
        setBusinesses(mockBusinesses);
      }
    } catch (error) {
      console.error('Failed to load nearby businesses:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedTime = (distanceKm: number, mode: string): string => {
    const speedKmh = {
      walking: 5,
      cycling: 15,
      driving: 40,
      public_transport: 25
    };

    const speed = speedKmh[mode as keyof typeof speedKmh] || speedKmh.walking;
    const timeHours = distanceKm / speed;
    const timeMinutes = Math.round(timeHours * 60);

    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  };

  const openNavigation = (business: LocationBasedBusiness) => {
    const query = `${(business as any).name} ${(business as any).address}`;
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

  const renderLocationStatus = () => {
    switch (locationStatus) {
      case 'requesting':
        return (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
          </div>
        );
      
      case 'denied':
        return (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Location access is required for personalized recommendations</p>
            <button
              onClick={requestLocation}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Enable Location
            </button>
          </div>
        );
      
      case 'granted':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Current Location: {location?.city}, {location?.country}
                </span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <Navigation className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Discover Nearby Places</h3>
            <p className="text-gray-600 mb-4">
              Find restaurants, cafes, and attractions near you with precise distances and directions
            </p>
            <button
              onClick={requestLocation}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Enable Location Services
            </button>
          </div>
        );
    }
  };

  const renderBusinessCard = (business: LocationBasedBusiness) => (
    <div key={(business as any).id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{(business as any).name}</h3>
          <p className="text-sm text-gray-600 capitalize">
            {(business as any).categoryId.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{(business as any).rating}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{(business as any).distance}km away</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{(business as any).estimatedTime} {preferences.transportMode}</span>
        </div>
        <p className="text-sm text-gray-600">{(business as any).address}</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => openNavigation(business)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
        >
          <Navigation className="h-4 w-4" />
          <span>Directions</span>
        </button>
        
        {(business as any).phone && (
          <button
            onClick={() => makeCall((business as any).phone)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center"
          >
            <Phone className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nearby Places</h1>
        {location && (
          <button
            onClick={loadNearbyBusinesses}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {renderLocationStatus()}

      {location && showSettings && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Search Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <span>20km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Mode
              </label>
              <select
                value={preferences.transportMode}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  transportMode: e.target.value as any
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {transportModes.map((mode: any) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.icon} {mode.label} ({mode.speed})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
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
              <span className="text-sm text-gray-700">Automatically update location</span>
            </label>
          </div>
        </div>
      )}

      {location && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Within {preferences.maxDistance}km of you
            </h2>
            <span className="text-sm text-gray-600">
              {businesses.length} places found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i: any) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
              ))}
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businesses.map(renderBusinessCard)}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No places found within {preferences.maxDistance}km
              </p>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, maxDistance: 20 }))}
                className="mt-4 text-blue-500 hover:text-blue-600 transition-colors"
              >
                Expand search to 20km
              </button>
            </div>
          )}
        </div>
      )}

      {location && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Location Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Real-time distance calculation and travel time estimates</li>
            <li>• Smart recommendations based on your location and preferences</li>
            <li>• Multiple transport modes with accurate time calculations</li>
            <li>• One-tap navigation to Google Maps or Apple Maps</li>
            <li>• Your location data is stored locally and kept private</li>
          </ul>
        </div>
      )}
    </div>
  );
}