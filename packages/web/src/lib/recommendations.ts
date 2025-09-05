import { Business } from './types';
import { getAIRecommendations, type AIRecommendationRequest } from './ai';

// Mock business data for New Zealand
export const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "Café Supreme",
    type: "Coffee & Workspace",
    category: "food",
    rating: 4.8,
    review_count: 234,
    distance: "0.3km",
    price: "$",
    image: "from-amber-400 to-orange-500",
    tags: ["Fast WiFi", "Quiet", "Great Coffee"],
    highlights: ["Fast WiFi", "Quiet", "Great Coffee"],
    aiReason: "Perfect for remote work with excellent single-origin coffee, quiet atmosphere during weekdays, and reliable WiFi throughout the space.",
    phone: "09-555-0123",
    address: "118 Ponsonby Road, Auckland",
    isOpen: true,
    waitTime: "5-10 min",
    confidence: 95,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: "2",
    name: "Little Bird Unbakery",
    type: "Healthy Breakfast & Brunch",
    category: "food",
    rating: 4.6,
    review_count: 156,
    distance: "0.5km",
    price: "$$",
    image: "from-green-400 to-emerald-500",
    tags: ["Healthy Options", "Quick Service", "Fresh"],
    highlights: ["Healthy Options", "Quick Service", "Fresh"],
    aiReason: "Specializes in healthy, fresh ingredients with quick service and laptop-friendly seating - perfect for your lifestyle preferences.",
    phone: "09-555-0456",
    address: "27 Summerhill Drive, Auckland",
    isOpen: true,
    waitTime: "10-15 min",
    confidence: 88,
    latitude: -36.9581,
    longitude: 174.8693
  },
  {
    id: "3",
    name: "Depot Eatery",
    type: "Modern NZ Cuisine",
    category: "food",
    rating: 4.9,
    review_count: 89,
    distance: "0.8km",
    price: "$$",
    image: "from-blue-400 to-indigo-500",
    tags: ["Award-winning", "Local Ingredients", "Fine Dining"],
    highlights: ["Award-winning", "Local Ingredients", "Fine Dining"],
    aiReason: "Award-winning restaurant focusing on local ingredients and innovative NZ cuisine - worth the experience for special occasions.",
    phone: "09-555-0789",
    address: "36 Federal Street, Auckland CBD",
    isOpen: false,
    waitTime: "Opens at 5pm",
    confidence: 72,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: "4",
    name: "Allpress Espresso",
    type: "Coffee Roasters & Café",
    category: "food",
    rating: 4.7,
    review_count: 312,
    distance: "0.4km",
    price: "$",
    image: "from-amber-400 to-orange-500",
    tags: ["Roasted on-site", "Laptop friendly", "Strong WiFi"],
    highlights: ["Roasted on-site", "Laptop friendly", "Strong WiFi"],
    aiReason: "Local coffee roastery with excellent beans, plenty of seating for laptop users, and consistently strong internet connection.",
    phone: "09-309-0054",
    address: "8 Drake Street, Freemans Bay",
    isOpen: true,
    waitTime: "3-8 min",
    confidence: 92,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: "5",
    name: "Scarecrow",
    type: "Organic Health Food",
    category: "food",
    rating: 4.5,
    review_count: 198,
    distance: "1.2km",
    price: "$$",
    image: "from-green-400 to-emerald-500",
    tags: ["Organic", "Vegan Options", "Local Produce"],
    highlights: ["Organic", "Vegan Options", "Local Produce"],
    aiReason: "Committed to organic and locally-sourced ingredients with extensive vegan menu options and environmentally conscious practices.",
    phone: "09-623-4485",
    address: "3 Normanby Road, Mt Eden",
    isOpen: true,
    waitTime: "15-20 min",
    confidence: 85,
    latitude: -36.8685,
    longitude: 174.7533
  },
  {
    id: "6",
    name: "The Grove",
    type: "Fine Dining Restaurant",
    category: "food",
    rating: 4.9,
    review_count: 445,
    distance: "1.5km",
    price: "$$$",
    image: "from-purple-400 to-pink-500",
    tags: ["Award-winning", "Tasting Menu", "Wine Pairing"],
    highlights: ["Award-winning", "Tasting Menu", "Wine Pairing"],
    aiReason: "One of Auckland's most prestigious restaurants with innovative tasting menus and exceptional wine pairings - perfect for special celebrations.",
    phone: "09-368-4129",
    address: "St Patrick's Square, Wyndham Street",
    isOpen: true,
    waitTime: "Reservation required",
    confidence: 96,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: "7",
    name: "Federal Delicatessen",
    type: "American Diner & Deli",
    category: "food",
    rating: 4.4,
    review_count: 567,
    distance: "0.6km",
    price: "$$",
    image: "from-red-400 to-orange-500",
    tags: ["24/7", "Comfort Food", "Late Night"],
    highlights: ["24/7", "Comfort Food", "Late Night"],
    aiReason: "Authentic American diner experience with comfort food classics, open 24/7 - perfect for late-night cravings or casual dining.",
    phone: "09-363-7184",
    address: "86 Federal Street, Auckland CBD",
    isOpen: true,
    waitTime: "10-15 min",
    confidence: 78,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: "8",
    name: "Auckland Zoo",
    type: "Family Entertainment",
    category: "activities",
    rating: 4.3,
    review_count: 1234,
    distance: "3.2km",
    price: "$$",
    image: "from-green-400 to-blue-500",
    tags: ["Family-friendly", "Educational", "Outdoor"],
    highlights: ["Family-friendly", "Educational", "Outdoor"],
    aiReason: "Perfect family day out with native New Zealand wildlife, educational experiences, and beautiful outdoor spaces for children to explore.",
    phone: "09-360-3800",
    address: "Motions Road, Western Springs",
    isOpen: true,
    waitTime: "No wait",
    confidence: 89,
    latitude: -36.8585,
    longitude: 174.7233
  }
];

// Keyword mapping for AI recommendations
const keywords = {
  quiet: ['quiet', 'work', 'laptop', 'study', 'peaceful', 'calm', 'silent'],
  coffee: ['coffee', 'café', 'caffeine', 'espresso', 'latte', 'flat white'],
  healthy: ['healthy', 'organic', 'vegan', 'fresh', 'salad', 'juice'],
  work: ['work', 'wifi', 'laptop', 'remote', 'meeting', 'office'],
  family: ['family', 'kids', 'children', 'child-friendly', 'playground'],
  casual: ['casual', 'relaxed', 'laid-back', 'informal', 'easy'],
  breakfast: ['breakfast', 'brunch', 'morning', 'early', 'pancakes'],
  dinner: ['dinner', 'evening', 'night', 'late', 'restaurant'],
  fast: ['fast', 'quick', 'rapid', 'speedy', 'express', 'takeaway'],
  local: ['local', 'kiwi', 'nz', 'new zealand', 'authentic', 'traditional']
};

// Enhanced AI recommendation algorithm with fallback
export async function getRecommendations(query: string, limit: number = 3, useAI: boolean = true): Promise<Business[]> {
  try {
    if (useAI && process.env.OPENAI_API_KEY) {
      // Use AI-powered recommendations
      const aiRequest: AIRecommendationRequest = {
        query,
        userPreferences: extractPreferencesFromQuery(query)
      };
      
      const aiResponse = await getAIRecommendations(aiRequest, mockBusinesses);
      return aiResponse.recommendations.slice(0, limit);
    }
  } catch (error) {
    console.error('AI recommendation failed, falling back to keyword matching:', error);
  }
  
  // Fallback to keyword matching
  return getKeywordBasedRecommendations(query, limit);
}

// Traditional keyword-based recommendation algorithm
export function getKeywordBasedRecommendations(query: string, limit: number = 3): Business[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  // Score each business based on query relevance
  const scoredBusinesses = mockBusinesses.map(business => {
    let score = 0;
    
    // Check keyword matches
    Object.entries(keywords).forEach(([category, categoryKeywords]) => {
      const matchCount = categoryKeywords.filter(keyword => 
        queryWords.some(word => word.includes(keyword) || keyword.includes(word))
      ).length;
      
      if (matchCount > 0) {
        // Check if business matches this category
        const businessText = `${(business as any).name} ${(business as any).type} ${(business as any).highlights.join(' ')} ${(business as any).category}`.toLowerCase();
        
        if (categoryKeywords.some(keyword => businessText.includes(keyword))) {
          score += matchCount * 10;
        }
      }
    });
    
    // Direct text matching
    queryWords.forEach(word => {
      const businessText = `${(business as any).name} ${(business as any).type} ${(business as any).highlights.join(' ')}`.toLowerCase();
      if (businessText.includes(word)) {
        score += 5;
      }
    });
    
    // Boost score based on rating and reviews
    score += (business as any).rating * 2;
    score += Math.min((business as any).review_count / 50, 5);
    
    // Boost if currently open
    if ((business as any).isOpen) {
      score += 3;
    }
    
    return {
      ...business,
      searchScore: score
    };
  });
  
  // Sort by score and return top results
  return scoredBusinesses
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit);
}

// Extract user preferences from query
function extractPreferencesFromQuery(query: string): string[] {
  const queryLower = query.toLowerCase();
  const preferences: string[] = [];
  
  if (queryLower.includes('family') || queryLower.includes('kids') || queryLower.includes('children')) {
    preferences.push('family-friendly');
  }
  
  if (queryLower.includes('work') || queryLower.includes('laptop') || queryLower.includes('wifi')) {
    preferences.push('work-friendly');
  }
  
  if (queryLower.includes('cheap') || queryLower.includes('budget') || queryLower.includes('affordable')) {
    preferences.push('budget-conscious');
  }
  
  if (queryLower.includes('healthy') || queryLower.includes('organic') || queryLower.includes('vegan')) {
    preferences.push('healthy');
  }
  
  if (queryLower.includes('quick') || queryLower.includes('fast') || queryLower.includes('express')) {
    preferences.push('quick');
  }
  
  if (queryLower.includes('local') || queryLower.includes('authentic') || queryLower.includes('kiwi')) {
    preferences.push('local');
  }
  
  return preferences;
}

// Get recommendations by category
export function getRecommendationsByCategory(category: string, limit: number = 5): Business[] {
  const categoryMap: { [key: string]: string[] } = {
    'coffee': ['☕ Coffee'],
    'food': ['🍽️ Fine Dining', '🍔 Casual Dining'],
    'healthy': ['🥗 Healthy'],
    'family': ['🐨 Family Activities'],
    'all': ['☕ Coffee', '🍽️ Fine Dining', '🍔 Casual Dining', '🥗 Healthy', '🐨 Family Activities']
  };
  
  const targetCategories = categoryMap[category.toLowerCase()] || categoryMap['all'];
  
  return mockBusinesses
    .filter(business => targetCategories.includes((business as any).category))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// Get trending recommendations (based on ratings and reviews)
export function getTrendingRecommendations(limit: number = 5): Business[] {
  return mockBusinesses
    .sort((a, b) => {
      // Calculate trending score: rating * log(reviews) * (1 if open, 0.8 if closed)
      const aScore = a.rating * Math.log(a.review_count + 1) * (a.isOpen ? 1 : 0.8);
      const bScore = b.rating * Math.log(b.review_count + 1) * (b.isOpen ? 1 : 0.8);
      return bScore - aScore;
    })
    .slice(0, limit);
}

// Search businesses with advanced filtering
export function searchBusinesses(filters: {
  query?: string;
  category?: string;
  priceRange?: string[];
  rating?: number;
  isOpen?: boolean;
  maxDistance?: string;
}): Business[] {
  let results = [...mockBusinesses];
  
  if (filters.query) {
    results = getKeywordBasedRecommendations(filters.query, results.length);
  }
  
  if (filters.category) {
    results = results.filter(business => (business as any).category === filters.category);
  }
  
  if (filters.priceRange && filters.priceRange.length > 0) {
    results = results.filter(business => filters.priceRange!.includes((business as any).price));
  }
  
  if (filters.rating) {
    results = results.filter(business => (business as any).rating >= filters.rating!);
  }
  
  if (filters.isOpen !== undefined) {
    results = results.filter(business => (business as any).isOpen === filters.isOpen);
  }
  
  if (filters.maxDistance) {
    // Simple distance filtering (in real app, would use actual coordinates)
    results = results.filter(business => {
      const distance = parseFloat((business as any).distance.replace('km', ''));
      const maxDistance = parseFloat(filters.maxDistance!.replace('km', ''));
      return distance <= maxDistance;
    });
  }
  
  return results.sort((a, b) => b.rating - a.rating);
}

// Utility functions
export function openNavigation(businessName: string, address: string): void {
  const query = `${businessName} ${address}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    window.location.href = `maps://maps.google.com/?q=${encodeURIComponent(query)}`;
  } else {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(query)}`, '_blank');
  }
}

export function makeCall(phone: string): void {
  window.location.href = `tel:${phone}`;
}

// Get business by ID
export function getBusinessById(id: string): Business | undefined {
  return mockBusinesses.find(business => (business as any).id === id);
}

// Get similar businesses
export function getSimilarBusinesses(businessId: string, limit: number = 3): Business[] {
  const business = getBusinessById(businessId);
  if (!business) return [];
  
  return mockBusinesses
    .filter(b => b.id !== businessId && b.category === (business as any).category)
    .sort((a, b) => {
      // Score based on category match and rating
      let score = 0;
      if (a.category === (business as any).category) score += 10;
      score += a.rating * 2;
      return score;
    })
    .slice(0, limit);
}