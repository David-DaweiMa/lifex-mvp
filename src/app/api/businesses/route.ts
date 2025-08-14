import { NextRequest, NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

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
    let query = typedSupabase
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

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: businesses, error } = await query;
    
    // Get count separately
    const { count } = await typedSupabase
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
    const transformedBusinesses = businesses?.map(business => ({
      id: business.id,
      name: business.name,
      type: business.description || 'Local Business',
      category: business.category_id || 'general',
      rating: business.rating || 0,
      reviews: business.review_count || 0,
      distance: '0.5km', // Placeholder - would need location calculation
      price: business.price_range || '$$',
      tags: business.amenities ? Object.keys(JSON.parse(business.amenities)) : [],
      highlights: business.amenities ? Object.keys(JSON.parse(business.amenities)).slice(0, 3) : [],
      aiReason: `Highly rated ${business.name} with ${business.review_count || 0} reviews.`,
      phone: business.phone || '',
      address: business.address || '',
      image: getRandomGradient(), // Random gradient for visual appeal
      isOpen: isBusinessOpen(business.opening_hours),
      website: business.website || '',
      logo_url: business.logo_url || '',
      cover_photo_url: business.cover_photo_url || '',
      latitude: business.latitude,
      longitude: business.longitude,
      external_id: business.external_id,
      google_maps_url: business.google_maps_url
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
