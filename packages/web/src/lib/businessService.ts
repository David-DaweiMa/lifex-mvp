export interface Business {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  review_count: number;
  distance: string;
  price: string;
  tags: string[];
  highlights: string[];
  aiReason: string;
  phone: string;
  address: string;
  image: string;
  isOpen: boolean;
  website: string;
  logo_url: string;
  cover_photo_url: string;
  latitude: number;
  longitude: number;
  external_id: string;
  google_maps_url: string;
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

export interface BusinessFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'rating' | 'name' | 'review_count' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessResponse {
  success: boolean;
  data: Business[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class BusinessService {
  private baseUrl = '/api/businesses';

  async getBusinesses(filters: BusinessFilters = {}): Promise<BusinessResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch businesses: ${response.statusText}`);
    }

    return await response.json();
  }

  async getBusinessById(id: string): Promise<Business> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch business: ${response.statusText}`);
    }

    const result = await response.json();
    return (result as any).data;
  }

  async searchBusinesses(query: string, filters: Omit<BusinessFilters, 'search'> = {}): Promise<BusinessResponse> {
    return this.getBusinesses({ ...filters, search: query });
  }

  async getBusinessesByCategory(category: string, filters: Omit<BusinessFilters, 'category'> = {}): Promise<BusinessResponse> {
    return this.getBusinesses({ ...filters, category });
  }

  async getTopRatedBusinesses(limit: number = 10): Promise<BusinessResponse> {
    return this.getBusinesses({ 
      limit, 
      sortBy: 'rating', 
      sortOrder: 'desc' 
    });
  }

  async getMostReviewedBusinesses(limit: number = 10): Promise<BusinessResponse> {
    return this.getBusinesses({ 
      limit, 
      sortBy: 'review_count', 
      sortOrder: 'desc' 
    });
  }

  // Helper method to format business data for display
  formatBusinessForDisplay(business: Business) {
    return {
      ...business,
      displayRating: (business as any).rating.toFixed(1),
      displayReviews: (business as any).review_count > 1000 
        ? `${((business as any).review_count / 1000).toFixed(1)}k` 
        : (business as any).review_count.toString(),
      displayDistance: (business as any).distance,
      displayPrice: (business as any).price || '$$',
      isHighlyRated: (business as any).rating >= 4.5,
      hasManyReviews: (business as any).review_count >= 100
    };
  }

  // Helper method to get business status
  getBusinessStatus(business: Business) {
    if (!(business as any).isOpen) return { status: 'closed', text: 'Closed', color: 'red' };
    if ((business as any).rating >= 4.5) return { status: 'excellent', text: 'Excellent', color: 'green' };
    if ((business as any).rating >= 4.0) return { status: 'good', text: 'Good', color: 'blue' };
    return { status: 'average', text: 'Average', color: 'yellow' };
  }

  // Helper method to generate AI recommendation
  generateAIRecommendation(business: Business): string {
    const status = this.getBusinessStatus(business);
    
    if (status.status === 'excellent') {
      return `🌟 Highly recommended! ${(business as any).name} has excellent ratings and ${(business as any).review_count} reviews.`;
    } else if (status.status === 'good') {
      return `👍 Great choice! ${(business as any).name} is well-rated with ${(business as any).review_count} reviews.`;
    } else if ((business as any).review_count >= 50) {
      return `📊 Popular spot! ${(business as any).name} has ${(business as any).review_count} reviews from the community.`;
    } else {
      return `📍 Local favorite! ${(business as any).name} is a hidden gem in the area.`;
    }
  }
}

export const businessService = new BusinessService();
