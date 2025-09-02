// src/types/business.ts
// Business Dashboard Type Definitions

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    category: 'main' | 'appetizer' | 'dessert' | 'beverage';
  }
  
  export interface BusinessHour {
    open: string;
    close: string;
    closed: boolean;
  }
  
  export interface BusinessHours {
    monday: BusinessHour;
    tuesday: BusinessHour;
    wednesday: BusinessHour;
    thursday: BusinessHour;
    friday: BusinessHour;
    saturday: BusinessHour;
    sunday: BusinessHour;
  }
  
  export interface ComplianceItem {
    id: number;
    item: string;
    status: 'completed' | 'pending' | 'in-review' | 'overdue' | 'optional' | 'not_applicable';
    date: string | null;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }
  
  export interface LegalDocument {
    id: number;
    type: string;
    name: string;
    required: boolean;
    status: 'completed' | 'pending' | 'in-review' | 'overdue' | 'optional' | 'not_applicable';
    description: string;
  }
  
  export interface BusinessProfile {
    businessName: string;
    businessType: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    nzbn: string;
    gstNumber: string;
    irdNumber: string;
    abn: string;
    tradingName: string;
  }
  
  export interface BusinessType {
    id: string;
    name: string;
    icon: string;
    licenses: string[];
  }
  
  export interface SpecialService {
    id: number;
    name: string;
    description: string;
    time: string;
    days: string[];
  }
  
  export interface MediaItem {
    id: number;
    type: 'image' | 'certificate' | 'document';
    name: string;
    category: string;
    url: string;
  }
  
  export interface Review {
    id: number;
    customer: string;
    rating: number;
    comment: string;
    date: string;
    responded: boolean;
    response?: string;
  }
  
  export interface NotificationItem {
    id: number;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    time: string;
    read: boolean;
  }
  
  export interface NotificationSettings {
    customerInquiries: boolean;
    reviews: boolean;
    systemUpdates: boolean;
    promotions: boolean;
  }
  
  export interface BusinessPreferences {
    autoResponse: boolean;
    publicProfile: boolean;
    advanceNotice: number;
    language: string;
  }
  
  // Component Props Types
  export interface MenuManagementProps {
    items: MenuItem[];
    setItems: (items: MenuItem[]) => void;
  }
  
  export interface BusinessHoursProps {
    hours: BusinessHours;
    setHours: (hours: BusinessHours) => void;
  }
  
  export interface ServiceAreasProps {
    areas: string[];
    setAreas: (areas: string[]) => void;
  }