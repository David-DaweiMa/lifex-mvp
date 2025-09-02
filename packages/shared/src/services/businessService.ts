// 注意：这是共享包的商家服务，需要根据具体平台进行调整

export interface BusinessEntity {
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
  data: BusinessEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BusinessStatus {
  status: 'closed' | 'excellent' | 'good' | 'average';
  text: string;
  color: string;
}

export interface FormattedBusiness extends BusinessEntity {
  displayRating: string;
  displayReviews: string;
  displayDistance: string;
  displayPrice: string;
  isHighlyRated: boolean;
  hasManyReviews: boolean;
}

export interface BusinessService {
  // 获取商家列表
  getBusinesses(filters?: BusinessFilters): Promise<BusinessResponse>;

  // 根据ID获取商家
  getBusinessById(id: string): Promise<BusinessEntity>;

  // 搜索商家
  searchBusinesses(query: string, filters?: Omit<BusinessFilters, 'search'>): Promise<BusinessResponse>;

  // 根据分类获取商家
  getBusinessesByCategory(category: string, filters?: Omit<BusinessFilters, 'category'>): Promise<BusinessResponse>;

  // 获取评分最高的商家
  getTopRatedBusinesses(limit?: number): Promise<BusinessResponse>;

  // 获取评论最多的商家
  getMostReviewedBusinesses(limit?: number): Promise<BusinessResponse>;

  // 格式化商家数据用于显示
  formatBusinessForDisplay(business: BusinessEntity): FormattedBusiness;

  // 获取商家状态
  getBusinessStatus(business: BusinessEntity): BusinessStatus;

  // 生成AI推荐
  generateAIRecommendation(business: BusinessEntity): string;
}

// 抽象基类，提供通用的商家逻辑
export abstract class BaseBusinessService implements BusinessService {
  abstract getBusinesses(filters?: BusinessFilters): Promise<BusinessResponse>;
  abstract getBusinessById(id: string): Promise<BusinessEntity>;
  abstract searchBusinesses(query: string, filters?: Omit<BusinessFilters, 'search'>): Promise<BusinessResponse>;
  abstract getBusinessesByCategory(category: string, filters?: Omit<BusinessFilters, 'category'>): Promise<BusinessResponse>;
  abstract getTopRatedBusinesses(limit?: number): Promise<BusinessResponse>;
  abstract getMostReviewedBusinesses(limit?: number): Promise<BusinessResponse>;

  // 通用的格式化逻辑
  formatBusinessForDisplay(business: BusinessEntity): FormattedBusiness {
    return {
      ...business,
      displayRating: business.rating.toFixed(1),
      displayReviews: business.review_count > 1000 
        ? `${(business.review_count / 1000).toFixed(1)}k` 
        : business.review_count.toString(),
      displayDistance: business.distance,
      displayPrice: business.price || '$$',
      isHighlyRated: business.rating >= 4.5,
      hasManyReviews: business.review_count >= 100
    };
  }

  // 通用的状态判断逻辑
  getBusinessStatus(business: BusinessEntity): BusinessStatus {
    if (!business.isOpen) {
      return { status: 'closed', text: 'Closed', color: 'red' };
    }
    if (business.rating >= 4.5) {
      return { status: 'excellent', text: 'Excellent', color: 'green' };
    }
    if (business.rating >= 4.0) {
      return { status: 'good', text: 'Good', color: 'blue' };
    }
    return { status: 'average', text: 'Average', color: 'yellow' };
  }

  // 通用的AI推荐生成逻辑
  generateAIRecommendation(business: BusinessEntity): string {
    const status = this.getBusinessStatus(business);
    
    if (status.status === 'excellent') {
      return `🌟 Highly recommended! ${business.name} has excellent ratings and ${business.review_count} reviews.`;
    } else if (status.status === 'good') {
      return `👍 Great choice! ${business.name} is well-rated with ${business.review_count} reviews.`;
    } else if (business.review_count >= 50) {
      return `📊 Popular spot! ${business.name} has ${business.review_count} reviews from the community.`;
    } else {
      return `📍 Local favorite! ${business.name} is a hidden gem in the area.`;
    }
  }

  // 通用的错误处理
  protected handleBusinessError(error: any, context: string): never {
    console.error(`商家服务${context}失败:`, error);
    throw new Error(`商家服务${context}失败: ${error?.message || '未知错误'}`);
  }

  // 通用的响应验证
  protected validateBusinessResponse(response: any): response is BusinessResponse {
    return response && 
           typeof response === 'object' && 
           typeof response.success === 'boolean' &&
           Array.isArray(response.data) &&
           response.pagination;
  }

  // 通用的商家验证
  protected validateBusiness(business: any): business is BusinessEntity {
    return business && 
           typeof business.id === 'string' && 
           typeof business.name === 'string' &&
           typeof business.rating === 'number';
  }

  // 通用的分页参数构建
  protected buildQueryParams(filters: BusinessFilters = {}): URLSearchParams {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    return params;
  }

  // 通用的排序逻辑
  protected sortBusinesses(businesses: BusinessEntity[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): BusinessEntity[] {
    if (!sortBy) return businesses;

    const sorted = [...businesses].sort((a, b) => {
      let aValue: any = a[sortBy as keyof BusinessEntity];
      let bValue: any = b[sortBy as keyof BusinessEntity];

      // 处理数字类型
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 处理字符串类型
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }
}
