-- =============================================
-- LifeX MVP 数据库函数集合
-- 解决 TypeScript 类型错误的安全方案
-- =============================================

-- 1. 用户配置文件相关函数
-- =============================================

-- 更新用户邮箱验证状态
CREATE OR REPLACE FUNCTION update_user_email_verification(
  user_id UUID,
  verified BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    email_verified = verified, 
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- 创建用户配置文件
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_data JSONB DEFAULT '{}'::JSONB
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result user_profiles;
BEGIN
  INSERT INTO user_profiles (
    id,
    email,
    username,
    full_name,
    subscription_level,
    has_business_features,
    business_name,
    email_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    COALESCE((user_data->>'username')::TEXT, NULL),
    COALESCE((user_data->>'full_name')::TEXT, NULL),
    COALESCE((user_data->>'subscription_level')::TEXT, 'free')::subscription_level,
    COALESCE((user_data->>'has_business_features')::BOOLEAN, FALSE),
    COALESCE((user_data->>'business_name')::TEXT, NULL),
    COALESCE((user_data->>'email_verified')::BOOLEAN, FALSE),
    COALESCE((user_data->>'is_active')::BOOLEAN, TRUE),
    NOW(),
    NOW()
  )
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 更新用户配置文件
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  profile_data JSONB
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result user_profiles;
BEGIN
  UPDATE user_profiles 
  SET 
    username = COALESCE((profile_data->>'username')::TEXT, username),
    full_name = COALESCE((profile_data->>'full_name')::TEXT, full_name),
    avatar_url = COALESCE((profile_data->>'avatar_url')::TEXT, avatar_url),
    phone = COALESCE((profile_data->>'phone')::TEXT, phone),
    bio = COALESCE((profile_data->>'bio')::TEXT, bio),
    website = COALESCE((profile_data->>'website')::TEXT, website),
    subscription_level = COALESCE((profile_data->>'subscription_level')::TEXT, subscription_level)::subscription_level,
    has_business_features = COALESCE((profile_data->>'has_business_features')::BOOLEAN, has_business_features),
    business_name = COALESCE((profile_data->>'business_name')::TEXT, business_name),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 2. 业务相关函数
-- =============================================

-- 创建业务记录
CREATE OR REPLACE FUNCTION create_business(
  owner_id UUID,
  business_data JSONB
)
RETURNS businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result businesses;
BEGIN
  INSERT INTO businesses (
    owner_id,
    name,
    description,
    category,
    contact_info,
    address,
    opening_hours,
    price_range,
    amenities,
    website,
    phone,
    email,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    external_id,
    google_maps_url,
    is_verified,
    is_active,
    rating,
    review_count,
    created_at,
    updated_at
  ) VALUES (
    owner_id,
    (business_data->>'name')::TEXT,
    (business_data->>'description')::TEXT,
    (business_data->>'category')::TEXT,
    (business_data->>'contact_info')::JSONB,
    (business_data->>'address')::JSONB,
    (business_data->>'opening_hours')::JSONB,
    (business_data->>'price_range')::TEXT,
    (business_data->>'amenities')::JSONB,
    (business_data->>'website')::TEXT,
    (business_data->>'phone')::TEXT,
    (business_data->>'email')::TEXT,
    (business_data->>'city')::TEXT,
    (business_data->>'country')::TEXT,
    (business_data->>'postal_code')::TEXT,
    (business_data->>'latitude')::NUMERIC,
    (business_data->>'longitude')::NUMERIC,
    (business_data->>'external_id')::TEXT,
    (business_data->>'google_maps_url')::TEXT,
    COALESCE((business_data->>'is_verified')::BOOLEAN, FALSE),
    COALESCE((business_data->>'is_active')::BOOLEAN, TRUE),
    COALESCE((business_data->>'rating')::NUMERIC, 0),
    COALESCE((business_data->>'review_count')::INTEGER, 0),
    NOW(),
    NOW()
  )
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 3. 趋势帖子相关函数
-- =============================================

-- 创建趋势帖子
CREATE OR REPLACE FUNCTION create_trending_post(
  author_id UUID,
  post_data JSONB
)
RETURNS trending_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result trending_posts;
BEGIN
  INSERT INTO trending_posts (
    author_id,
    business_id,
    content,
    images,
    videos,
    hashtags,
    location,
    is_sponsored,
    sponsor_info,
    view_count,
    like_count,
    comment_count,
    share_count,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    author_id,
    (post_data->>'business_id')::UUID,
    (post_data->>'content')::TEXT,
    (post_data->>'images')::TEXT[],
    (post_data->>'videos')::TEXT[],
    (post_data->>'hashtags')::TEXT[],
    (post_data->>'location')::JSONB,
    COALESCE((post_data->>'is_sponsored')::BOOLEAN, FALSE),
    (post_data->>'sponsor_info')::JSONB,
    COALESCE((post_data->>'view_count')::INTEGER, 0),
    COALESCE((post_data->>'like_count')::INTEGER, 0),
    COALESCE((post_data->>'comment_count')::INTEGER, 0),
    COALESCE((post_data->>'share_count')::INTEGER, 0),
    COALESCE((post_data->>'is_active')::BOOLEAN, TRUE),
    NOW(),
    NOW()
  )
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 点赞帖子
CREATE OR REPLACE FUNCTION like_post(
  user_id UUID,
  post_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 插入点赞记录
  INSERT INTO post_likes (user_id, post_id, created_at)
  VALUES (user_id, post_id, NOW())
  ON CONFLICT (user_id, post_id) DO NOTHING;
  
  -- 更新帖子点赞数
  UPDATE trending_posts 
  SET like_count = like_count + 1, updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- 分享帖子
CREATE OR REPLACE FUNCTION share_post(
  user_id UUID,
  post_id UUID,
  share_type TEXT DEFAULT 'native',
  platform TEXT DEFAULT 'app'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 插入分享记录
  INSERT INTO post_shares (user_id, post_id, share_type, platform, created_at)
  VALUES (user_id, post_id, share_type, platform, NOW());
  
  -- 更新帖子分享数
  UPDATE trending_posts 
  SET share_count = share_count + 1, updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- 4. 聊天消息相关函数
-- =============================================

-- 创建聊天消息
CREATE OR REPLACE FUNCTION create_chat_message(
  user_id UUID,
  session_id TEXT,
  message_type TEXT,
  content TEXT,
  metadata JSONB DEFAULT NULL,
  is_ad_integrated BOOLEAN DEFAULT FALSE,
  ad_info JSONB DEFAULT NULL
)
RETURNS chat_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result chat_messages;
BEGIN
  INSERT INTO chat_messages (
    user_id,
    session_id,
    message_type,
    content,
    metadata,
    is_ad_integrated,
    ad_info,
    created_at
  ) VALUES (
    user_id,
    session_id,
    message_type::message_type,
    content,
    metadata,
    is_ad_integrated,
    ad_info,
    NOW()
  )
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 5. 助手使用相关函数
-- =============================================

-- 记录助手使用
CREATE OR REPLACE FUNCTION record_assistant_usage(
  user_id UUID,
  assistant_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO assistant_usage (user_id, assistant_type, created_at)
  VALUES (user_id, assistant_type, NOW());
END;
$$;

-- 6. 匿名使用相关函数
-- =============================================

-- 记录匿名使用
CREATE OR REPLACE FUNCTION record_anonymous_usage(
  session_id TEXT,
  quota_type TEXT,
  usage_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO anonymous_usage (session_id, quota_type, usage_count, usage_date, created_at, updated_at)
  VALUES (session_id, quota_type, 1, usage_date, NOW(), NOW())
  ON CONFLICT (session_id, quota_type, usage_date) 
  DO UPDATE SET 
    usage_count = anonymous_usage.usage_count + 1,
    updated_at = NOW();
END;
$$;

-- 7. 广告相关函数
-- =============================================

-- 记录广告点击
CREATE OR REPLACE FUNCTION record_ad_click(
  ad_id UUID,
  user_id UUID,
  revenue NUMERIC DEFAULT 0.5
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ad_impressions 
  SET 
    is_clicked = TRUE,
    revenue = revenue,
    created_at = NOW()
  WHERE ad_id = ad_id AND user_id = user_id;
END;
$$;

-- 8. 业务描述相关函数
-- =============================================

-- 创建业务描述
CREATE OR REPLACE FUNCTION create_business_description(
  business_id UUID,
  description TEXT
)
RETURNS business_descriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result business_descriptions;
BEGIN
  INSERT INTO business_descriptions (business_id, description, created_at)
  VALUES (business_id, description, NOW())
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 创建业务菜单
CREATE OR REPLACE FUNCTION create_business_menu(
  business_id UUID,
  menu_data JSONB
)
RETURNS business_menus
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result business_menus;
BEGIN
  INSERT INTO business_menus (business_id, menu_data, created_at)
  VALUES (business_id, menu_data, NOW())
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 创建业务照片
CREATE OR REPLACE FUNCTION create_business_photo(
  business_id UUID,
  photo_url TEXT,
  caption TEXT DEFAULT NULL
)
RETURNS business_photos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result business_photos;
BEGIN
  INSERT INTO business_photos (business_id, photo_url, caption, created_at)
  VALUES (business_id, photo_url, caption, NOW())
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 创建业务评论
CREATE OR REPLACE FUNCTION create_business_review(
  business_id UUID,
  user_id UUID,
  rating INTEGER,
  comment TEXT DEFAULT NULL
)
RETURNS business_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result business_reviews;
BEGIN
  INSERT INTO business_reviews (business_id, user_id, rating, comment, created_at)
  VALUES (business_id, user_id, rating, comment, NOW())
  RETURNING * INTO result;
  
  -- 更新业务评分和评论数
  UPDATE businesses 
  SET 
    rating = (
      SELECT AVG(rating)::NUMERIC 
      FROM business_reviews 
      WHERE business_id = business_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM business_reviews 
      WHERE business_id = business_id
    ),
    updated_at = NOW()
  WHERE id = business_id;
  
  RETURN result;
END;
$$;

-- =============================================
-- 权限设置
-- =============================================

-- 为所有函数设置适当的权限
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- 使用说明
-- =============================================

/*
使用示例：

1. 更新用户邮箱验证状态：
   SELECT update_user_email_verification('user-uuid', true);

2. 创建用户配置文件：
   SELECT create_user_profile('user-uuid', 'user@example.com', '{"username": "testuser", "full_name": "Test User"}');

3. 创建业务记录：
   SELECT create_business('owner-uuid', '{"name": "Test Business", "category": "restaurant"}');

4. 创建趋势帖子：
   SELECT create_trending_post('author-uuid', '{"content": "Hello world!", "hashtags": ["test"]}');

5. 点赞帖子：
   SELECT like_post('user-uuid', 'post-uuid');

6. 记录助手使用：
   SELECT record_assistant_usage('user-uuid', 'coly');

7. 记录匿名使用：
   SELECT record_anonymous_usage('session-id', 'chat');

8. 创建聊天消息：
   SELECT create_chat_message('user-uuid', 'session-id', 'user', 'Hello AI!');
*/
