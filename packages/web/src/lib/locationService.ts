// src/lib/locationService.ts
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

export interface LocationPreferences {
  maxDistance: number; // in kilometers
  transportMode: 'walking' | 'driving' | 'cycling' | 'public_transport';
  preferredAreas: string[];
  avoidAreas: string[];
  autoLocationUpdate: boolean;
}

export interface LocationBasedBusiness {
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

export class LocationService {
  private static instance: LocationService;
  private currentLocation: UserLocation | null = null;
  private locationWatchId: number | null = null;
  private locationCallbacks: ((location: UserLocation | null) => void)[] = [];

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Failed to check location permission:', error);
      return 'prompt';
    }
  }

  /**
   * Request user's current location
   */
  async getCurrentLocation(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Try to get address information
          try {
            const addressInfo = await this.reverseGeocode(
              location.latitude, 
              location.longitude
            );
            Object.assign(location, addressInfo);
          } catch (error) {
            console.warn('Failed to get address info:', error);
          }

          this.currentLocation = location;
          this.notifyLocationUpdate(location);
          
          // Store location
          this.storeLocation(location);
          
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  /**
   * Start watching user's location
   */
  startLocationWatch(
    callback: (location: UserLocation | null) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): void {
    if (!this.isSupported()) {
      callback(null);
      return;
    }

    this.addLocationCallback(callback);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000, // 1 minute
      ...options
    };

    this.locationWatchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        try {
          const addressInfo = await this.reverseGeocode(
            location.latitude, 
            location.longitude
          );
          Object.assign(location, addressInfo);
        } catch (error) {
          console.warn('Failed to get address info:', error);
        }

        this.currentLocation = location;
        this.notifyLocationUpdate(location);
        this.storeLocation(location);
      },
      (error) => {
        console.error('Location watch error:', error);
        this.notifyLocationUpdate(null);
      },
      defaultOptions
    );
  }

  /**
   * Stop watching location
   */
  stopLocationWatch(): void {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  /**
   * Get stored location from localStorage
   */
  getStoredLocation(): UserLocation | null {
    try {
      const stored = localStorage.getItem('user_location');
      if (stored) {
        const location = JSON.parse(stored);
        // Check if location is not too old (1 hour)
        if (Date.now() - location.timestamp < 3600000) {
          return location;
        }
      }
    } catch (error) {
      console.warn('Failed to get stored location:', error);
    }
    return null;
  }

  /**
   * Store location to localStorage
   */
  storeLocation(location: UserLocation): void {
    try {
      localStorage.setItem('user_location', JSON.stringify(location));
    } catch (error) {
      console.warn('Failed to store location:', error);
    }
  }

  /**
   * Get location with fallback to stored location
   */
  async getLocationWithFallback(): Promise<UserLocation | null> {
    try {
      // Try to get current location first
      const location = await this.getCurrentLocation({ timeout: 5000 });
      return location;
    } catch (error) {
      console.warn('Failed to get current location, using stored location:', error);
      // Fallback to stored location
      return this.getStoredLocation();
    }
  }

  /**
   * Get nearby businesses using the database function
   */
  async getNearbyBusinesses(
    userLocation: UserLocation,
    options: {
      radiusKm?: number;
      categoryId?: string;
      limit?: number;
      transportMode?: string;
    } = {}
  ): Promise<LocationBasedBusiness[]> {
    try {
      const { radiusKm = 5, categoryId, limit = 10, transportMode = 'walking' } = options;
      
      const response = await fetch('/api/location/nearby-businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm,
          categoryId: categoryId || null,
          limit,
          transportMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby businesses');
      }

      const data = await response.json();
      return data.businesses || [];
    } catch (error) {
      console.error('Failed to get nearby businesses:', error);
      return [];
    }
  }

  /**
   * Calculate estimated travel time
   */
  calculateEstimatedTime(distanceKm: number, mode: string): string {
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
  }

  /**
   * Open navigation to a business
   */
  openNavigation(business: LocationBasedBusiness): void {
    const query = `${business.name} ${business.address}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.location.href = `maps://maps.google.com/?q=${encodeURIComponent(query)}`;
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(query)}`, '_blank');
    }
  }

  /**
   * Make a phone call
   */
  makeCall(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  /**
   * Clear stored location
   */
  clearStoredLocation(): void {
    try {
      localStorage.removeItem('user_location');
      this.currentLocation = null;
      this.notifyLocationUpdate(null);
    } catch (error) {
      console.warn('Failed to clear stored location:', error);
    }
  }

  /**
   * Get current location (cached)
   */
  getCurrentLocationSync(): UserLocation | null {
    return this.currentLocation;
  }

  // Private methods

  private async reverseGeocode(lat: number, lon: number): Promise<Partial<UserLocation>> {
    // Simple reverse geocoding for New Zealand
    if (lat >= -47 && lat <= -34 && lon >= 166 && lon <= 179) {
      if (lat >= -37 && lat <= -36.5 && lon >= 174 && lon <= 175) {
        return {
          city: 'Auckland',
          country: 'New Zealand',
          address: 'Auckland, New Zealand'
        };
      } else if (lat >= -41.5 && lat <= -41 && lon >= 174.5 && lon <= 175) {
        return {
          city: 'Wellington',
          country: 'New Zealand',
          address: 'Wellington, New Zealand'
        };
      } else if (lat >= -43.8 && lat <= -43.3 && lon >= 172 && lon <= 173) {
        return {
          city: 'Christchurch',
          country: 'New Zealand',
          address: 'Christchurch, New Zealand'
        };
      }
      
      return {
        country: 'New Zealand',
        address: 'New Zealand'
      };
    }
    
    return {
      country: 'Unknown',
      address: 'Unknown location'
    };
  }

  private addLocationCallback(callback: (location: UserLocation | null) => void): void {
    this.locationCallbacks.push(callback);
  }

  private notifyLocationUpdate(location: UserLocation | null): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location callback error:', error);
      }
    });
  }
}