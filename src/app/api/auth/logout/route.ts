import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const result = await logoutUser();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
