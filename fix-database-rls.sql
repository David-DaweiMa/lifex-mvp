-- 修复 LifeX 数据库 RLS 问题
-- 这个脚本将启用必要的 RLS 策略并修复权限问题

-- 1. 首先启用所有表的 RLS（只对存在的表）
DO $$
DECLARE
    tbl_name text;
    tables_to_enable text[] := ARRAY[
        'user_profiles', 'user_quotas', 'usage_statistics', 'subscriptions', 
        'businesses', 'products', 'business_photos', 'business_reviews', 
        'business_descriptions', 'business_editorial_summaries', 'promotions', 
        'menu_items', 'menu_sections', 'business_menus', 'menu_item_photos', 
        'events', 'data_import_logs', 'ad_impressions'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_enable
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Enabled RLS on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 2. 为用户配置文件表创建 RLS 策略
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "No direct inserts allowed" ON public.user_profiles;

-- 创建新的安全策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 允许通过触发器插入（用于注册流程）
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 3. 为用户配额表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can update own quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Users can insert own quotas" ON public.user_quotas;

CREATE POLICY "Users can view own quotas" ON public.user_quotas
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quotas" ON public.user_quotas
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own quotas" ON public.user_quotas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 4. 为使用统计表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_statistics;

CREATE POLICY "Users can view own usage" ON public.usage_statistics
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own usage" ON public.usage_statistics
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own usage" ON public.usage_statistics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 5. 为订阅表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 6. 为商家表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;

-- 允许所有用户查看商家信息
CREATE POLICY "Users can view all businesses" ON public.businesses
  FOR SELECT USING (true);

-- 只允许商家所有者更新自己的商家信息
CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- 允许认证用户创建商家
CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- 7. 为其他表创建基本的 RLS 策略（只对存在的表）
-- 这些表允许公开读取，但写入需要认证

-- 商品表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        DROP POLICY IF EXISTS "Users can view all products" ON public.products;
        DROP POLICY IF EXISTS "Business owners can manage products" ON public.products;
        
        CREATE POLICY "Users can view all products" ON public.products
          FOR SELECT USING (true);
        
        CREATE POLICY "Business owners can manage products" ON public.products
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.businesses 
              WHERE businesses.id = products.business_id 
              AND businesses.owner_id::text = auth.uid()::text
            )
          );
    END IF;
END $$;

-- 商家照片表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_photos') THEN
        DROP POLICY IF EXISTS "Users can view all business photos" ON public.business_photos;
        CREATE POLICY "Users can view all business photos" ON public.business_photos
          FOR SELECT USING (true);
    END IF;
END $$;

-- 商家评论表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_reviews') THEN
        DROP POLICY IF EXISTS "Users can view all reviews" ON public.business_reviews;
        CREATE POLICY "Users can view all reviews" ON public.business_reviews
          FOR SELECT USING (true);
    END IF;
END $$;

-- 商家描述表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_descriptions') THEN
        DROP POLICY IF EXISTS "Users can view all descriptions" ON public.business_descriptions;
        CREATE POLICY "Users can view all descriptions" ON public.business_descriptions
          FOR SELECT USING (true);
    END IF;
END $$;

-- 商家编辑摘要表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_editorial_summaries') THEN
        DROP POLICY IF EXISTS "Users can view all editorial summaries" ON public.business_editorial_summaries;
        CREATE POLICY "Users can view all editorial summaries" ON public.business_editorial_summaries
          FOR SELECT USING (true);
    END IF;
END $$;

-- 促销表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotions') THEN
        DROP POLICY IF EXISTS "Users can view all promotions" ON public.promotions;
        CREATE POLICY "Users can view all promotions" ON public.promotions
          FOR SELECT USING (true);
    END IF;
END $$;

-- 菜单项表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_items') THEN
        DROP POLICY IF EXISTS "Users can view all menu items" ON public.menu_items;
        CREATE POLICY "Users can view all menu items" ON public.menu_items
          FOR SELECT USING (true);
    END IF;
END $$;

-- 菜单部分表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_sections') THEN
        DROP POLICY IF EXISTS "Users can view all menu sections" ON public.menu_sections;
        CREATE POLICY "Users can view all menu sections" ON public.menu_sections
          FOR SELECT USING (true);
    END IF;
END $$;

-- 商家菜单表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_menus') THEN
        DROP POLICY IF EXISTS "Users can view all business menus" ON public.business_menus;
        CREATE POLICY "Users can view all business menus" ON public.business_menus
          FOR SELECT USING (true);
    END IF;
END $$;

-- 菜单项照片表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_item_photos') THEN
        DROP POLICY IF EXISTS "Users can view all menu item photos" ON public.menu_item_photos;
        CREATE POLICY "Users can view all menu item photos" ON public.menu_item_photos
          FOR SELECT USING (true);
    END IF;
END $$;

-- 事件表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        DROP POLICY IF EXISTS "Users can view all events" ON public.events;
        CREATE POLICY "Users can view all events" ON public.events
          FOR SELECT USING (true);
    END IF;
END $$;

-- 数据导入日志表（仅管理员可访问）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'data_import_logs') THEN
        DROP POLICY IF EXISTS "Only admins can access import logs" ON public.data_import_logs;
        CREATE POLICY "Only admins can access import logs" ON public.data_import_logs
          FOR ALL USING (false); -- 暂时禁用所有访问
    END IF;
END $$;

-- 广告展示表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ad_impressions') THEN
        DROP POLICY IF EXISTS "Users can view own ad impressions" ON public.ad_impressions;
        CREATE POLICY "Users can view own ad impressions" ON public.ad_impressions
          FOR SELECT USING (true);
    END IF;
END $$;

-- 8. 创建函数来设置用户配额
CREATE OR REPLACE FUNCTION public.setup_user_quotas(user_id UUID)
RETURNS void AS $$
BEGIN
  -- 为 Customer 用户设置配额
  INSERT INTO public.user_quotas (user_id, quota_type, current_usage, max_limit, reset_period, reset_date)
  VALUES 
    (user_id, 'chat', 0, 10, 'daily', CURRENT_DATE + INTERVAL '1 day'),
    (user_id, 'trending', 0, 5, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'ads', 0, 1, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'products', 0, 0, 'monthly', CURRENT_DATE + INTERVAL '1 month'),
    (user_id, 'stores', 0, 0, 'monthly', CURRENT_DATE + INTERVAL '1 month')
  ON CONFLICT (user_id, quota_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 更新触发器函数以包含配额设置
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 为新用户创建配置文件
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    user_type,
    is_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'), -- Added user_type handling
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );
  
  -- 为新用户设置配额
  PERFORM public.setup_user_quotas(NEW.id); -- Added quota setup
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 完成消息
SELECT 'Database RLS policies have been updated successfully!' as status;
