// src/app/api/location/nearby-businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      latitude, 
      longitude, 
      radiusKm = 5, 
      categoryId = null, 
      limit = 10,
      transportMode = 'walking'
    } = body;

    // Validate input
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Call the database function
    const { data: businesses, error } = await supabase.rpc('get_nearby_businesses', {
      user_lat: latitude,
      user_lon: longitude,
      radius_km: radiusKm,
      category_filter: categoryId,
      limit_count: limit
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nearby businesses' },
        { status: 500 }
      );
    }

    // Add estimated travel time to each business
    const businessesWithTime = businesses?.map((business: any) => ({
      id: business.business_id,
      name: business.business_name,
      categoryId: business.business_category_id,
      rating: business.business_rating,
      distance: parseFloat(business.distance_km),
      latitude: parseFloat(business.business_latitude),
      longitude: parseFloat(business.business_longitude),
      address: business.business_address,
      phone: business.business_phone,
      estimatedTime: calculateEstimatedTime(parseFloat(business.distance_km), transportMode)
    })) || [];

    return NextResponse.json({
      success: true,
      businesses: businessesWithTime,
      count: businessesWithTime.length,
      searchParams: {
        latitude,
        longitude,
        radiusKm,
        categoryId,
        transportMode
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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