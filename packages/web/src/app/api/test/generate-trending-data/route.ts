// 生成Trending测试数据的API端点
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('开始生成trending测试数据...');

    // 1. 创建测试用户
    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'coffee.lover@example.com',
        username: 'coffee_lover',
        full_name: 'Sarah Chen',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Coffee enthusiast and Auckland local. Love discovering new cafes and sharing hidden gems! ☕️',
        location: { city: 'Auckland', country: 'New Zealand', coordinates: { lat: -36.8485, lng: 174.7633 } },
        subscription_level: 'essential',
        has_business_features: false,
        verification_status: 'none',
        is_active: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'fitness.guru@example.com',
        username: 'fitness_guru',
        full_name: 'Mike Johnson',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Personal trainer and fitness enthusiast. Helping people achieve their health goals! 💪',
        location: { city: 'Auckland', country: 'New Zealand', coordinates: { lat: -36.8485, lng: 174.7633 } },
        subscription_level: 'premium',
        has_business_features: true,
        verification_status: 'approved',
        is_active: true,
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'food.blogger@example.com',
        username: 'food_blogger',
        full_name: 'Emma Wilson',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Food blogger and restaurant reviewer. Always on the hunt for the best eats in Auckland! 🍽️',
        location: { city: 'Auckland', country: 'New Zealand', coordinates: { lat: -36.8485, lng: 174.7633 } },
        subscription_level: 'premium',
        has_business_features: true,
        verification_status: 'approved',
        is_active: true,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'beauty.expert@example.com',
        username: 'beauty_expert',
        full_name: 'Lisa Park',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        bio: 'Beauty therapist and skincare specialist. Sharing tips for healthy, glowing skin! ✨',
        location: { city: 'Auckland', country: 'New Zealand', coordinates: { lat: -36.8485, lng: 174.7633 } },
        subscription_level: 'essential',
        has_business_features: false,
        verification_status: 'none',
        is_active: true,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        email: 'tech.enthusiast@example.com',
        username: 'tech_enthusiast',
        full_name: 'David Kim',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Tech enthusiast and early adopter. Love exploring new technologies and smart home solutions! 🤖',
        location: { city: 'Auckland', country: 'New Zealand', coordinates: { lat: -36.8485, lng: 174.7633 } },
        subscription_level: 'free',
        has_business_features: false,
        verification_status: 'none',
        is_active: true,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // 插入用户数据
    const { data: insertedUsers, error: userError } = await (typedSupabase as any)
      .from('user_profiles')
      .upsert(users, { onConflict: 'id' })
      .select();

    if (userError) {
      console.error('用户创建失败:', userError);
      return NextResponse.json(
        { success: false, error: '用户创建失败', details: userError.message },
        { status: 500 }
      );
    }

    console.log(`成功创建/更新 ${insertedUsers?.length || 0} 个用户`);

    // 2. 创建trending帖子
    const posts = [
      {
        id: 'post-001',
        author_id: '11111111-1111-1111-1111-111111111111',
        content: 'Just discovered this amazing coffee shop in Ponsonby! The owner is Italian and makes incredible hand-drip coffee 🔥 Perfect window seat for people watching, and fast WiFi makes it ideal for work ✨ The flat white here is absolutely divine!',
        images: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop'
        ],
        hashtags: ['Coffee', 'Ponsonby', 'Italian', 'Workspace', 'FlatWhite'],
        location: { description: 'Ponsonby, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 1250,
        like_count: 89,
        comment_count: 23,
        share_count: 12,
        is_active: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-002',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'After trying 10 gyms, I found the perfect one! FitNZ is amazing - super patient trainers, new equipment, and they\'re especially beginner-friendly 💯 No judgment for first-timers! The personal training sessions have been life-changing. Highly recommend!',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
        ],
        hashtags: ['Fitness', 'BeginnerFriendly', 'PersonalTraining', 'WeightLoss', 'Gym'],
        location: { description: 'Newton, Auckland', coordinates: { lat: -36.8585, lng: 174.7533 } },
        view_count: 980,
        like_count: 156,
        comment_count: 45,
        share_count: 28,
        is_active: true,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-003',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'This eco-friendly salon is changing the game! All organic products, zero waste policy, and the most relaxing atmosphere. Finally found beauty treatments that align with my values 🌱 The facial was incredible and my skin has never looked better!',
        images: [
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop'
        ],
        hashtags: ['EcoFriendly', 'Sustainable', 'Beauty', 'Organic', 'Facial'],
        location: { description: 'Newmarket, Auckland', coordinates: { lat: -36.8385, lng: 174.7733 } },
        view_count: 1456,
        like_count: 203,
        comment_count: 67,
        share_count: 34,
        is_active: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-004',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Best haircut I\'ve had in years! The stylist really listened to what I wanted and gave me exactly the look I was going for. The salon has such a welcoming atmosphere and the staff are so professional ✨ Booked my next appointment already!',
        images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop'],
        hashtags: ['Haircut', 'Styling', 'Professional', 'Salon', 'Beauty'],
        location: { description: 'Parnell, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 756,
        like_count: 98,
        comment_count: 19,
        share_count: 8,
        is_active: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-005',
        author_id: '55555555-5555-5555-5555-555555555555',
        content: 'Just set up my new smart home system and it\'s incredible! Voice control for everything - lights, temperature, music. The installation was so easy and the app is super intuitive. Living in the future feels amazing! 🤖✨',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&h=600&fit=crop'
        ],
        hashtags: ['SmartHome', 'Technology', 'VoiceControl', 'Automation', 'Future'],
        location: { description: 'Auckland Central', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 892,
        like_count: 134,
        comment_count: 31,
        share_count: 15,
        is_active: true,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    // 插入帖子数据
    const { data: insertedPosts, error: postError } = await (typedSupabase as any)
      .from('trending_posts')
      .upsert(posts, { onConflict: 'id' })
      .select();

    if (postError) {
      console.error('帖子创建失败:', postError);
      return NextResponse.json(
        { success: false, error: '帖子创建失败', details: postError.message },
        { status: 500 }
      );
    }

    console.log(`成功创建/更新 ${insertedPosts?.length || 0} 个帖子`);

    // 3. 创建点赞记录
    const likes = [
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-001' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-001' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-001' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-002' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-002' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-002' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-003' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-003' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-003' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-004' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-004' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-005' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-005' }
    ];

    const { data: insertedLikes, error: likeError } = await (typedSupabase as any)
      .from('post_likes')
      .upsert(likes, { onConflict: 'user_id,post_id' })
      .select();

    if (likeError) {
      console.error('点赞记录创建失败:', likeError);
      // 不返回错误，因为点赞记录不是必需的
    } else {
      console.log(`成功创建/更新 ${insertedLikes?.length || 0} 个点赞记录`);
    }

    // 4. 创建分享记录
    const shares = [
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-001', share_type: 'native', platform: 'app' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-002', share_type: 'native', platform: 'app' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-003', share_type: 'native', platform: 'app' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-004', share_type: 'native', platform: 'app' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-005', share_type: 'native', platform: 'app' }
    ];

    const { data: insertedShares, error: shareError } = await (typedSupabase as any)
      .from('post_shares')
      .upsert(shares, { onConflict: 'user_id,post_id,share_type' })
      .select();

    if (shareError) {
      console.error('分享记录创建失败:', shareError);
      // 不返回错误，因为分享记录不是必需的
    } else {
      console.log(`成功创建/更新 ${insertedShares?.length || 0} 个分享记录`);
    }

    // 5. 获取统计信息
    const { count: userCount } = await (typedSupabase as any)
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .in('id', users.map(u => u.id));

    const { count: postCount } = await (typedSupabase as any)
      .from('trending_posts')
      .select('*', { count: 'exact', head: true })
      .in('id', posts.map(p => p.id));

    const { count: likeCount } = await (typedSupabase as any)
      .from('post_likes')
      .select('*', { count: 'exact', head: true });

    const { count: shareCount } = await (typedSupabase as any)
      .from('post_shares')
      .select('*', { count: 'exact', head: true });

    console.log('Trending测试数据生成完成！');

    return NextResponse.json({
      success: true,
      message: 'Trending测试数据生成成功',
      data: {
        users: {
          created: userCount || 0,
          data: insertedUsers
        },
        posts: {
          created: postCount || 0,
          data: insertedPosts
        },
        likes: {
          created: likeCount || 0,
          data: insertedLikes
        },
        shares: {
          created: shareCount || 0,
          data: insertedShares
        }
      }
    });

  } catch (error) {
    console.error('生成trending测试数据时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '生成trending测试数据失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
