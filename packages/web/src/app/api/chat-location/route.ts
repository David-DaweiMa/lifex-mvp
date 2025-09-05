// src/app/api/chat-location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LocationAwareChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  locationPreferences?: {
    maxDistance: number;
    transportMode: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LocationAwareChatRequest = await request.json();
    const { 
      message, 
      userId = 'anonymous', 
      sessionId, 
      userLocation,
      locationPreferences = { maxDistance: 5, transportMode: 'walking' }
    } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect if this is a location-based query
    const isLocationQuery = detectLocationIntent(message);
    
    let aiResponse = '';
    let recommendations: any[] = [];
    let locationContext = {
      isLocationBased: isLocationQuery,
      hasUserLocation: !!userLocation,
      areaContext: userLocation?.city || 'your area'
    };

    if (isLocationQuery && userLocation) {
      // Get location-based recommendations
      const { data: nearbyBusinesses, error } = await (supabase as any).rpc('get_nearby_businesses', {
        user_lat: userLocation.latitude,
        user_lon: userLocation.longitude,
        radius_km: locationPreferences.maxDistance,
        category_filter: extractCategoryFromMessage(message),
        limit_count: 5
      });

      if (!error && nearbyBusinesses) {
        recommendations = nearbyBusinesses.map((business: any) => ({
          id: business.business_id,
          name: business.business_name,
          rating: business.business_rating,
          distance: parseFloat(business.distance_km),
          address: business.business_address,
          phone: business.business_phone,
          estimatedTime: calculateEstimatedTime(
            parseFloat(business.distance_km), 
            locationPreferences.transportMode
          )
        }));

        // Generate AI response for location-based query
        aiResponse = generateLocationBasedResponse(message, recommendations, userLocation, locationPreferences);
      } else {
        aiResponse = `I'd love to help you find places in ${userLocation.city || 'your area'}, but I couldn't find specific matches for "${message}". Could you be more specific about what you're looking for?`;
      }

      // Log the location recommendation
      if (userId !== 'anonymous') {
        await (supabase as any).rpc('log_location_recommendation', {
          p_user_id: userId,
          p_session_id: sessionId || 'unknown',
          p_user_location: JSON.stringify(userLocation),
          p_search_query: message,
          p_category: extractCategoryFromMessage(message),
          p_radius: locationPreferences.maxDistance,
          p_transport_mode: locationPreferences.transportMode,
          p_recommendations: JSON.stringify(recommendations),
          p_response_time: 1500 // Mock response time
        });
      }

    } else if (isLocationQuery && !userLocation) {
      // Location query but no location available
      aiResponse = `I'd love to help you find great places! To give you the most relevant recommendations with accurate distances and directions, I'll need access to your location. This helps me suggest nearby options with precise travel times.`;
      
    } else {
      // Non-location query - regular chat response
      aiResponse = generateRegularChatResponse(message);
    }

    // Save chat message to database
    if (userId !== 'anonymous') {
      await supabase.from('chat_messages').insert({
        user_id: userId,
        session_id: sessionId,
        message: message,
        response: aiResponse,
        message_type: 'user',
        location_context: locationContext
      });

      await supabase.from('chat_messages').insert({
        user_id: userId,
        session_id: sessionId,
        message: aiResponse,
        response: null,
        message_type: 'ai',
        location_context: locationContext
      });
    }

    // Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(message, isLocationQuery, !!userLocation, recommendations.length);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      recommendations,
      locationContext,
      followUpQuestions,
      metadata: {
        isLocationBased: isLocationQuery,
        recommendationCount: recommendations.length,
        hasLocation: !!userLocation
      }
    });

  } catch (error) {
    console.error('Location-aware chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function detectLocationIntent(message: string): boolean {
  const locationKeywords = [
    'near', 'nearby', 'close', 'around', 'local', 'in my area',
    'find', 'where', 'recommend', 'suggest', 'show me',
    'restaurant', 'cafe', 'coffee', 'food', 'eat', 'drink',
    'shop', 'store', 'buy', 'attraction', 'visit', 'see',
    'bar', 'pub', 'directions', 'how to get to'
  ];

  const messageLower = message.toLowerCase();
  return locationKeywords.some((keyword: any) => messageLower.includes(keyword));
}

function extractCategoryFromMessage(message: string): string | null {
  const categoryMap = {
    'restaurant': ['restaurant', 'food', 'eat', 'dining', 'meal', 'lunch', 'dinner'],
    'cafe': ['cafe', 'coffee', 'espresso', 'latte', 'cappuccino'],
    'bar': ['bar', 'pub', 'drink', 'beer', 'wine', 'cocktail'],
    'attraction': ['attraction', 'visit', 'see', 'tourist', 'sightseeing'],
    'shopping': ['shop', 'store', 'buy', 'purchase', 'mall']
  };

  const messageLower = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((keyword: any) => messageLower.includes(keyword))) {
      // Need to convert category name to UUID - this would need to be looked up from your categories table
      // For now, return null to get all categories
      return null;
    }
  }

  return null;
}

function generateLocationBasedResponse(
  message: string, 
  recommendations: any[], 
  userLocation: any, 
  preferences: any
): string {
  const areaName = userLocation.city || 'your area';
  
  if (recommendations.length === 0) {
    return `I couldn't find specific matches for "${message}" in ${areaName}. Try expanding your search area or being more specific about what you're looking for.`;
  }

  const topRec = recommendations[0];
  let response = `Great! I found ${recommendations.length} excellent option${recommendations.length > 1 ? 's' : ''} in ${areaName}. `;
  
  response += `My top recommendation is **${topRec.name}** - it's just ${topRec.distance}km away (about ${topRec.estimatedTime} ${preferences.transportMode}) `;
  
  if (topRec.rating) {
    response += `and has a ${topRec.rating} star rating. `;
  }

  if (recommendations.length > 1) {
    response += `I've also found ${recommendations.length - 1} other great option${recommendations.length > 2 ? 's' : ''} nearby. `;
  }

  response += `You can get directions to any of these places with just one tap!`;

  return response;
}

function generateRegularChatResponse(message: string): string {
  // Simple non-location chat responses
  const responses = [
    `I'd be happy to help you with that! As a New Zealand local assistant, I specialize in helping you discover great places around the country.`,
    `Thanks for your message! I'm here to help you find the best local experiences in New Zealand.`,
    `Hello! I'm your local New Zealand assistant. Feel free to ask me about restaurants, cafes, attractions, or anything else you'd like to discover.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateFollowUpQuestions(
  message: string, 
  isLocationQuery: boolean, 
  hasLocation: boolean, 
  recommendationCount: number
): string[] {
  if (isLocationQuery && hasLocation && recommendationCount > 0) {
    return [
      "Would you like directions to any of these places?",
      "Do you need more information about opening hours?",
      "Should I find similar places in a different area?",
      "Would you like to filter by price range or cuisine type?"
    ];
  } else if (isLocationQuery && !hasLocation) {
    return [
      "Can you share your location for personalized recommendations?",
      "Which city or area are you interested in?",
      "What type of place are you looking for?",
      "Would you like me to suggest popular areas to explore?"
    ];
  } else {
    return [
      "What kind of place are you looking for?",
      "Are you interested in restaurants, cafes, or attractions?",
      "Which area of New Zealand interests you?",
      "Would you like recommendations for a specific activity?"
    ];
  }
}

function calculateEstimatedTime(distanceKm: number, mode: string): string {
  const speedKmh = {
    walking: 5,
    cycling: 15,
    driving: 40,
    public_transport: 25
  };

  const speed = speedKmh[mode as keyof typeof speedKmh] || speedKmh.walking;
  const timeHours = distanceKm / speed;
  const timeMinutes = Math.round(timeHours * 60);

  if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
}