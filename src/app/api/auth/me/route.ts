import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    const result = await getCurrentUser();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
