import { Business } from './types';

// Mock business data for New Zealand
export const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Café Supreme",
    type: "Coffee & Workspace",
    rating: 4.8,
    reviews: 234,
    distance: "0.3km",
    price: "$",
    highlights: ["Fast WiFi", "Quiet", "Great Coffee"],
    aiReason: "Perfect for remote work with excellent single-origin coffee, quiet atmosphere during weekdays, and reliable WiFi throughout the space.",
    phone: "09-555-0123",
    address: "118 Ponsonby Road, Auckland",
    isOpen: true,
    waitTime: "5-10 min",
    confidence: 95,
    category: "☕ Coffee",
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: 2,
    name: "Little Bird Unbakery",
    type: "Healthy Breakfast & Brunch",
    rating: 4.6,
    reviews: 156,
    distance: "0.5km",
    price: "$$",
    highlights: ["Healthy Options", "Quick Service", "Fresh"],
    aiReason: "Specializes in healthy, fresh ingredients with quick service and laptop-friendly seating - perfect for your lifestyle preferences.",
    phone: "09-555-0456",
    address: "27 Summerhill Drive, Auckland",
    isOpen: true,
    waitTime: "10-15 min",
    confidence: 88,
    category: "🥗 Healthy",
    latitude: -36.9581,
    longitude: 174.8693
  },
  {
    id: 3,
    name: "Depot Eatery",
    type: "Modern NZ Cuisine",
    rating: 4.9,
    reviews: 89,
    distance: "0.8km",
    price: "$$",
    highlights: ["Award-winning", "Local Ingredients", "Fine Dining"],
    aiReason: "Award-winning restaurant focusing on local ingredients and innovative NZ cuisine - worth the experience for special occasions.",
    phone: "09-555-0789",
    address: "36 Federal Street, Auckland CBD",
    isOpen: false,
    waitTime: "Opens at 5pm",
    confidence: 72,
    category: "🍽️ Fine Dining",
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: 4,
    name: "Allpress Espresso",
    type: "Coffee Roasters & Café",
    rating: 4.7,
    reviews: 312,
    distance: "0.4km",
    price: "$",
    highlights: ["Roasted on-site", "Laptop friendly", "Strong WiFi"],
    aiReason: "Local coffee roastery with excellent beans, plenty of seating for laptop users, and consistently strong internet connection.",
    phone: "09-309-0054",
    address: "8 Drake Street, Freemans Bay",
    isOpen: true,
    waitTime: "3-8 min",
    confidence: 92,
    category: "☕ Coffee",
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: 5,
    name: "Scarecrow",
    type: "Organic Health Food",
    rating: 4.5,
    reviews: 198,
    distance: "1.2km",
    price: "$$",
    highlights: ["Organic", "Vegan Options", "Local Produce"],
    aiReason: "Committed to organic and locally-sourced ingredients with extensive vegan menu options and environmentally conscious practices.",
    phone: "09-623-4485",
    address: "3 Normanby Road, Mt Eden",
    isOpen: true,
    waitTime: "15-20 min",
    confidence: 85,
    category: "🥗 Healthy",
    latitude: -36.8685,
    longitude: 174.7533
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

// AI recommendation algorithm
export function getRecommendations(query: string, limit: number = 3): Business[] {
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
        const businessText = `${business.name} ${business.type} ${business.highlights.join(' ')} ${business.category}`.toLowerCase();
        
        if (categoryKeywords.some(keyword => businessText.includes(keyword))) {
          score += matchCount * 10;
        }
      }
    });
    
    // Direct text matching
    queryWords.forEach(word => {
      const businessText = `${business.name} ${business.type} ${business.highlights.join(' ')}`.toLowerCase();
      if (businessText.includes(word)) {
        score += 5;
      }
    });
    
    // Boost score based on rating and reviews
    score += business.rating * 2;
    score += Math.min(business.reviews / 50, 5);
    
    // Boost if currently open
    if (business.isOpen) {
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