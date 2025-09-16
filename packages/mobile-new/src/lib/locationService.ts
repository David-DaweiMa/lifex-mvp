import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.LocationPermissionResponse['status'];
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private watchId: Location.LocationSubscription | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // 请求位置权限
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Request location permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  // 检查位置权限状态
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Check location permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  // 获取当前位置
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // 检查权限
      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        const requestResult = await this.requestLocationPermission();
        if (!requestResult.granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access to find nearby businesses.',
            [{ text: 'OK' }]
          );
          return null;
        }
      }

      // 获取位置
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };

      this.currentLocation = locationData;
      
      // 缓存位置
      await this.cacheLocation(locationData);

      return locationData;
    } catch (error) {
      console.error('Get current location error:', error);
      return null;
    }
  }

  // 监听位置变化
  async watchLocation(
    callback: (location: LocationData) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<boolean> {
    try {
      // 检查权限
      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        const requestResult = await this.requestLocationPermission();
        if (!requestResult.granted) {
          return false;
        }
      }

      // 停止之前的监听
      if (this.watchId) {
        this.watchId.remove();
      }

      // 开始监听位置变化
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.Balanced,
          timeInterval: options.timeInterval || 10000,
          distanceInterval: options.distanceInterval || 100,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          };

          this.currentLocation = locationData;
          callback(locationData);
        }
      );

      return true;
    } catch (error) {
      console.error('Watch location error:', error);
      return false;
    }
  }

  // 停止监听位置变化
  stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // 获取缓存的最后位置
  async getLastKnownLocation(): Promise<LocationData | null> {
    try {
      const cachedLocation = await AsyncStorage.getItem('last_known_location');
      if (cachedLocation) {
        const locationData = JSON.parse(cachedLocation);
        this.currentLocation = locationData;
        return locationData;
      }
      return null;
    } catch (error) {
      console.error('Get last known location error:', error);
      return null;
    }
  }

  // 缓存位置
  private async cacheLocation(location: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem('last_known_location', JSON.stringify(location));
    } catch (error) {
      console.error('Cache location error:', error);
    }
  }

  // 计算两点之间的距离（公里）
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  // 角度转弧度
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // 格式化距离显示
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  // 获取当前位置（如果可用）
  getCurrentLocationSync(): LocationData | null {
    return this.currentLocation;
  }

  // 设置位置偏好
  async setLocationPreference(preference: {
    homeLocation?: LocationData;
    workLocation?: LocationData;
    preferredRadius?: number;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('location_preferences', JSON.stringify(preference));
    } catch (error) {
      console.error('Set location preference error:', error);
    }
  }

  // 获取位置偏好
  async getLocationPreference(): Promise<{
    homeLocation?: LocationData;
    workLocation?: LocationData;
    preferredRadius?: number;
  } | null> {
    try {
      const preference = await AsyncStorage.getItem('location_preferences');
      return preference ? JSON.parse(preference) : null;
    } catch (error) {
      console.error('Get location preference error:', error);
      return null;
    }
  }

  // 检查位置服务是否可用
  async isLocationServiceEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Check location service error:', error);
      return false;
    }
  }

  // 打开位置设置
  async openLocationSettings(): Promise<void> {
    try {
      await Location.enableNetworkProviderAsync();
    } catch (error) {
      console.error('Open location settings error:', error);
    }
  }
}

// 创建单例实例
export const locationService = new LocationService();
