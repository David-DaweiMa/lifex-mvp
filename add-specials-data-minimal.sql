-- 为specials表添加20条测试数据 - 最小化版本
-- 先检查businesses表结构，然后插入数据

-- 1. 检查businesses表结构
SELECT 'Businesses表结构:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'businesses'
ORDER BY ordinal_position;

-- 2. 检查现有商家数据
SELECT '现有商家数据:' as info;
SELECT id, name FROM public.businesses LIMIT 3;

-- 3. 获取一个现有的business_id，如果没有则使用默认值
WITH business_id AS (
  SELECT COALESCE(
    (SELECT id FROM public.businesses LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ) as id
)

-- 4. 插入20条specials数据
INSERT INTO public.specials (
  id,
  business_id,
  title,
  description,
  original_price,
  discount_price,
  discount_percent,
  category,
  location,
  distance,
  rating,
  review_count,
  image_url,
  valid_from,
  valid_until,
  is_verified,
  is_active,
  views,
  claimed,
  max_claims,
  tags,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM business_id),
  title,
  description,
  original_price,
  discount_price,
  discount_percent,
  category,
  location,
  distance,
  rating,
  review_count,
  image_url,
  CURRENT_DATE,
  valid_until,
  is_verified,
  true,
  views,
  claimed,
  max_claims,
  tags,
  NOW(),
  NOW()
FROM (
  VALUES 
    -- Food & Drink (8条)
    ('Free Appetizer with Any Main Course', 'Complimentary starter with your main dish order. Perfect for sharing!', 25.00, 25.00, 0, 'food', '45 Queen Street, Auckland', '0.5km', 4.7, 156, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', CURRENT_DATE + INTERVAL '15 days', true, 890, 45, 100, ARRAY['Appetizer', 'Free', 'Dining']),
    ('Happy Hour 50% Off Drinks', 'All cocktails, wine, and beer at half price during happy hour', 18.00, 9.00, 50, 'food', '78 Ponsonby Road, Auckland', '0.8km', 4.5, 203, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', CURRENT_DATE + INTERVAL '12 days', true, 1200, 78, 150, ARRAY['Happy Hour', 'Drinks', 'Cocktails']),
    ('Lunch Combo Special', 'Main course + side + drink for one low price', 22.00, 15.00, 32, 'food', '123 Karangahape Road, Auckland', '1.1km', 4.6, 189, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d', CURRENT_DATE + INTERVAL '18 days', true, 950, 67, 120, ARRAY['Lunch', 'Combo', 'Value']),
    ('Dessert Night 30% Off', 'All desserts and sweet treats at discounted prices', 12.00, 8.40, 30, 'food', '67 Dominion Road, Auckland', '1.3km', 4.8, 134, 'https://images.unsplash.com/photo-1551024506-0bccd828d307', CURRENT_DATE + INTERVAL '10 days', true, 680, 34, 80, ARRAY['Dessert', 'Sweet', 'Night']),
    ('Weekend Brunch Special', 'All-day breakfast and brunch items with free coffee', 28.00, 20.00, 29, 'food', '234 Ponsonby Road, Auckland', '0.2km', 4.7, 167, 'https://images.unsplash.com/photo-1551218808-94e220e084d2', CURRENT_DATE + INTERVAL '14 days', true, 1100, 89, 200, ARRAY['Brunch', 'Breakfast', 'Weekend']),
    ('Pizza Night Buy 1 Get 1', 'Get your second pizza free with any large pizza purchase', 24.00, 12.00, 50, 'food', '89 Symonds Street, Auckland', '0.9km', 4.4, 145, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', CURRENT_DATE + INTERVAL '16 days', true, 850, 56, 100, ARRAY['Pizza', 'BOGO', 'Italian']),
    ('Fresh Juice Bar 25% Off', 'All fresh juices, smoothies, and healthy drinks', 8.50, 6.38, 25, 'food', '156 High Street, Auckland', '0.6km', 4.6, 98, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b', CURRENT_DATE + INTERVAL '8 days', true, 520, 28, 60, ARRAY['Juice', 'Healthy', 'Fresh']),
    ('Seafood Special 40% Off', 'Fresh catch of the day with seasonal sides', 35.00, 21.00, 40, 'food', '201 K Road, Auckland', '0.7km', 4.8, 223, 'https://images.unsplash.com/photo-1559847844-5315695dadae', CURRENT_DATE + INTERVAL '20 days', true, 1350, 112, 180, ARRAY['Seafood', 'Fresh', 'Seasonal']),
    
    -- Fitness & Wellness (4条)
    ('Personal Training Package 20% Off', '5-session personal training package with nutrition consultation', 200.00, 160.00, 20, 'fitness', '34 Mount Eden Road, Auckland', '1.2km', 4.9, 89, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', CURRENT_DATE + INTERVAL '25 days', true, 650, 23, 50, ARRAY['Personal Training', 'Fitness', 'Nutrition']),
    ('Yoga Class Pass 30% Off', '10-class yoga pass valid for 3 months', 150.00, 105.00, 30, 'fitness', '78 Newmarket Road, Auckland', '1.5km', 4.7, 156, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', CURRENT_DATE + INTERVAL '22 days', true, 780, 45, 100, ARRAY['Yoga', 'Classes', 'Wellness']),
    ('Swimming Pool Access 25% Off', 'Monthly unlimited access to our heated pool', 80.00, 60.00, 25, 'fitness', '45 Great South Road, Auckland', '2.0km', 4.5, 134, 'https://images.unsplash.com/photo-1530549387789-4c1017266635', CURRENT_DATE + INTERVAL '30 days', true, 420, 18, 40, ARRAY['Swimming', 'Pool', 'Monthly']),
    ('Group Fitness Classes 35% Off', 'Unlimited group classes for one month', 120.00, 78.00, 35, 'fitness', '67 New North Road, Auckland', '1.8km', 4.6, 198, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', CURRENT_DATE + INTERVAL '28 days', true, 920, 67, 150, ARRAY['Group Classes', 'Fitness', 'Monthly']),
    
    -- Beauty & Wellness (3条)
    ('Facial Treatment 40% Off', 'Deep cleansing facial with hydrating mask', 85.00, 51.00, 40, 'beauty', '23 Parnell Road, Auckland', '0.9km', 4.8, 145, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef', CURRENT_DATE + INTERVAL '12 days', true, 680, 34, 80, ARRAY['Facial', 'Skincare', 'Treatment']),
    ('Hair Styling Package 30% Off', 'Cut, color, and style package with consultation', 180.00, 126.00, 30, 'beauty', '156 Queen Street, Auckland', '0.4km', 4.7, 167, 'https://images.unsplash.com/photo-1560066984-138dadb4c035', CURRENT_DATE + INTERVAL '15 days', true, 890, 56, 120, ARRAY['Hair', 'Styling', 'Package']),
    ('Spa Day Package 25% Off', 'Full day spa experience with massage and treatments', 250.00, 187.50, 25, 'beauty', '78 Remuera Road, Auckland', '1.8km', 4.9, 112, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef', CURRENT_DATE + INTERVAL '18 days', true, 750, 28, 60, ARRAY['Spa', 'Relaxation', 'Package']),
    
    -- Shopping (3条)
    ('Fashion Sale 50% Off', 'All clothing and accessories at half price', 120.00, 60.00, 50, 'shopping', '89 Sandringham Road, Auckland', '1.7km', 4.4, 189, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', CURRENT_DATE + INTERVAL '10 days', true, 1200, 89, 200, ARRAY['Fashion', 'Sale', 'Clothing']),
    ('Electronics Clearance 35% Off', 'Selected electronics and gadgets on clearance', 300.00, 195.00, 35, 'shopping', '123 Mount Albert Road, Auckland', '2.3km', 4.3, 156, 'https://images.unsplash.com/photo-1498049794561-7780e7231661', CURRENT_DATE + INTERVAL '14 days', true, 850, 45, 100, ARRAY['Electronics', 'Clearance', 'Gadgets']),
    ('Home Decor Special 30% Off', 'Beautiful home decorations and furniture pieces', 180.00, 126.00, 30, 'shopping', '201 Newmarket Road, Auckland', '1.6km', 4.6, 134, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', CURRENT_DATE + INTERVAL '16 days', true, 650, 34, 80, ARRAY['Home Decor', 'Furniture', 'Interior']),
    
    -- Services (2条)
    ('Car Detailing Service 40% Off', 'Complete car wash, wax, and interior cleaning', 120.00, 72.00, 40, 'services', '34 Parnell Rise, Auckland', '0.8km', 4.5, 98, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', CURRENT_DATE + INTERVAL '12 days', true, 520, 23, 50, ARRAY['Car Detailing', 'Cleaning', 'Service']),
    ('Photography Session 25% Off', 'Professional photo session with edited images', 200.00, 150.00, 25, 'services', '67 Dominion Road, Auckland', '1.4km', 4.8, 145, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a', CURRENT_DATE + INTERVAL '20 days', true, 780, 45, 100, ARRAY['Photography', 'Professional', 'Session'])
) AS new_specials(title, description, original_price, discount_price, discount_percent, category, location, distance, rating, review_count, image_url, valid_until, is_verified, views, claimed, max_claims, tags);

-- 5. 显示插入结果
SELECT 
  'Specials数据插入完成' as message,
  COUNT(*) as total_specials,
  COUNT(CASE WHEN category = 'food' THEN 1 END) as food_count,
  COUNT(CASE WHEN category = 'fitness' THEN 1 END) as fitness_count,
  COUNT(CASE WHEN category = 'beauty' THEN 1 END) as beauty_count,
  COUNT(CASE WHEN category = 'shopping' THEN 1 END) as shopping_count,
  COUNT(CASE WHEN category = 'services' THEN 1 END) as services_count
FROM public.specials;

