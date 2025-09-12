-- 为specials表添加20条测试数据 - 使用正确的businesses表结构
-- 基于实际的businesses表字段

-- 1. 检查现有商家数据
SELECT '现有商家数据:' as info;
SELECT id, name, business_type FROM public.businesses LIMIT 5;

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
  NOW() as created_at,
  NOW() as updated_at
FROM business_id,
(VALUES
  ('Early Bird Special', 'Get 20% off breakfast items before 9 AM', 15.00, 12.00, 20, 'Food & Dining', 'Auckland Central', 0.5, 4.5, 128, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', NOW(), NOW() + INTERVAL '7 days', true, true, 0, 0, 50, '["breakfast", "discount", "early-bird"]'),
  ('Lunch Combo Deal', 'Main + drink + dessert for just $25', 35.00, 25.00, 29, 'Food & Dining', 'Ponsonby', 1.2, 4.3, 89, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', NOW(), NOW() + INTERVAL '5 days', true, true, 0, 0, 30, '["lunch", "combo", "value"]'),
  ('Happy Hour Drinks', '50% off all cocktails 5-7 PM', 18.00, 9.00, 50, 'Food & Dining', 'Britomart', 0.8, 4.4, 156, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', NOW(), NOW() + INTERVAL '3 days', true, true, 0, 0, 100, '["drinks", "happy-hour", "cocktails"]'),
  ('Weekend Brunch', 'All-day brunch specials every weekend', 22.00, 18.00, 18, 'Food & Dining', 'Newmarket', 2.1, 4.6, 203, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', NOW(), NOW() + INTERVAL '10 days', true, true, 0, 0, 40, '["brunch", "weekend", "family"]'),
  ('Student Discount', '15% off for students with valid ID', 20.00, 17.00, 15, 'Food & Dining', 'Auckland University', 0.3, 4.2, 67, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', NOW(), NOW() + INTERVAL '30 days', true, true, 0, 0, 200, '["student", "discount", "education"]'),
  ('Family Meal Deal', 'Feed the whole family for $45', 60.00, 45.00, 25, 'Food & Dining', 'Mt Eden', 1.8, 4.5, 134, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', NOW(), NOW() + INTERVAL '14 days', true, true, 0, 0, 25, '["family", "meal", "value"]'),
  ('Date Night Special', 'Romantic dinner for two with wine', 80.00, 65.00, 19, 'Food & Dining', 'Parnell', 2.5, 4.7, 189, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', NOW(), NOW() + INTERVAL '6 days', true, true, 0, 0, 20, '["date-night", "romantic", "wine"]'),
  ('Takeaway Tuesday', '20% off all takeaway orders', 25.00, 20.00, 20, 'Food & Dining', 'Grey Lynn', 1.5, 4.1, 98, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', NOW(), NOW() + INTERVAL '2 days', true, true, 0, 0, 75, '["takeaway", "tuesday", "convenience"]'),
  ('Fresh Seafood Special', 'Daily catch at market price', 35.00, 28.00, 20, 'Food & Dining', 'Auckland Fish Market', 0.1, 4.3, 145, 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', NOW(), NOW() + INTERVAL '1 day', true, true, 0, 0, 15, '["seafood", "fresh", "market"]'),
  ('Coffee & Pastry Combo', 'Premium coffee with artisan pastry', 12.00, 9.00, 25, 'Food & Dining', 'Amano', 0.2, 4.6, 167, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', NOW(), NOW() + INTERVAL '4 days', true, true, 0, 0, 60, '["coffee", "pastry", "artisan"]'),
  ('Late Night Eats', 'Midnight snacks and comfort food', 18.00, 14.00, 22, 'Food & Dining', 'K Road', 1.0, 4.0, 76, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', NOW(), NOW() + INTERVAL '8 days', true, true, 0, 0, 35, '["late-night", "snacks", "comfort"]'),
  ('Healthy Bowl Special', 'Nutritious grain bowls with fresh ingredients', 16.00, 13.00, 19, 'Food & Dining', 'Ponsonby Central', 0.7, 4.4, 112, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', NOW(), NOW() + INTERVAL '12 days', true, true, 0, 0, 45, '["healthy", "bowls", "nutrition"]'),
  ('Burger & Beer Deal', 'Gourmet burger with craft beer', 28.00, 22.00, 21, 'Food & Dining', 'Britomart', 0.9, 4.3, 143, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', NOW(), NOW() + INTERVAL '9 days', true, true, 0, 0, 50, '["burger", "beer", "craft"]'),
  ('Dessert Delight', 'Indulgent desserts with coffee', 14.00, 11.00, 21, 'Food & Dining', 'Newmarket', 1.3, 4.5, 89, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', NOW(), NOW() + INTERVAL '11 days', true, true, 0, 0, 40, '["dessert", "coffee", "indulgent"]'),
  ('Pizza Party Pack', 'Large pizza with sides for groups', 45.00, 35.00, 22, 'Food & Dining', 'Mt Eden', 2.2, 4.2, 156, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', NOW(), NOW() + INTERVAL '15 days', true, true, 0, 0, 20, '["pizza", "party", "groups"]'),
  ('Sushi Roll Special', 'Fresh sushi rolls with miso soup', 20.00, 16.00, 20, 'Food & Dining', 'Auckland Central', 0.4, 4.6, 178, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', NOW(), NOW() + INTERVAL '7 days', true, true, 0, 0, 30, '["sushi", "fresh", "japanese"]'),
  ('Taco Tuesday', 'Authentic tacos with Mexican sides', 22.00, 18.00, 18, 'Food & Dining', 'Parnell', 1.6, 4.1, 94, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', NOW(), NOW() + INTERVAL '3 days', true, true, 0, 0, 55, '["tacos", "mexican", "authentic"]'),
  ('Wine & Cheese Night', 'Curated wine selection with artisan cheeses', 35.00, 28.00, 20, 'Food & Dining', 'Grey Lynn', 1.9, 4.7, 123, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', NOW(), NOW() + INTERVAL '13 days', true, true, 0, 0, 25, '["wine", "cheese", "artisan"]'),
  ('Breakfast Burrito', 'Hearty breakfast burrito with coffee', 16.00, 13.00, 19, 'Food & Dining', 'K Road', 0.6, 4.0, 87, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', NOW(), NOW() + INTERVAL '5 days', true, true, 0, 0, 65, '["breakfast", "burrito", "hearty"]'),
  ('Smoothie Bowl Special', 'Acai and fruit smoothie bowls', 18.00, 14.00, 22, 'Food & Dining', 'Ponsonby', 0.8, 4.4, 109, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', NOW(), NOW() + INTERVAL '16 days', true, true, 0, 0, 35, '["smoothie", "acai", "healthy"]')
) AS specials_data(title, description, original_price, discount_price, discount_percent, category, location, distance, rating, review_count, image_url, valid_from, valid_until, is_verified, is_active, views, claimed, max_claims, tags);

-- 4. 显示插入结果
SELECT '插入结果:' as info;
SELECT COUNT(*) as total_specials FROM public.specials;
SELECT '最新插入的specials:' as info;
SELECT id, title, category, location, discount_percent FROM public.specials ORDER BY created_at DESC LIMIT 5;
