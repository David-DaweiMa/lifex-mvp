// src/app/api/location/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取用户位置偏好
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('preferred_locations')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    const locationPreferences = preferences?.preferred_locations || {
      max_distance_km: 5.0,
      transport_mode: 'walking',
      auto_location_update: true,
      preferred_areas: [],
      avoid_areas: []
    };

    return NextResponse.json({
      success: true,
      preferences: locationPreferences
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 更新用户位置偏好
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      maxDistance = 5.0,
      transportMode = 'walking',
      autoLocationUpdate = true,
      preferredAreas = [],
      avoidAreas = []
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Call the database function to update preferences
    const { data, error } = await supabase.rpc('update_user_location_preferences', {
      p_user_id: userId,
      p_max_distance_km: maxDistance,
      p_transport_mode: transportMode,
      p_auto_location_update: autoLocationUpdate,
      p_preferred_areas: JSON.stringify(preferredAreas),
      p_avoid_areas: JSON.stringify(avoidAreas)
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}