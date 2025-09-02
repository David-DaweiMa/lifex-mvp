// Core user types
export interface User {
  id: string;
  email: string;
  subscription: 'free' | 'essential' | 'premium';
  createdAt: string;
  updatedAt: string;
}

// Business types
export interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// AI Chat types
export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  message: string;
  response: string;
  timestamp: string;
  assistantType: 'coly' | 'max';
}

// Quota types
export interface QuotaConfig {
  free: {
    aiChat: { enabled: false };
    products: { limit: 100 };
    trending: { limit: 10 };
    businessFeatures: { enabled: true };
  };
  essential: {
    aiChat: { enabled: true; limit: 50; assistants: ['coly'] };
    products: { limit: 100 };
    trending: { limit: 50 };
    businessFeatures: { enabled: true };
  };
  premium: {
    aiChat: { enabled: true; limit: 50; assistants: ['coly', 'max'] };
    products: { limit: 1000 };
    trending: { limit: 200 };
    businessFeatures: { enabled: true };
  };
}

export interface UserQuota {
  userId: string;
  subscription: 'free' | 'essential' | 'premium';
  aiChat: {
    coly: { used: number; limit: number; resetAt: string };
    max: { used: number; limit: number; resetAt: string };
  };
  products: { used: number; limit: number };
  trending: { used: number; limit: number; resetAt: string };
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

export interface LocationPreferences {
  userId: string;
  homeLocation: Location;
  workLocation?: Location;
  favoriteAreas: Location[];
  radius: number; // in kilometers
}

// Trending content types
export interface TrendingPost {
  id: string;
  title: string;
  content: string;
  images: string[];
  authorId: string;
  businessId?: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Advertisement types
export interface Advertisement {
  id: string;
  businessId: string;
  title: string;
  description: string;
  image: string;
  link: string;
  category: string;
  targetAudience: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
