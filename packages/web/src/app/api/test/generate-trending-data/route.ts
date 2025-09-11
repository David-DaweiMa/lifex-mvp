// 生成Trending测试数据的API端点 - 专注于trending内容数据
import { NextResponse } from 'next/server';
import { typedSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('开始生成trending测试数据...');

    // 使用现有的测试用户ID，不创建新用户
    const existingUserIds = [
      '11111111-1111-1111-1111-111111111111', // coffee_lover
      '22222222-2222-2222-2222-222222222222', // fitness_guru
      '33333333-3333-3333-3333-333333333333', // food_blogger
      '44444444-4444-4444-4444-444444444444', // beauty_expert
      '55555555-5555-5555-5555-555555555555', // tech_enthusiast
      '66666666-6666-6666-6666-666666666666', // travel_explorer
      '77777777-7777-7777-7777-777777777777', // music_lover
      '88888888-8888-8888-8888-888888888888'  // art_creator
    ];

    // 1. 创建20个trending帖子
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
      },
      {
        id: 'post-006',
        author_id: '66666666-6666-6666-6666-666666666666',
        content: 'Hidden gem alert! This tiny coffee cart in the CBD serves the most amazing cold brew. The barista is so passionate about coffee and always remembers my order. Perfect for a quick caffeine fix during lunch break! ☕️',
        images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'],
        hashtags: ['Coffee', 'ColdBrew', 'CBD', 'HiddenGem', 'LunchBreak'],
        location: { description: 'Auckland CBD', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 634,
        like_count: 67,
        comment_count: 14,
        share_count: 6,
        is_active: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-007',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'Morning run along the waterfront is the best way to start the day! The path is well-maintained and the views are stunning. Saw so many other runners and cyclists - great community vibe! 🏃‍♂️🌅',
        images: [
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
        ],
        hashtags: ['Running', 'Waterfront', 'Morning', 'Community', 'Exercise'],
        location: { description: 'Auckland Waterfront', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 1123,
        like_count: 145,
        comment_count: 38,
        share_count: 22,
        is_active: true,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-008',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'This new restaurant in Mt Eden is absolutely incredible! The chef is a master of fusion cuisine and every dish is a work of art. The wine pairing was perfect too. Definitely worth the wait for a table! 🍷🍽️',
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'
        ],
        hashtags: ['Restaurant', 'Fusion', 'MtEden', 'Wine', 'FineDining'],
        location: { description: 'Mt Eden, Auckland', coordinates: { lat: -36.8785, lng: 174.7633 } },
        view_count: 1678,
        like_count: 234,
        comment_count: 56,
        share_count: 41,
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-009',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Tried this new skincare treatment and my skin is glowing! The therapist was so knowledgeable and explained everything step by step. The products they use are all natural and the results speak for themselves! ✨',
        images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop'],
        hashtags: ['Skincare', 'Natural', 'Treatment', 'Glowing', 'Beauty'],
        location: { description: 'Ponsonby, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 987,
        like_count: 123,
        comment_count: 29,
        share_count: 17,
        is_active: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-010',
        author_id: '55555555-5555-5555-5555-555555555555',
        content: 'This new app for tracking local events is a game changer! Found so many cool things happening in Auckland that I never knew about. The interface is clean and the notifications are perfectly timed. Highly recommend! 📱',
        images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'],
        hashtags: ['App', 'Events', 'Local', 'Notifications', 'Technology'],
        location: { description: 'Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 756,
        like_count: 89,
        comment_count: 21,
        share_count: 11,
        is_active: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-011',
        author_id: '77777777-7777-7777-7777-777777777777',
        content: 'Amazing live music venue in Kingsland! The acoustics are perfect and the atmosphere is electric. Discovered some incredible local bands tonight. The craft beer selection is also top-notch! 🎵🍺',
        images: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop'
        ],
        hashtags: ['LiveMusic', 'Kingsland', 'LocalBands', 'CraftBeer', 'Entertainment'],
        location: { description: 'Kingsland, Auckland', coordinates: { lat: -36.8685, lng: 174.7433 } },
        view_count: 1345,
        like_count: 178,
        comment_count: 42,
        share_count: 25,
        is_active: true,
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-012',
        author_id: '88888888-8888-8888-8888-888888888888',
        content: 'Incredible art exhibition at the Auckland Art Gallery! The contemporary pieces are thought-provoking and the curation is flawless. Spent 3 hours here and could have stayed longer. Free entry on Sundays! 🎨🖼️',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
        ],
        hashtags: ['Art', 'Gallery', 'Contemporary', 'Exhibition', 'Culture'],
        location: { description: 'Auckland Art Gallery', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 892,
        like_count: 156,
        comment_count: 33,
        share_count: 19,
        is_active: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-013',
        author_id: '11111111-1111-1111-1111-111111111111',
        content: 'Weekend farmers market haul! Fresh organic produce, artisan bread, and the most delicious honey. The vendors are so friendly and passionate about their products. Supporting local farmers feels amazing! 🥕🍯',
        images: [
          'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
        ],
        hashtags: ['FarmersMarket', 'Organic', 'Local', 'Fresh', 'SupportLocal'],
        location: { description: 'Britomart Market, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 723,
        like_count: 98,
        comment_count: 24,
        share_count: 13,
        is_active: true,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-014',
        author_id: '66666666-6666-6666-6666-666666666666',
        content: 'Epic sunset hike up One Tree Hill! The 360-degree views of Auckland are absolutely breathtaking. Perfect weather and great company. This is why I love living in this city! 🌅🏔️',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop'
        ],
        hashtags: ['Hiking', 'OneTreeHill', 'Sunset', 'Views', 'Adventure'],
        location: { description: 'One Tree Hill, Auckland', coordinates: { lat: -36.9085, lng: 174.7833 } },
        view_count: 1456,
        like_count: 234,
        comment_count: 67,
        share_count: 45,
        is_active: true,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-015',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'Yoga class at the beach was incredible! The sound of waves, fresh air, and peaceful energy. The instructor was amazing and the session left me feeling so centered. Can\'t wait for next week! 🧘‍♀️🌊',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        ],
        hashtags: ['Yoga', 'Beach', 'Wellness', 'Meditation', 'Peaceful'],
        location: { description: 'Mission Bay, Auckland', coordinates: { lat: -36.8485, lng: 174.7933 } },
        view_count: 1089,
        like_count: 167,
        comment_count: 38,
        share_count: 22,
        is_active: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-016',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'Food truck festival was a culinary adventure! Tried everything from Korean BBQ to authentic Mexican tacos. The flavors were incredible and the community vibe was amazing. Already planning to come back next month! 🚚🌮',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop'
        ],
        hashtags: ['FoodTrucks', 'Festival', 'KoreanBBQ', 'Mexican', 'Community'],
        location: { description: 'Wynyard Quarter, Auckland', coordinates: { lat: -36.8485, lng: 174.7533 } },
        view_count: 1234,
        like_count: 189,
        comment_count: 51,
        share_count: 28,
        is_active: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-017',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Spa day at this luxury wellness center was pure bliss! The massage therapist was incredible and the facilities are world-class. The sauna and steam room were the perfect way to unwind. Worth every penny! 💆‍♀️✨',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop'
        ],
        hashtags: ['Spa', 'Wellness', 'Massage', 'Luxury', 'Relaxation'],
        location: { description: 'Parnell, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 876,
        like_count: 134,
        comment_count: 27,
        share_count: 16,
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-018',
        author_id: '55555555-5555-5555-5555-555555555555',
        content: 'Tech meetup was fantastic! Met so many interesting people working on innovative projects. The presentations were inspiring and the networking opportunities were incredible. The tech community here is thriving! 💻🤝',
        images: [
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
        ],
        hashtags: ['TechMeetup', 'Networking', 'Innovation', 'Community', 'Startups'],
        location: { description: 'Auckland CBD', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 945,
        like_count: 156,
        comment_count: 43,
        share_count: 24,
        is_active: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-019',
        author_id: '77777777-7777-7777-7777-777777777777',
        content: 'Jazz night at this intimate venue was magical! The musicians were incredibly talented and the atmosphere was perfect. The cocktails were expertly crafted too. This is what live music should be like! 🎷🍸',
        images: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop'
        ],
        hashtags: ['Jazz', 'LiveMusic', 'Intimate', 'Cocktails', 'Atmosphere'],
        location: { description: 'Ponsonby, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 1123,
        like_count: 178,
        comment_count: 39,
        share_count: 21,
        is_active: true,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-020',
        author_id: '88888888-8888-8888-8888-888888888888',
        content: 'Street art walking tour was eye-opening! Discovered so many incredible murals and learned about the artists behind them. The guide was passionate and knowledgeable. Auckland\'s street art scene is world-class! 🎨🚶‍♂️',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
        ],
        hashtags: ['StreetArt', 'WalkingTour', 'Murals', 'Artists', 'Culture'],
        location: { description: 'Karangahape Road, Auckland', coordinates: { lat: -36.8585, lng: 174.7533 } },
        view_count: 1345,
        like_count: 201,
        comment_count: 52,
        share_count: 31,
        is_active: true,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
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
      // post-001 点赞
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-001' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-001' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-001' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: 'post-001' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: 'post-001' },
      
      // post-002 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-002' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-002' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-002' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: 'post-002' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: 'post-002' },
      
      // post-003 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-003' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-003' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-003' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-003' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: 'post-003' },
      
      // post-004 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-004' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-004' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-004' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: 'post-004' },
      
      // post-005 点赞
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-005' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-005' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: 'post-005' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: 'post-005' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: 'post-005' }
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
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: 'post-001', share_type: 'native', platform: 'app' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: 'post-002', share_type: 'native', platform: 'app' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: 'post-002', share_type: 'native', platform: 'app' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-003', share_type: 'native', platform: 'app' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: 'post-003', share_type: 'native', platform: 'app' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: 'post-004', share_type: 'native', platform: 'app' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: 'post-004', share_type: 'native', platform: 'app' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: 'post-005', share_type: 'native', platform: 'app' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: 'post-005', share_type: 'native', platform: 'app' }
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

    // 计算总的评论数（从帖子数据中获取，因为post_comments表可能不存在）
    const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0);

    console.log('Trending测试数据生成完成！');

    return NextResponse.json({
      success: true,
      message: 'Trending测试数据生成成功',
      data: {
        posts: {
          created: postCount || 0,
          data: insertedPosts
        },
        likes: {
          created: likeCount || 0,
          data: insertedLikes
        },
        comments: {
          created: totalComments,
          data: []
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
