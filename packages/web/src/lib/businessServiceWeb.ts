import { BaseBusinessService, BusinessEntity, BusinessFilters, BusinessResponse } from '@lifex/shared';

/**
 * Web端的商家服务实现
 * 继承自共享包的BaseBusinessService，提供具体的web实现
 */
export class WebBusinessService extends BaseBusinessService {
  private baseUrl = '/api/businesses';

  async getBusinesses(filters: BusinessFilters = {}): Promise<BusinessResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch businesses: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!this.validateBusinessResponse(result)) {
        throw new Error('Invalid business response format');
      }

      return result;
    } catch (error) {
      this.handleBusinessError(error, '获取商家列表');
    }
  }

  async getBusinessById(id: string): Promise<BusinessEntity> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch business: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.data || !this.validateBusiness(result.data)) {
        throw new Error('Invalid business data format');
      }

      return result.data;
    } catch (error) {
      this.handleBusinessError(error, '获取商家详情');
    }
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
}

// 导出单例实例
export const webBusinessService = new WebBusinessService();

// 为了向后兼容，也导出原来的函数
export const {
  getBusinesses,
  getBusinessById,
  searchBusinesses,
  getBusinessesByCategory,
  getTopRatedBusinesses,
  getMostReviewedBusinesses,
  formatBusinessForDisplay,
  getBusinessStatus,
  generateAIRecommendation
} = webBusinessService;
