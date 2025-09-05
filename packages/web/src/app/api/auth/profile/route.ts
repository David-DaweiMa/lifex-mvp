import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/authService';
import { typedSupabase } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const { data: { user: authUser }, error: authError } = await typedSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, username } = body;

    // Validate input
    if (full_name && typeof full_name !== 'string') {
      return NextResponse.json(
        { error: 'Full name must be a string' },
        { status: 400 }
      );
    }

    if (username && typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username must be a string' },
        { status: 400 }
      );
    }

    // Check if username is already taken (if provided)
    if (username) {
      const { data: existingUser } = await (typedSupabase as any)
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .neq('id', authUser.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const result = await updateUserProfile(authUser.id, {
      full_name,
      username
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
