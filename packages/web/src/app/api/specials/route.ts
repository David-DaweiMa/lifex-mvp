import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 构建查询
    let query = supabase
      .from('specials')
      .select(`
        *,
        businesses!specials_business_id_fkey (
          id,
          name,
          description,
          logo_url,
          category
        )
      `)
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString().split('T')[0]) // 只获取未过期的优惠
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 如果指定了分类，添加分类过滤
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: specials, error } = await query;

    if (error) {
      console.error('查询specials数据时出错:', error);
      return NextResponse.json(
        { success: false, message: '查询specials数据失败', error: error.message },
        { status: 500 }
      );
    }

    // 转换数据格式以匹配前端期望的格式
    const formattedSpecials = specials?.map(special => ({
      id: special.id,
      businessName: special.businesses?.name || 'Unknown Business',
      businessType: special.businesses?.category || 'Business',
      title: special.title,
      description: special.description,
      originalPrice: special.original_price,
      discountPrice: special.discount_price,
      discountPercent: special.discount_percent,
      category: special.category,
      location: special.location,
      distance: special.distance,
      rating: special.rating,
      reviewCount: special.review_count,
      image: special.image_url || 'from-amber-400 to-orange-500',
      validUntil: special.valid_until,
      isVerified: special.is_verified,
      views: special.views,
      claimed: special.claimed,
      maxClaims: special.max_claims,
      tags: special.tags || []
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        specials: formattedSpecials,
        total: formattedSpecials.length,
        category: category || 'all',
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('获取specials数据时出错:', error);
    return NextResponse.json(
      { success: false, message: '获取specials数据失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}
