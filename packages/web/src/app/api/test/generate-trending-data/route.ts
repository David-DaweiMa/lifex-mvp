import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const typedSupabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    console.log('开始生成trending测试数据...');

    // 使用现有的测试用户ID，不创建新用户
    const existingUserIds = [
      '11111111-1111-1111-1111-111111111111', // coffee_lover
      '22222222-2222-2222-2222-222222222222', // fitness_enthusiast
      '33333333-3333-3333-3333-333333333333', // foodie_explorer
      '44444444-4444-4444-4444-444444444444', // nature_lover
      '55555555-5555-5555-5555-555555555555', // tech_geek
      '66666666-6666-6666-6666-666666666666', // art_enthusiast
      '77777777-7777-7777-7777-777777777777', // travel_blogger
      '88888888-8888-8888-8888-888888888888'  // local_explorer
    ];

    // 1. 创建20个trending帖子
    const posts = [
      {
        id: '11111111-1111-1111-1111-111111111101',
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
        id: '22222222-2222-2222-2222-222222222201',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'After trying 10 gyms, I found the perfect one! FitNZ is amazing - super patient trainers, new equipment, and they\'re especially beginner-friendly 💯 No judgment for first-timers! The personal training sessions have been life-changing. Highly recommend!',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
        ],
        hashtags: ['Fitness', 'BeginnerFriendly', 'PersonalTraining', 'WeightLoss', 'Gym'],
        location: { description: 'Newton, Auckland', coordinates: { lat: -36.8585, lng: 174.7533 } },
        view_count: 2100,
        like_count: 156,
        comment_count: 45,
        share_count: 28,
        is_active: true,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333301',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'OMG the ramen at this hidden gem in Dominion Road is INSANE! 🍜 Rich tonkotsu broth, perfectly cooked noodles, and the chashu is melt-in-your-mouth tender. Worth the 30-minute wait! This place is a must-visit for ramen lovers!',
        images: [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop'
        ],
        hashtags: ['Ramen', 'DominionRoad', 'Japanese', 'Foodie', 'HiddenGem'],
        location: { description: 'Dominion Road, Auckland', coordinates: { lat: -36.8685, lng: 174.7433 } },
        view_count: 3200,
        like_count: 234,
        comment_count: 67,
        share_count: 34,
        is_active: true,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444401',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Morning walk at Cornwall Park was absolutely magical! 🌅 The sheep were grazing peacefully, and the views of the city skyline were breathtaking. Perfect way to start the day with some fresh air and exercise. Nature therapy at its finest!',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop'
        ],
        hashtags: ['CornwallPark', 'MorningWalk', 'Nature', 'Sheep', 'CityViews'],
        location: { description: 'Cornwall Park, Auckland', coordinates: { lat: -36.9085, lng: 174.7833 } },
        view_count: 1800,
        like_count: 145,
        comment_count: 32,
        share_count: 18,
        is_active: true,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '55555555-5555-5555-5555-555555555501',
        author_id: '55555555-5555-5555-5555-555555555555',
        content: 'Just got my hands on the latest iPhone 15 Pro! The titanium build feels incredible and the camera improvements are mind-blowing 📱 The Action Button is surprisingly useful for quick access to camera and flashlight. Tech enthusiasts, this is worth the upgrade!',
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
        ],
        hashtags: ['iPhone15Pro', 'Tech', 'Apple', 'Camera', 'Titanium'],
        location: { description: 'Sylvia Park, Auckland', coordinates: { lat: -36.9285, lng: 174.8033 } },
        view_count: 4500,
        like_count: 312,
        comment_count: 89,
        share_count: 56,
        is_active: true,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '66666666-6666-6666-6666-666666666601',
        author_id: '66666666-6666-6666-6666-666666666666',
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
        id: '77777777-7777-7777-7777-777777777701',
        author_id: '77777777-7777-7777-7777-777777777777',
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
        id: '88888888-8888-8888-8888-888888888801',
        author_id: '88888888-8888-8888-8888-888888888888',
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
        id: '11111111-1111-1111-1111-111111111102',
        author_id: '11111111-1111-1111-1111-111111111111',
        content: 'Found the best brunch spot in town! The avocado toast is perfectly seasoned and the coffee is roasted in-house. The atmosphere is cozy and the staff are incredibly friendly. Perfect for a lazy Sunday morning! 🥑☕',
        images: [
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop'
        ],
        hashtags: ['Brunch', 'AvocadoToast', 'Coffee', 'Sunday', 'Cozy'],
        location: { description: 'Newmarket, Auckland', coordinates: { lat: -36.8685, lng: 174.7733 } },
        view_count: 2100,
        like_count: 178,
        comment_count: 42,
        share_count: 25,
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'Yoga class at the beach was absolutely rejuvenating! The sound of waves, fresh sea breeze, and the peaceful atmosphere made it the perfect workout. My mind and body feel so refreshed. Can\'t wait for next week\'s session! 🧘‍♀️🌊',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        ],
        hashtags: ['Yoga', 'Beach', 'Wellness', 'Mindfulness', 'Outdoor'],
        location: { description: 'Mission Bay, Auckland', coordinates: { lat: -36.8485, lng: 174.8233 } },
        view_count: 1650,
        like_count: 134,
        comment_count: 28,
        share_count: 16,
        is_active: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333302',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'Sushi masterclass at this authentic Japanese restaurant was incredible! Learned the art of perfect rice preparation and fish selection. The chef\'s attention to detail is amazing. Now I can make restaurant-quality sushi at home! 🍣👨‍🍳',
        images: [
          'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'
        ],
        hashtags: ['Sushi', 'Japanese', 'CookingClass', 'Authentic', 'Masterclass'],
        location: { description: 'Parnell, Auckland', coordinates: { lat: -36.8585, lng: 174.7733 } },
        view_count: 2800,
        like_count: 201,
        comment_count: 56,
        share_count: 32,
        is_active: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444402',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Botanical Gardens are in full bloom! The rose garden is absolutely stunning with hundreds of varieties. Perfect place for a peaceful walk and some photography. The colors are so vibrant this season! 🌹📸',
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        ],
        hashtags: ['BotanicalGardens', 'Roses', 'Photography', 'Nature', 'Spring'],
        location: { description: 'Auckland Domain', coordinates: { lat: -36.8585, lng: 174.7733 } },
        view_count: 1950,
        like_count: 167,
        comment_count: 38,
        share_count: 22,
        is_active: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '55555555-5555-5555-5555-555555555502',
        author_id: '55555555-5555-5555-5555-555555555555',
        content: 'New gaming setup is complete! The RTX 4090 is absolutely insane for 4K gaming. Ray tracing in Cyberpunk 2077 looks photorealistic. Finally achieved my dream gaming rig! 🎮💻',
        images: [
          'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop'
        ],
        hashtags: ['Gaming', 'RTX4090', '4K', 'RayTracing', 'Setup'],
        location: { description: 'Home, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 5200,
        like_count: 389,
        comment_count: 112,
        share_count: 78,
        is_active: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '66666666-6666-6666-6666-666666666602',
        author_id: '66666666-6666-6666-6666-666666666666',
        content: 'Street art walking tour in the CBD was amazing! The murals are so creative and tell the story of our city. The guide was knowledgeable and passionate. Auckland\'s art scene is thriving! 🎨🏙️',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
        ],
        hashtags: ['StreetArt', 'WalkingTour', 'CBD', 'Murals', 'ArtScene'],
        location: { description: 'Auckland CBD', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 1350,
        like_count: 123,
        comment_count: 29,
        share_count: 17,
        is_active: true,
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '77777777-7777-7777-7777-777777777702',
        author_id: '77777777-7777-7777-7777-777777777777',
        content: 'Wine tasting at Waiheke Island was perfect! The Pinot Noir from this boutique vineyard is exceptional. The views of the harbor are breathtaking. Perfect day trip from the city! 🍷🏝️',
        images: [
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop'
        ],
        hashtags: ['WineTasting', 'WaihekeIsland', 'PinotNoir', 'Vineyard', 'DayTrip'],
        location: { description: 'Waiheke Island, Auckland', coordinates: { lat: -36.8085, lng: 175.1033 } },
        view_count: 2400,
        like_count: 189,
        comment_count: 47,
        share_count: 31,
        is_active: true,
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '88888888-8888-8888-8888-888888888802',
        author_id: '88888888-8888-8888-8888-888888888888',
        content: 'Skydiving over the city was absolutely incredible! The adrenaline rush and the views were unforgettable. The instructors were professional and made me feel safe. Bucket list item checked off! 🪂🏙️',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop'
        ],
        hashtags: ['Skydiving', 'Adventure', 'BucketList', 'Adrenaline', 'CityViews'],
        location: { description: 'Parakai, Auckland', coordinates: { lat: -36.6585, lng: 174.4233 } },
        view_count: 3800,
        like_count: 267,
        comment_count: 73,
        share_count: 49,
        is_active: true,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '11111111-1111-1111-1111-111111111103',
        author_id: '11111111-1111-1111-1111-111111111111',
        content: 'Book club meeting at the local library was wonderful! We discussed "The Seven Husbands of Evelyn Hugo" and the conversation was so engaging. Great way to meet like-minded people and discover new books! 📚💭',
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
        ],
        hashtags: ['BookClub', 'Library', 'Reading', 'Community', 'Discussion'],
        location: { description: 'Central Library, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 980,
        like_count: 87,
        comment_count: 21,
        share_count: 12,
        is_active: true,
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        author_id: '22222222-2222-2222-2222-222222222222',
        content: 'Rock climbing at the indoor gym was challenging but fun! The routes are well-designed and the staff are super helpful. Great workout for both body and mind. Can\'t wait to try outdoor climbing next! 🧗‍♀️💪',
        images: [
          'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
        ],
        hashtags: ['RockClimbing', 'IndoorGym', 'Challenge', 'Workout', 'Adventure'],
        location: { description: 'Mt Eden, Auckland', coordinates: { lat: -36.8785, lng: 174.7633 } },
        view_count: 1750,
        like_count: 145,
        comment_count: 35,
        share_count: 19,
        is_active: true,
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333303',
        author_id: '33333333-3333-3333-3333-333333333333',
        content: 'Food truck festival was a culinary adventure! Tried Korean BBQ tacos, authentic Thai curry, and the best gelato in town. The variety and quality were impressive. Food truck culture is thriving here! 🚚🍽️',
        images: [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop'
        ],
        hashtags: ['FoodTruck', 'Festival', 'KoreanBBQ', 'ThaiCurry', 'Gelato'],
        location: { description: 'Viaduct Harbour, Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
        view_count: 2900,
        like_count: 223,
        comment_count: 58,
        share_count: 34,
        is_active: true,
        created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444403',
        author_id: '44444444-4444-4444-4444-444444444444',
        content: 'Beach cleanup volunteer event was so rewarding! Collected 50+ bags of rubbish and met amazing people who care about our environment. Every small action makes a difference. Let\'s keep our beaches clean! 🏖️♻️',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop'
        ],
        hashtags: ['BeachCleanup', 'Volunteer', 'Environment', 'Community', 'Sustainability'],
        location: { description: 'Takapuna Beach, Auckland', coordinates: { lat: -36.7885, lng: 174.7633 } },
        view_count: 1650,
        like_count: 198,
        comment_count: 52,
        share_count: 38,
        is_active: true,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: insertedPosts, error: postError } = await (typedSupabase as any)
      .from('trending_posts')
      .upsert(posts, { onConflict: 'id' })
      .select();

    if (postError) {
      console.error('帖子创建失败:', postError);
      return NextResponse.json(
        { 
          success: false, 
          message: '帖子创建失败', 
          error: postError.message 
        },
        { status: 500 }
      );
    }

    console.log(`成功创建/更新 ${insertedPosts?.length || 0} 个帖子`);

    // 3. 创建点赞记录
    const likes = [
      // post-001 点赞
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: '11111111-1111-1111-1111-111111111101' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: '11111111-1111-1111-1111-111111111101' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: '11111111-1111-1111-1111-111111111101' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: '11111111-1111-1111-1111-111111111101' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: '11111111-1111-1111-1111-111111111101' },
      
      // post-002 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: '22222222-2222-2222-2222-222222222201' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: '22222222-2222-2222-2222-222222222201' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: '22222222-2222-2222-2222-222222222201' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: '22222222-2222-2222-2222-222222222201' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: '22222222-2222-2222-2222-222222222201' },
      
      // post-003 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: '33333333-3333-3333-3333-333333333301' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: '33333333-3333-3333-3333-333333333301' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: '33333333-3333-3333-3333-333333333301' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: '33333333-3333-3333-3333-333333333301' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: '33333333-3333-3333-3333-333333333301' },
      
      // post-004 点赞
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: '44444444-4444-4444-4444-444444444401' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: '44444444-4444-4444-4444-444444444401' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: '44444444-4444-4444-4444-444444444401' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: '44444444-4444-4444-4444-444444444401' },
      
      // post-005 点赞
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: '55555555-5555-5555-5555-555555555501' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: '55555555-5555-5555-5555-555555555501' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: '55555555-5555-5555-5555-555555555501' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: '55555555-5555-5555-5555-555555555501' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: '55555555-5555-5555-5555-555555555501' }
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
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: '11111111-1111-1111-1111-111111111101', share_type: 'native', platform: 'app' },
      { user_id: '33333333-3333-3333-3333-333333333333', post_id: '11111111-1111-1111-1111-111111111101', share_type: 'native', platform: 'app' },
      { user_id: '44444444-4444-4444-4444-444444444444', post_id: '22222222-2222-2222-2222-222222222201', share_type: 'native', platform: 'app' },
      { user_id: '55555555-5555-5555-5555-555555555555', post_id: '22222222-2222-2222-2222-222222222201', share_type: 'native', platform: 'app' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: '33333333-3333-3333-3333-333333333301', share_type: 'native', platform: 'app' },
      { user_id: '66666666-6666-6666-6666-666666666666', post_id: '33333333-3333-3333-3333-333333333301', share_type: 'native', platform: 'app' },
      { user_id: '77777777-7777-7777-7777-777777777777', post_id: '44444444-4444-4444-4444-444444444401', share_type: 'native', platform: 'app' },
      { user_id: '88888888-8888-8888-8888-888888888888', post_id: '44444444-4444-4444-4444-444444444401', share_type: 'native', platform: 'app' },
      { user_id: '11111111-1111-1111-1111-111111111111', post_id: '55555555-5555-5555-5555-555555555501', share_type: 'native', platform: 'app' },
      { user_id: '22222222-2222-2222-2222-222222222222', post_id: '55555555-5555-5555-5555-555555555501', share_type: 'native', platform: 'app' }
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
        message: '生成trending测试数据时出错', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}