import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  restricted: boolean;
}

class LocationService {
  private locationCacheKey = 'user_location_cache';
  private lastKnownLocation: Location | null = null;

  constructor() {
    this.initializeLocation();
  }

  private async initializeLocation() {
    try {
      // 尝试从缓存恢复位置
      const cachedLocation = await this.getCachedLocation();
      if (cachedLocation) {
        this.lastKnownLocation = cachedLocation;
      }
    } catch (error) {
      console.log('初始化位置服务失败:', error);
    }
  }

  /**
   * 获取当前位置 - 用于AI推荐
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.lastKnownLocation = location;
          this.cacheLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('获取位置失败:', error);
          
          // 如果有缓存的位置，返回缓存的位置
          if (this.lastKnownLocation) {
            resolve(this.lastKnownLocation);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * 缓存位置信息
   */
  private async cacheLocation(location: Location): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.locationCacheKey,
        JSON.stringify({
          ...location,
          cachedAt: Date.now(),
        })
      );
    } catch (error) {
      console.error('缓存位置信息失败:', error);
    }
  }

  /**
   * 获取缓存的位置信息
   */
  private async getCachedLocation(): Promise<Location | null> {
    try {
      const cached = await AsyncStorage.getItem(this.locationCacheKey);
      if (cached) {
        const locationData = JSON.parse(cached);
        const cacheAge = Date.now() - locationData.cachedAt;
        
        // 如果缓存超过1小时，认为过期
        if (cacheAge < 60 * 60 * 1000) {
          return locationData;
        }
      }
      return null;
    } catch (error) {
      console.error('获取缓存位置失败:', error);
      return null;
    }
  }

  /**
   * 获取最后已知位置
   */
  getLastKnownLocation(): Location | null {
    return this.lastKnownLocation;
  }

  /**
   * 检查位置权限
   */
  async checkLocationPermission(): Promise<LocationPermission> {
    // 注意：实际的权限检查需要根据平台实现
    // 这里返回一个默认值
    return {
      granted: true,
      denied: false,
      restricted: false,
    };
  }

  /**
   * 请求位置权限
   */
  async requestLocationPermission(): Promise<LocationPermission> {
    // 注意：实际的权限请求需要根据平台实现
    // 这里返回一个默认值
    return {
      granted: true,
      denied: false,
      restricted: false,
    };
  }
}

export const locationService = new LocationService();
export default locationService;
