-- 为specials表添加20条测试数据 - 基于实际数据库架构
-- 根据 database-inspector.js 检查结果修正

-- 1. 检查现有商家数据
SELECT '现有商家数据:' as info;
SELECT id, name, verification_status, business_type FROM public.businesses LIMIT 5;

-- 2. 获取一个现有的business_id，如果没有则使用默认值
WITH business_id AS (
  SELECT COALESCE(
    (SELECT id FROM public.businesses LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ) as id
)

-- 3. 插入20条specials数据
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
  terms_conditions,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  business_id.id as business_id,
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
  terms_conditions,
  NOW() as created_at,
  NOW() as updated_at
FROM business_id,
(VALUES
  ('Early Bird Special', 'Get 20% off breakfast items before 9 AM', 15.00, 12.00, 20, 'food', 'Auckland Central', '0.5km', 4.5, 128, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', '2025-01-18'::date, '2025-01-25'::date, true, true, 0, 0, 50, '["breakfast", "discount", "early-bird"]', 'Valid for breakfast items only. Not combinable with other offers.'),
  ('Lunch Combo Deal', 'Main + drink + dessert for just $25', 35.00, 25.00, 29, 'food', 'Ponsonby', '1.2km', 4.3, 89, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', '2025-01-18'::date, '2025-01-23'::date, true, true, 0, 0, 30, '["lunch", "combo", "value"]', 'Available Monday to Friday 11:30 AM - 2:30 PM.'),
  ('Happy Hour Drinks', '50% off all cocktails 5-7 PM', 18.00, 9.00, 50, 'food', 'Britomart', '0.8km', 4.4, 156, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', '2025-01-18'::date, '2025-01-21'::date, true, true, 0, 0, 100, '["drinks", "happy-hour", "cocktails"]', 'Valid Monday to Friday 5:00 PM - 7:00 PM.'),
  ('Weekend Brunch', 'All-day brunch specials every weekend', 22.00, 18.00, 18, 'food', 'Newmarket', '2.1km', 4.6, 203, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', '2025-01-18'::date, '2025-01-28'::date, true, true, 0, 0, 40, '["brunch", "weekend", "family"]', 'Available Saturday and Sunday 9:00 AM - 3:00 PM.'),
  ('Student Discount', '15% off for students with valid ID', 20.00, 17.00, 15, 'food', 'Auckland University', '0.3km', 4.2, 67, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '2025-01-18'::date, '2025-02-17'::date, true, true, 0, 0, 200, '["student", "discount", "education"]', 'Valid student ID required. Not applicable to alcohol.'),
  ('Family Meal Deal', 'Feed the whole family for $45', 60.00, 45.00, 25, 'food', 'Mt Eden', '1.8km', 4.5, 134, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', '2025-01-18'::date, '2025-02-01'::date, true, true, 0, 0, 25, '["family", "meal", "value"]', 'Serves 4-6 people. Advance booking recommended.'),
  ('Date Night Special', 'Romantic dinner for two with wine', 80.00, 65.00, 19, 'food', 'Parnell', '2.5km', 4.7, 189, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', '2025-01-18'::date, '2025-01-24'::date, true, true, 0, 0, 20, '["date-night", "romantic", "wine"]', 'Available Thursday to Sunday. Reservation required.'),
  ('Takeaway Tuesday', '20% off all takeaway orders', 25.00, 20.00, 20, 'food', 'Grey Lynn', '1.5km', 4.1, 98, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', '2025-01-18'::date, '2025-01-20'::date, true, true, 0, 0, 75, '["takeaway", "tuesday", "convenience"]', 'Valid every Tuesday. Online orders only.'),
  ('Fresh Seafood Special', 'Daily catch at market price', 35.00, 28.00, 20, 'food', 'Auckland Fish Market', '0.1km', 4.3, 145, 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', '2025-01-18'::date, '2025-01-19'::date, true, true, 0, 0, 15, '["seafood", "fresh", "market"]', 'Subject to availability. Market price may vary.'),
  ('Coffee & Pastry Combo', 'Premium coffee with artisan pastry', 12.00, 9.00, 25, 'food', 'Amano', '0.2km', 4.6, 167, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', '2025-01-18'::date, '2025-01-22'::date, true, true, 0, 0, 60, '["coffee", "pastry", "artisan"]', 'Available all day. Pastry selection varies daily.'),
  ('Late Night Eats', 'Midnight snacks and comfort food', 18.00, 14.00, 22, 'food', 'K Road', '1.0km', 4.0, 76, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', '2025-01-18'::date, '2025-01-26'::date, true, true, 0, 0, 35, '["late-night", "snacks", "comfort"]', 'Available 10:00 PM - 2:00 AM.'),
  ('Healthy Bowl Special', 'Nutritious grain bowls with fresh ingredients', 16.00, 13.00, 19, 'food', 'Ponsonby Central', '0.7km', 4.4, 112, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', '2025-01-18'::date, '2025-01-30'::date, true, true, 0, 0, 45, '["healthy", "bowls", "nutrition"]', 'Vegan and gluten-free options available.'),
  ('Burger & Beer Deal', 'Gourmet burger with craft beer', 28.00, 22.00, 21, 'food', 'Britomart', '0.9km', 4.3, 143, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', '2025-01-18'::date, '2025-01-27'::date, true, true, 0, 0, 50, '["burger", "beer", "craft"]', 'Available after 5:00 PM. Must be 18+ for alcohol.'),
  ('Dessert Delight', 'Indulgent desserts with coffee', 14.00, 11.00, 21, 'food', 'Newmarket', '1.3km', 4.5, 89, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', '2025-01-18'::date, '2025-01-29'::date, true, true, 0, 0, 40, '["dessert", "coffee", "indulgent"]', 'Available 2:00 PM - 10:00 PM.'),
  ('Pizza Party Pack', 'Large pizza with sides for groups', 45.00, 35.00, 22, 'food', 'Mt Eden', '2.2km', 4.2, 156, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', '2025-01-18'::date, '2025-02-02'::date, true, true, 0, 0, 20, '["pizza", "party", "groups"]', 'Serves 6-8 people. 24-hour advance notice required.'),
  ('Sushi Roll Special', 'Fresh sushi rolls with miso soup', 20.00, 16.00, 20, 'food', 'Auckland Central', '0.4km', 4.6, 178, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', '2025-01-18'::date, '2025-01-25'::date, true, true, 0, 0, 30, '["sushi", "fresh", "japanese"]', 'Fresh daily. Available for lunch and dinner.'),
  ('Taco Tuesday', 'Authentic tacos with Mexican sides', 22.00, 18.00, 18, 'food', 'Parnell', '1.6km', 4.1, 94, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '2025-01-18'::date, '2025-01-21'::date, true, true, 0, 0, 55, '["tacos", "mexican", "authentic"]', 'Valid every Tuesday. Spice levels available.'),
  ('Wine & Cheese Night', 'Curated wine selection with artisan cheeses', 35.00, 28.00, 20, 'food', 'Grey Lynn', '1.9km', 4.7, 123, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', '2025-01-18'::date, '2025-01-31'::date, true, true, 0, 0, 25, '["wine", "cheese", "artisan"]', 'Available Friday and Saturday evenings. Must be 18+.'),
  ('Breakfast Burrito', 'Hearty breakfast burrito with coffee', 16.00, 13.00, 19, 'food', 'K Road', '0.6km', 4.0, 87, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', '2025-01-18'::date, '2025-01-23'::date, true, true, 0, 0, 65, '["breakfast", "burrito", "hearty"]', 'Available 7:00 AM - 11:00 AM.'),
  ('Smoothie Bowl Special', 'Acai and fruit smoothie bowls', 18.00, 14.00, 22, 'food', 'Ponsonby', '0.8km', 4.4, 109, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', '2025-01-18'::date, '2025-02-03'::date, true, true, 0, 0, 35, '["smoothie", "acai", "healthy"]', 'Available all day. Vegan and dairy-free options.')
) AS specials_data(title, description, original_price, discount_price, discount_percent, category, location, distance, rating, review_count, image_url, valid_from, valid_until, is_verified, is_active, views, claimed, max_claims, tags, terms_conditions);

-- 4. 显示插入结果
SELECT '插入结果:' as info;
SELECT COUNT(*) as total_specials FROM public.specials;
SELECT '最新插入的specials:' as info;
SELECT id, title, category, location, discount_percent, is_verified, is_active FROM public.specials ORDER BY created_at DESC LIMIT 5;
