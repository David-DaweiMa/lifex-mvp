import { NextRequest, NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  try {

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // 获取商家基本信息
    const { data: business, error } = await (typedSupabase as any)
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('is_active', true)
      .single();

    if (error || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // 获取商家描述
    const { data: descriptions } = await (typedSupabase as any)
      .from('business_descriptions')
      .select('*')
      .eq('business_id', businessId);

    // 获取商家菜单
    const { data: menus } = await (typedSupabase as any)
      .from('business_menus')
      .select('*')
      .eq('business_id', businessId);

    // 获取商家照片
    const { data: photos } = await (typedSupabase as any)
      .from('business_photos')
      .select('*')
      .eq('business_id', businessId);

    // 获取商家评价
    const { data: reviews } = await (typedSupabase as any)
      .from('business_reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 转换数据格式
    const transformedBusiness = {
      id: (business as any).id,
      name: (business as any).name,
      type: business.description || 'Local Business',
      category: business.category_id || 'general',
      rating: business.rating || 0,
      review_count: business.review_count || 0,
      distance: '0.5km', // Placeholder
      price: business.price_range || '$$',
      tags: business.amenities ? Object.keys(JSON.parse(business.amenities)) : [],
      highlights: business.amenities ? Object.keys(JSON.parse(business.amenities)).slice(0, 3) : [],
      aiReason: `Highly rated ${business.name} with ${business.review_count || 0} reviews.`,
      phone: business.phone || '',
      address: business.address || '',
      image: getRandomGradient(),
      isOpen: isBusinessOpen(business.opening_hours),
      website: business.website || '',
      logo_url: business.logo_url || '',
      cover_photo_url: business.cover_photo_url || '',
      latitude: (business as any).latitude,
      longitude: (business as any).longitude,
      external_id: (business as any).external_id,
      google_maps_url: (business as any).google_maps_url,
      // 额外信息
      descriptions: descriptions || [],
      menus: menus || [],
      photos: photos || [],
      reviews: reviews || [],
      opening_hours: (business as any).opening_hours,
      email: (business as any).email,
      city: (business as any).city,
      country: (business as any).country,
      postal_code: business.postal_code
    };

    return NextResponse.json({
      success: true,
      data: transformedBusiness
    });

  } catch (error) {
    console.error('Business detail API error:', error);
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
  if (!openingHours) return true;
  
  try {
    const hours = JSON.parse(openingHours);
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    const todayHours = hours.find((hour: string) => hour.startsWith(currentDay));
    if (!todayHours) return false;
    
    if (todayHours.includes('Open 24 hours')) return true;
    if (todayHours.includes('Closed')) return false;
    
    return true;
  } catch (error) {
    return true;
  }
}
