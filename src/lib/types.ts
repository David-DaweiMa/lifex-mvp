// src/lib/types.ts
export interface Message {
  type: 'user' | 'assistant';
  content: string;
  assistant?: string;
  recommendations?: Business[];
}

export interface Business {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  review_count: number;
  distance: string;
  address: string;
  phone: string;
  price: string;
  image: string;
  tags: string[];
  highlights: string[];
  isOpen: boolean;
  aiReason: string;
  waitTime?: string;
  confidence?: number;
  latitude?: number;
  longitude?: number;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  external_id?: string;
  google_maps_url?: string;
  // 额外信息
  descriptions?: any[];
  menus?: any[];
  photos?: any[];
  reviews?: any[];
  opening_hours?: string;
  email?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

export interface Booking {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  category: string;
  price: string;
  reminder: boolean;
}

export interface TrendingData {
  id: number;
  title: string;
  category: string;
  growth: string;
  description: string;
  icon: any;
  color: string;
  trend: string;
}

export interface DiscoverContent {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  likes: string;
  image: string;
  tags: string[];
  readTime: string;
}

export interface TrendingPost {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  location: string;
  tags: string[];
  timeAgo: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export type ViewType = 'chat' | 'trending' | 'discover' | 'booking' | 'profile';