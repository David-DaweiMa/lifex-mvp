-- 生成Trending测试数据
-- 这个脚本将创建用户、trending帖子和相关数据

-- 1. 首先创建一些测试用户
INSERT INTO user_profiles (
  id,
  email,
  username,
  full_name,
  avatar_url,
  bio,
  location,
  subscription_level,
  has_business_features,
  verification_status,
  is_active,
  created_at
) VALUES 
-- 用户1: 咖啡爱好者
(
  '11111111-1111-1111-1111-111111111111',
  'coffee.lover@example.com',
  'coffee_lover',
  'Sarah Chen',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'Coffee enthusiast and Auckland local. Love discovering new cafes and sharing hidden gems! ☕️',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  'essential',
  false,
  'none',
  true,
  NOW() - INTERVAL '30 days'
),

-- 用户2: 健身达人
(
  '22222222-2222-2222-2222-222222222222',
  'fitness.guru@example.com',
  'fitness_guru',
  'Mike Johnson',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'Personal trainer and fitness enthusiast. Helping people achieve their health goals! 💪',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  'premium',
  true,
  'approved',
  true,
  NOW() - INTERVAL '25 days'
),

-- 用户3: 美食博主
(
  '33333333-3333-3333-3333-333333333333',
  'food.blogger@example.com',
  'food_blogger',
  'Emma Wilson',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'Food blogger and restaurant reviewer. Always on the hunt for the best eats in Auckland! 🍽️',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  'premium',
  true,
  'approved',
  true,
  NOW() - INTERVAL '20 days'
),

-- 用户4: 美容专家
(
  '44444444-4444-4444-4444-444444444444',
  'beauty.expert@example.com',
  'beauty_expert',
  'Lisa Park',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'Beauty therapist and skincare specialist. Sharing tips for healthy, glowing skin! ✨',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  'essential',
  false,
  'none',
  true,
  NOW() - INTERVAL '15 days'
),

-- 用户5: 科技爱好者
(
  '55555555-5555-5555-5555-555555555555',
  'tech.enthusiast@example.com',
  'tech_enthusiast',
  'David Kim',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'Tech enthusiast and early adopter. Love exploring new technologies and smart home solutions! 🤖',
  '{"city": "Auckland", "country": "New Zealand", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  'free',
  false,
  'none',
  true,
  NOW() - INTERVAL '10 days'
)

ON CONFLICT (id) DO NOTHING;

-- 2. 创建trending帖子
INSERT INTO trending_posts (
  id,
  author_id,
  content,
  images,
  hashtags,
  location,
  view_count,
  like_count,
  comment_count,
  share_count,
  is_active,
  created_at
) VALUES 

-- 帖子1: 咖啡推荐
(
  'post-001',
  '11111111-1111-1111-1111-111111111111',
  'Just discovered this amazing coffee shop in Ponsonby! The owner is Italian and makes incredible hand-drip coffee 🔥 Perfect window seat for people watching, and fast WiFi makes it ideal for work ✨ The flat white here is absolutely divine!',
  '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop"]',
  '["Coffee", "Ponsonby", "Italian", "Workspace", "FlatWhite"]',
  '{"description": "Ponsonby, Auckland", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  1250,
  89,
  23,
  12,
  true,
  NOW() - INTERVAL '2 hours'
),

-- 帖子2: 健身推荐
(
  'post-002',
  '22222222-2222-2222-2222-222222222222',
  'After trying 10 gyms, I found the perfect one! FitNZ is amazing - super patient trainers, new equipment, and they''re especially beginner-friendly 💯 No judgment for first-timers! The personal training sessions have been life-changing. Highly recommend!',
  '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop"]',
  '["Fitness", "BeginnerFriendly", "PersonalTraining", "WeightLoss", "Gym"]',
  '{"description": "Newton, Auckland", "coordinates": {"lat": -36.8585, "lng": 174.7533}}',
  980,
  156,
  45,
  28,
  true,
  NOW() - INTERVAL '5 hours'
),

-- 帖子3: 美食推荐
(
  'post-003',
  '33333333-3333-3333-3333-333333333333',
  'This eco-friendly salon is changing the game! All organic products, zero waste policy, and the most relaxing atmosphere. Finally found beauty treatments that align with my values 🌱 The facial was incredible and my skin has never looked better!',
  '["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop"]',
  '["EcoFriendly", "Sustainable", "Beauty", "Organic", "Facial"]',
  '{"description": "Newmarket, Auckland", "coordinates": {"lat": -36.8385, "lng": 174.7733}}',
  1456,
  203,
  67,
  34,
  true,
  NOW() - INTERVAL '1 day'
),

-- 帖子4: 美容推荐
(
  'post-004',
  '44444444-4444-4444-4444-444444444444',
  'Best haircut I''ve had in years! The stylist really listened to what I wanted and gave me exactly the look I was going for. The salon has such a welcoming atmosphere and the staff are so professional ✨ Booked my next appointment already!',
  '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop"]',
  '["Haircut", "Styling", "Professional", "Salon", "Beauty"]',
  '{"description": "Parnell, Auckland", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  756,
  98,
  19,
  8,
  true,
  NOW() - INTERVAL '3 days'
),

-- 帖子5: 科技推荐
(
  'post-005',
  '55555555-5555-5555-5555-555555555555',
  'Just set up my new smart home system and it''s incredible! Voice control for everything - lights, temperature, music. The installation was so easy and the app is super intuitive. Living in the future feels amazing! 🤖✨',
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&h=600&fit=crop"]',
  '["SmartHome", "Technology", "VoiceControl", "Automation", "Future"]',
  '{"description": "Auckland Central", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  892,
  134,
  31,
  15,
  true,
  NOW() - INTERVAL '6 hours'
),

-- 帖子6: 咖啡推荐2
(
  'post-006',
  '11111111-1111-1111-1111-111111111111',
  'Hidden gem alert! This tiny coffee cart in the CBD serves the most amazing cold brew. The barista is so passionate about coffee and always remembers my order. Perfect for a quick caffeine fix during lunch break! ☕️',
  '["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop"]',
  '["Coffee", "ColdBrew", "CBD", "HiddenGem", "LunchBreak"]',
  '{"description": "Auckland CBD", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  634,
  67,
  14,
  6,
  true,
  NOW() - INTERVAL '1 day'
),

-- 帖子7: 健身推荐2
(
  'post-007',
  '22222222-2222-2222-2222-222222222222',
  'Morning run along the waterfront is the best way to start the day! The path is well-maintained and the views are stunning. Saw so many other runners and cyclists - great community vibe! 🏃‍♂️🌅',
  '["https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"]',
  '["Running", "Waterfront", "Morning", "Community", "Exercise"]',
  '{"description": "Auckland Waterfront", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  1123,
  145,
  38,
  22,
  true,
  NOW() - INTERVAL '4 hours'
),

-- 帖子8: 美食推荐2
(
  'post-008',
  '33333333-3333-3333-3333-333333333333',
  'This new restaurant in Mt Eden is absolutely incredible! The chef is a master of fusion cuisine and every dish is a work of art. The wine pairing was perfect too. Definitely worth the wait for a table! 🍷🍽️',
  '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop"]',
  '["Restaurant", "Fusion", "MtEden", "Wine", "FineDining"]',
  '{"description": "Mt Eden, Auckland", "coordinates": {"lat": -36.8785, "lng": 174.7633}}',
  1678,
  234,
  56,
  41,
  true,
  NOW() - INTERVAL '2 days'
),

-- 帖子9: 美容推荐2
(
  'post-009',
  '44444444-4444-4444-4444-444444444444',
  'Tried this new skincare treatment and my skin is glowing! The therapist was so knowledgeable and explained everything step by step. The products they use are all natural and the results speak for themselves! ✨',
  '["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop"]',
  '["Skincare", "Natural", "Treatment", "Glowing", "Beauty"]',
  '{"description": "Ponsonby, Auckland", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  987,
  123,
  29,
  17,
  true,
  NOW() - INTERVAL '5 days'
),

-- 帖子10: 科技推荐2
(
  'post-010',
  '55555555-5555-5555-5555-555555555555',
  'This new app for tracking local events is a game changer! Found so many cool things happening in Auckland that I never knew about. The interface is clean and the notifications are perfectly timed. Highly recommend! 📱',
  '["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop"]',
  '["App", "Events", "Local", "Notifications", "Technology"]',
  '{"description": "Auckland", "coordinates": {"lat": -36.8485, "lng": 174.7633}}',
  756,
  89,
  21,
  11,
  true,
  NOW() - INTERVAL '3 days'
)

ON CONFLICT (id) DO NOTHING;

-- 3. 创建一些点赞记录
INSERT INTO post_likes (user_id, post_id, created_at) VALUES
-- 用户1的帖子被其他用户点赞
('22222222-2222-2222-2222-222222222222', 'post-001', NOW() - INTERVAL '1 hour'),
('33333333-3333-3333-3333-333333333333', 'post-001', NOW() - INTERVAL '30 minutes'),
('44444444-4444-4444-4444-444444444444', 'post-001', NOW() - INTERVAL '15 minutes'),

-- 用户2的帖子被其他用户点赞
('11111111-1111-1111-1111-111111111111', 'post-002', NOW() - INTERVAL '4 hours'),
('33333333-3333-3333-3333-333333333333', 'post-002', NOW() - INTERVAL '3 hours'),
('55555555-5555-5555-5555-555555555555', 'post-002', NOW() - INTERVAL '2 hours'),

-- 用户3的帖子被其他用户点赞
('11111111-1111-1111-1111-111111111111', 'post-003', NOW() - INTERVAL '20 hours'),
('22222222-2222-2222-2222-222222222222', 'post-003', NOW() - INTERVAL '18 hours'),
('44444444-4444-4444-4444-444444444444', 'post-003', NOW() - INTERVAL '16 hours'),

-- 用户4的帖子被其他用户点赞
('11111111-1111-1111-1111-111111111111', 'post-004', NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'post-004', NOW() - INTERVAL '1 day'),

-- 用户5的帖子被其他用户点赞
('22222222-2222-2222-2222-222222222222', 'post-005', NOW() - INTERVAL '5 hours'),
('44444444-4444-4444-4444-444444444444', 'post-005', NOW() - INTERVAL '4 hours')

ON CONFLICT (user_id, post_id) DO NOTHING;

-- 4. 创建一些分享记录
INSERT INTO post_shares (user_id, post_id, share_type, platform, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'post-001', 'native', 'app', NOW() - INTERVAL '1 hour'),
('33333333-3333-3333-3333-333333333333', 'post-002', 'native', 'app', NOW() - INTERVAL '3 hours'),
('44444444-4444-4444-4444-444444444444', 'post-003', 'native', 'app', NOW() - INTERVAL '1 day'),
('55555555-5555-5555-5555-555555555555', 'post-004', 'native', 'app', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'post-005', 'native', 'app', NOW() - INTERVAL '5 hours')

ON CONFLICT (user_id, post_id, share_type) DO NOTHING;

-- 5. 显示生成的数据统计
SELECT 
  'Trending Data Generation Summary' as summary,
  (SELECT COUNT(*) FROM user_profiles WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
  )) as users_created,
  (SELECT COUNT(*) FROM trending_posts WHERE id LIKE 'post-%') as posts_created,
  (SELECT COUNT(*) FROM post_likes) as likes_created,
  (SELECT COUNT(*) FROM post_shares) as shares_created;

