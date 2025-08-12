import OpenAI from 'openai';
import { Business } from './types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for LifeX AI assistant
const SYSTEM_PROMPT = `You are LifeX, an AI assistant specialized in helping people discover amazing local services and experiences in New Zealand. You have deep knowledge of Kiwi culture, local businesses, and lifestyle preferences.

Your role is to:
1. Understand user preferences and needs
2. Provide personalized recommendations for local services
3. Explain why each recommendation fits their needs
4. Maintain a friendly, helpful tone with Kiwi charm
5. Focus on authentic, local experiences

When recommending businesses, consider:
- User's specific requirements (coffee, food, activities, etc.)
- Location preferences and distance
- Budget considerations
- Lifestyle preferences (family-friendly, work-friendly, etc.)
- Local authenticity and Kiwi culture

Always provide thoughtful, personalized responses that help users discover the best of New Zealand.`;

// Context about available businesses
const BUSINESS_CONTEXT = `
Available business categories and examples:
- Coffee & Workspace: Cafés with WiFi, quiet atmosphere, laptop-friendly
- Healthy Food: Organic, fresh ingredients, vegan options
- Fine Dining: Award-winning restaurants, local ingredients
- Family Activities: Kid-friendly places, outdoor activities
- Local Services: Hair salons, home services, health & wellness
- Entertainment: Cultural activities, nightlife, outdoor adventures

Business data includes: name, type, rating, reviews, distance, price, highlights, phone, address, opening status, and AI-generated reasoning for recommendations.
`;

export interface AIRecommendationRequest {
  query: string;
  userPreferences?: string[];
  location?: string;
  budget?: string;
  occasion?: string;
}

export interface AIRecommendationResponse {
  recommendations: Business[];
  explanation: string;
  confidence: number;
  suggestedQueries: string[];
}

export interface AIConversationResponse {
  message: string;
  recommendations?: Business[];
  followUpQuestions?: string[];
}

/**
 * Get AI-powered recommendations using GPT-5 Nano
 */
export async function getAIRecommendations(
  request: AIRecommendationRequest,
  availableBusinesses: Business[]
): Promise<AIRecommendationResponse> {
  try {
    const userPrompt = `
User Query: "${request.query}"
${request.userPreferences ? `User Preferences: ${request.userPreferences.join(', ')}` : ''}
${request.location ? `Location: ${request.location}` : ''}
${request.budget ? `Budget: ${request.budget}` : ''}
${request.occasion ? `Occasion: ${request.occasion}` : ''}

Available businesses: ${JSON.stringify(availableBusinesses, null, 2)}

Please analyze the user's request and available businesses to provide:
1. Top 3 most relevant recommendations with detailed reasoning
2. A personalized explanation of why these fit their needs
3. Confidence score (0-100) for the recommendations
4. 3 suggested follow-up queries the user might ask

Format your response as JSON:
{
  "recommendations": [business_ids],
  "explanation": "detailed explanation",
  "confidence": 85,
  "suggestedQueries": ["query1", "query2", "query3"]
}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + BUSINESS_CONTEXT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI model');
    }

    // Parse JSON response
    const parsedResponse = JSON.parse(response);
    
    // Map business IDs to actual business objects
    const recommendedBusinesses = availableBusinesses.filter(business => 
      parsedResponse.recommendations.includes(business.id)
    );

    return {
      recommendations: recommendedBusinesses,
      explanation: parsedResponse.explanation,
      confidence: parsedResponse.confidence,
      suggestedQueries: parsedResponse.suggestedQueries
    };

  } catch (error) {
    console.error('AI recommendation error:', error);
    
    // Fallback to basic keyword matching
    return getFallbackRecommendations(request, availableBusinesses);
  }
}

/**
 * Generate conversational response using GPT-5 Nano
 */
export async function generateConversationalResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: { recommendations?: Business[]; userPreferences?: string[] }
): Promise<AIConversationResponse> {
  try {
    const contextPrompt = context?.recommendations 
      ? `\nCurrent recommendations: ${JSON.stringify(context.recommendations, null, 2)}`
      : '';
    
    const preferencesPrompt = context?.userPreferences
      ? `\nUser preferences: ${context.userPreferences.join(', ')}`
      : '';

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { 
          role: 'user', 
          content: `User message: "${userMessage}"${contextPrompt}${preferencesPrompt}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI model');
    }

    return {
      message: response,
      followUpQuestions: generateFollowUpQuestions(userMessage)
    };

  } catch (error) {
    console.error('AI conversation error:', error);
    
    // Fallback response
    return {
      message: "I'm here to help you discover amazing places in New Zealand! What are you looking for today?",
      followUpQuestions: [
        "Best coffee shops for remote work?",
        "Family-friendly restaurants?",
        "Weekend activities in Auckland?"
      ]
    };
  }
}

/**
 * Generate personalized business reasoning using GPT-5 Nano
 */
export async function generateBusinessReasoning(
  business: Business,
  userQuery: string,
  userPreferences?: string[]
): Promise<string> {
  try {
    const prompt = `
Business: ${business.name} - ${business.type}
Highlights: ${business.highlights.join(', ')}
Rating: ${business.rating}/5 (${business.reviews} reviews)
Price: ${business.price}
Distance: ${business.distance}

User Query: "${userQuery}"
${userPreferences ? `User Preferences: ${userPreferences.join(', ')}` : ''}

Please provide a personalized explanation (2-3 sentences) of why this business would be perfect for this user's needs. Focus on the specific benefits and how it matches their requirements. Be conversational and enthusiastic about the recommendation.

Response:`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || business.aiReason;

  } catch (error) {
    console.error('AI reasoning error:', error);
    return business.aiReason; // Fallback to existing reasoning
  }
}

/**
 * Fallback recommendation system using keyword matching
 */
function getFallbackRecommendations(
  request: AIRecommendationRequest,
  availableBusinesses: Business[]
): AIRecommendationResponse {
  const queryLower = request.query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  // Simple keyword scoring
  const scoredBusinesses = availableBusinesses.map(business => {
    let score = 0;
    const businessText = `${business.name} ${business.type} ${business.highlights.join(' ')}`.toLowerCase();
    
    queryWords.forEach(word => {
      if (businessText.includes(word)) {
        score += 5;
      }
    });
    
    score += business.rating * 2;
    if (business.isOpen) score += 3;
    
    return { ...business, searchScore: score };
  });
  
  const recommendations = scoredBusinesses
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 3);
  
  return {
    recommendations,
    explanation: `I found ${recommendations.length} great places that match your search for "${request.query}".`,
    confidence: 70,
    suggestedQueries: [
      "Show me more options",
      "What about different price ranges?",
      "Any family-friendly alternatives?"
    ]
  };
}

/**
 * Generate follow-up questions based on user input
 */
function generateFollowUpQuestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase();
  
  if (message.includes('coffee') || message.includes('café')) {
    return [
      "Looking for a quiet spot to work?",
      "Need something with great food too?",
      "Want to explore other coffee areas?"
    ];
  } else if (message.includes('food') || message.includes('restaurant')) {
    return [
      "Any dietary preferences?",
      "Looking for casual or fine dining?",
      "Need family-friendly options?"
    ];
  } else if (message.includes('family') || message.includes('kids')) {
    return [
      "What age are your children?",
      "Indoor or outdoor activities?",
      "Need something educational?"
    ];
  }
  
  return [
    "What's your budget range?",
    "Any specific location preferences?",
    "What time of day are you planning?"
  ];
}

/**
 * Extract user preferences from conversation
 */
export function extractUserPreferences(conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>): string[] {
  const preferences: string[] = [];
  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase());
  
  // Extract preferences based on keywords
  const preferenceKeywords = {
    'family-friendly': ['family', 'kids', 'children', 'child-friendly'],
    'work-friendly': ['work', 'laptop', 'wifi', 'quiet', 'meeting'],
    'budget-conscious': ['cheap', 'affordable', 'budget', 'inexpensive'],
    'luxury': ['fine dining', 'premium', 'luxury', 'upscale'],
    'healthy': ['healthy', 'organic', 'vegan', 'fresh'],
    'quick': ['fast', 'quick', 'express', 'takeaway'],
    'local': ['local', 'authentic', 'kiwi', 'traditional']
  };
  
  Object.entries(preferenceKeywords).forEach(([preference, keywords]) => {
    if (keywords.some(keyword => userMessages.some(msg => msg.includes(keyword)))) {
      preferences.push(preference);
    }
  });
  
  return preferences;
}
