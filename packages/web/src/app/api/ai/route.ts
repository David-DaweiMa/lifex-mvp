import { NextRequest, NextResponse } from 'next/server';
import { generateConversationalResponse, getAIRecommendations } from '@/lib/ai';
import { typedSupabase } from '@/lib/supabase';
import { getAdForChat } from '@/lib/adService';
import { detectLanguage, SupportedLanguage } from '@/lib/languageDetection';
import { getAssistantIntroduction, getPersonalityResponse } from '@/lib/assistantPersonality';
import { checkAssistantLimit, recordAssistantUsage, getNextResetTime } from '@/lib/assistantUsage';
import { AssistantType } from '@/lib/assistantUsage';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { message, userId, sessionId, assistantType = 'coly' } = data;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate assistant type
    if (!['coly', 'max'].includes(assistantType)) {
      return NextResponse.json(
        { error: 'Invalid assistant type' },
        { status: 400 }
      );
    }

    const assistant = assistantType as AssistantType;

    // Handle anonymous users
    if (userId === 'anonymous') {
      return handleAnonymousUser(message, sessionId, assistant);
    }

    // Handle demo and admin users (unlimited access)
    if (userId === 'demo-user' || userId === 'admin') {
      return handleUnlimitedUser(message, userId, sessionId, assistant);
    }

    // Handle registered users
    return handleRegisteredUser(message, userId, sessionId, assistant);

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 500 }
    );
  }
}

/**
 * Handle anonymous users with limited access
 */
async function handleAnonymousUser(
  message: string,
  sessionId: string,
  assistant: AssistantType
) {
  const language = detectLanguage(message);
  
  // Anonymous users can only use Coly with very limited access
  if (assistant === 'max') {
    const response = getPersonalityResponse('max', 'tired', language);
    return NextResponse.json({
      success: false,
      error: response,
      data: {
        message: response,
        assistant: 'max',
        requiresUpgrade: true
      }
    }, { status: 403 });
  }

  // Check anonymous usage limits (10 per day)
  const today = new Date().toISOString().split('T')[0];
  const { data: usageData, error: usageError } = await typedSupabase
    .from('anonymous_usage')
    .select('usage_count')
    .eq('session_id', sessionId)
    .eq('quota_type', 'chat')
    .eq('usage_date', today)
    .maybeSingle();

  const currentUsage = (usageData as { usage_count: number | null } | null)?.usage_count || 0;
  const maxUsage = 10;
  
  if (currentUsage >= maxUsage) {
    const response = getPersonalityResponse('coly', 'tired', language);
    return NextResponse.json({
      success: false,
      error: response,
      data: {
        message: response,
        assistant: 'coly',
        requiresUpgrade: true,
        quota: {
          current: currentUsage,
          limit: maxUsage,
          remaining: 0,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }, { status: 429 });
  }

  // Generate response for anonymous user
  const aiResponse = await generateAIResponse(message, {
    userType: 'anonymous',
    location: { city: 'Auckland', country: 'New Zealand' },
    assistant,
    language
  });

  // Record usage
  await recordAnonymousUsage(sessionId, 'chat', today);

  return NextResponse.json({
    success: true,
    data: {
      ...aiResponse,
      assistant: 'coly',
      quota: {
        current: currentUsage + 1,
        limit: maxUsage,
        remaining: maxUsage - currentUsage - 1,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }
  });
}

/**
 * Handle unlimited users (demo and admin)
 */
async function handleUnlimitedUser(
  message: string,
  userId: string,
  sessionId: string,
  assistant: AssistantType
) {
  const language = detectLanguage(message);
  
  // Generate response
  const aiResponse = await generateAIResponse(message, {
    userType: userId === 'demo-user' ? 'demo' : 'admin',
    location: { city: 'Auckland', country: 'New Zealand' },
    assistant,
    language
  });

  return NextResponse.json({
    success: true,
    data: {
      ...aiResponse,
      assistant,
      unlimited: true
    }
  });
}

/**
 * Handle registered users with subscription-based limits
 */
async function handleRegisteredUser(
  message: string,
  userId: string,
  sessionId: string,
  assistant: AssistantType
) {
  // Get user profile
  const { data: userProfile, error: userError } = await typedSupabase
    .from('user_profiles')
    .select('subscription_level, location')
    .eq('id', userId)
    .maybeSingle();

  if (userError || !userProfile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 401 }
    );
  }

  // Check assistant usage limits
  const subscriptionLevel = userProfile?.subscription_level || 'free';
  const usageCheck = await checkAssistantLimit(
    userId,
    assistant,
    subscriptionLevel,
    message
  );

  if (!usageCheck.canUse) {
    return NextResponse.json({
      success: false,
      error: usageCheck.message,
      data: {
        message: usageCheck.message,
        assistant,
        requiresUpgrade: true,
        quota: {
          current: usageCheck.currentUsage,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
          resetTime: usageCheck.resetTime
        }
      }
    }, { status: 429 });
  }

  // Generate AI response
  const aiResponse = await generateAIResponse(message, {
    userType: userProfile.subscription_level,
    location: userProfile.location || { city: 'Auckland', country: 'New Zealand' },
    assistant,
    language: detectLanguage(message)
  });

  // Record usage
  await recordAssistantUsage(userId, assistant);

  // Save conversation to database
  await saveConversation(userId, sessionId, message, aiResponse.message, assistant);

  return NextResponse.json({
    success: true,
    data: {
      ...aiResponse,
      assistant,
      quota: {
        current: usageCheck.currentUsage + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
        resetTime: usageCheck.resetTime
      },
      warning: usageCheck.message // Include warning if approaching limit
    }
  });
}

/**
 * Generate AI response based on assistant type and context
 */
async function generateAIResponse(
  message: string,
  context: {
    userType: string;
    location: any;
    assistant: AssistantType;
    language: string;
  }
) {
  const { userType, location, assistant, language } = context;

  // Check if it's a recommendation request
  const messageLower = message.toLowerCase();
  const isRecommendationRequest = messageLower.includes('recommend') ||
                                 messageLower.includes('find') ||
                                 messageLower.includes('show') ||
                                 messageLower.includes('where') ||
                                 messageLower.includes('coffee') ||
                                 messageLower.includes('food') ||
                                 messageLower.includes('restaurant') ||
                                 messageLower.includes('café');

  let response: string;
  let recommendations = null;
  let adInfo = null;

  if (isRecommendationRequest) {
    // Handle recommendation requests
    const recommendationResult = await getAIRecommendations(
      { query: message, userLocation: location },
      null
    );
    
    response = recommendationResult.explanation;
    recommendations = recommendationResult.recommendations;

    // Get relevant ads
    adInfo = await getAdForChat({
      userId: 'user',
      userType,
      context: message,
      placementType: 'ai_response'
    });

  } else {
    // Handle general conversation
    const conversationResult = await generateConversationalResponse(message, {
      userType,
      userLocation: location
    });
    
    response = conversationResult.message;

    // Get relevant ads
    adInfo = await getAdForChat({
      userId: 'user',
      userType,
      context: message,
      placementType: 'ai_response'
    });
  }

  // Add assistant personality to response
  const personalityIntro = getAssistantIntroduction(assistant, language as SupportedLanguage);
  
  // For first message in session, include introduction
  if (message.length < 50) { // Short messages might be greetings
    response = `${personalityIntro}\n\n${response}`;
  }

  return {
    message: response,
    recommendations,
    followUpQuestions: isRecommendationRequest ? null : [
      assistant === 'coly' ? 'What would you like to do today?' : 'How can I help grow your business?',
      'Any other questions?',
      'Need more assistance?'
    ],
    adInfo
  };
}

/**
 * Save conversation to database
 */
async function saveConversation(
  userId: string,
  sessionId: string,
  userMessage: string,
  aiMessage: string,
  assistant: AssistantType
) {
  try {
    // Save user message
    await typedSupabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        session_id: sessionId || 'default',
        message_type: 'user',
        content: userMessage,
        metadata: { assistant },
        created_at: new Date().toISOString()
      });

    // Save AI response
    await typedSupabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        session_id: sessionId || 'default',
        message_type: 'ai',
        content: aiMessage,
        metadata: { assistant },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Record anonymous usage
 */
async function recordAnonymousUsage(sessionId: string, quotaType: string, date: string) {
  try {
    // Try to update existing record
    const { data: updateData, error: updateError } = await typedSupabase
      .from('anonymous_usage')
      .update({ 
        usage_count: typedSupabase.rpc('increment_usage_count'),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('quota_type', quotaType)
      .eq('usage_date', date);

    // If update fails (record doesn't exist), create new record
    if (updateError || !updateData) {
      await typedSupabase
        .from('anonymous_usage')
        .insert({
          session_id: sessionId,
          quota_type: quotaType,
          usage_date: date,
          usage_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error recording anonymous usage:', error);
  }
}

