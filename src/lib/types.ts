export interface Business {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  highlights: string[];
  aiReason: string;
  phone: string;
  address: string;
  isOpen: boolean;
  waitTime: string;
  confidence: number;
  category: string;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  type: 'user' | 'assistant';
  content: string;
  assistant?: string;
  recommendations?: Business[];
}

export interface Booking {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  reminder: boolean;
}