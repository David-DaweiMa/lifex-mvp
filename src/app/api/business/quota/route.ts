import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const currentUserResult = await getCurrentUser();

    if (!currentUserResult.success || !currentUserResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = currentUserResult.user;
    const userId = currentUser.id;

    // Get product quota data
    const { data: productQuota, error: productError } = await supabase
      .from('product_quota_tracking')
      .select('*')
      .eq('user_id', userId);

    if (productError) {
      console.error('Error fetching product quota:', productError);
      return NextResponse.json({ error: 'Failed to fetch product quota' }, { status: 500 });
    }

    // Get assistant usage data for current hour
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const { data: assistantUsage, error: assistantError } = await supabase
      .from('assistant_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', hourStart.toISOString())
      .lt('created_at', hourEnd.toISOString());

    if (assistantError) {
      console.error('Error fetching assistant usage:', assistantError);
      return NextResponse.json({ error: 'Failed to fetch assistant usage' }, { status: 500 });
    }

    // Process product quota data
    const dailyQuota = productQuota?.find(q => q.quota_type === 'daily') || { current_count: 0, limit_count: 0 };
    const monthlyQuota = productQuota?.find(q => q.quota_type === 'monthly') || { current_count: 0, limit_count: 0 };
    const totalQuota = productQuota?.find(q => q.quota_type === 'total') || { current_count: 0, limit_count: 0 };

    // Process assistant usage data
    const colyUsage = assistantUsage?.filter(u => u.assistant_type === 'coly').length || 0;
    const maxUsage = assistantUsage?.filter(u => u.assistant_type === 'max').length || 0;

    // Get quota limits from config
    const quotaLimits = {
      coly: { hourly: currentUser.subscription_level === 'premium' || currentUser.subscription_level === 'essential' ? 50 : 0 },
      max: { hourly: currentUser.subscription_level === 'premium' ? 50 : 0 },
      trending: { monthly: currentUser.subscription_level === 'premium' ? 200 : currentUser.subscription_level === 'essential' ? 50 : 10 }
    };

    const quotaData = {
      products: {
        daily: {
          current: dailyQuota.current_count,
          limit: dailyQuota.limit_count
        },
        monthly: {
          current: monthlyQuota.current_count,
          limit: monthlyQuota.limit_count
        },
        total: {
          current: totalQuota.current_count,
          limit: totalQuota.limit_count
        }
      },
      coly: {
        hourly: {
          current: colyUsage,
          limit: quotaLimits.coly.hourly
        }
      },
      max: {
        hourly: {
          current: maxUsage,
          limit: quotaLimits.max.hourly
        }
      },
      trending: {
        monthly: {
          current: 0, // TODO: Implement trending usage tracking
          limit: quotaLimits.trending.monthly
        }
      }
    };

    return NextResponse.json(quotaData);

  } catch (error) {
    console.error('Error in quota API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
