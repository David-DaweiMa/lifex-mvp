import { NextRequest, NextResponse } from 'next/server';
import { typedSupabaseAdmin } from '@/lib/supabase';
import { checkProductQuota } from '@/lib/productQuota';
import { checkBusinessPermissions } from '@/lib/businessPermissions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build query
    let query = typedSupabaseAdmin
      .from('businesses')
      .select('*')
      .eq('is_active', true);

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    if (sortBy === 'rating') {
      query = query.order('rating', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'review_count') {
      query = query.order('review_count', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination - use limit and offset for REST API
    query = query.limit(limit).offset(offset);

    const { data: businesses, error } = await query;
    
    // Get count separately
    const { count } = await (typedSupabaseAdmin as any)
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching businesses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch businesses', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const transformedBusinesses = businesses?.map((business: any) => ({
      id: (business as any).id,
      name: (business as any).name,
      type: (business as any).description || 'Local Business',
      category: (business as any).category_id || 'general',
      rating: (business as any).rating || 0,
      review_count: (business as any).review_count || 0,
      distance: '0.5km', // Placeholder - would need location calculation
      price: (business as any).price_range || '$$',
      tags: (business as any).amenities ? Object.keys(JSON.parse((business as any).amenities)) : [],
      highlights: (business as any).amenities ? Object.keys(JSON.parse((business as any).amenities)).slice(0, 3) : [],
      aiReason: `Highly rated ${(business as any).name} with ${(business as any).review_count || 0} reviews.`,
      phone: (business as any).phone || '',
      address: (business as any).address || '',
      image: getRandomGradient(), // Random gradient for visual appeal
      isOpen: isBusinessOpen((business as any).opening_hours),
      website: (business as any).website || '',
      logo_url: (business as any).logo_url || '',
      cover_photo_url: (business as any).cover_photo_url || '',
      latitude: (business as any).latitude,
      longitude: (business as any).longitude,
      external_id: (business as any).external_id,
      google_maps_url: (business as any).google_maps_url
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedBusinesses,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Businesses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to get random gradient
function getRandomGradient(): string {
  const gradients = [
    'from-blue-400 to-purple-500',
    'from-green-400 to-blue-500',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-red-500',
    'from-indigo-400 to-purple-500',
    'from-teal-400 to-blue-500',
    'from-orange-400 to-red-500',
    'from-purple-400 to-pink-500'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

// Helper function to check if business is open
function isBusinessOpen(openingHours: string | null): boolean {
  if (!openingHours) return true; // Default to open if no hours provided
  
  try {
    const hours = JSON.parse(openingHours);
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    const todayHours = hours.find((hour: string) => hour.startsWith(currentDay));
    if (!todayHours) return false;
    
    // Simple check - if it contains "Open 24 hours" or current time logic
    if (todayHours.includes('Open 24 hours')) return true;
    if (todayHours.includes('Closed')) return false;
    
    // For now, return true as default
    return true;
  } catch (error) {
    return true; // Default to open if parsing fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, businessData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!businessData) {
      return NextResponse.json(
        { success: false, error: 'Business data is required' },
        { status: 400 }
      );
    }

    // Get user profile to check subscription level
    const { data: userProfile, error: profileError } = await (typedSupabaseAdmin as any)
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const subscriptionLevel = userProfile.subscription_level || 'free';

    // Check business permissions
    const permissions = await checkBusinessPermissions(userId, subscriptionLevel);
    
    if (!permissions.canPublishProducts) {
      return NextResponse.json(
        { 
          success: false, 
          error: permissions.upgradeMessage || 'Cannot publish products',
          quota: null
        },
        { status: 403 }
      );
    }

    // Check product quota
    const quotaCheck = await checkProductQuota(userId, subscriptionLevel);
    
    if (!quotaCheck.canPublish) {
      return NextResponse.json(
        { 
          success: false, 
          error: quotaCheck.message || 'Product publishing limit reached',
          quota: quotaCheck.quota
        },
        { status: 429 }
      );
    }

    // Create the business record
    const { data: newBusiness, error: createError } = await (typedSupabaseAdmin as any)
      .from('businesses')
      .insert({
        user_id: userId,
        name: businessData.name,
        description: businessData.description,
        category_id: businessData.category || 'general',
        address: businessData.address,
        phone: businessData.phone,
        website: businessData.website,
        price_range: businessData.priceRange || '$$',
        opening_hours: businessData.openingHours ? JSON.stringify(businessData.openingHours) : null,
        amenities: businessData.amenities ? JSON.stringify(businessData.amenities) : null,
        latitude: businessData.latitude,
        longitude: businessData.longitude,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating business:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create business' },
        { status: 500 }
      );
    }

    // Update quota info
    const updatedQuotaCheck = await checkProductQuota(userId, subscriptionLevel);

    return NextResponse.json({
      success: true,
      data: {
        business: newBusiness,
        message: 'Business created successfully',
        quota: updatedQuotaCheck.quota,
        warning: updatedQuotaCheck.warning
      }
    });

  } catch (error) {
    console.error('Business creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
