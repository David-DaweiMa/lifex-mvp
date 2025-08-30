-- Verification Query for Database Migration Step 2
-- Run this to confirm all changes were applied successfully

-- 1. Check if new columns were added to user_profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('verification_status', 'subscription_level', 'has_business_features')
ORDER BY column_name;

-- 2. Check if new columns were added to businesses
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('verification_status', 'business_type', 'business_license', 'tax_id')
ORDER BY column_name;

-- 3. Check if new tables were created
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name IN ('product_quota_tracking', 'business_verification_requests', 'assistant_usage')
ORDER BY table_name;

-- 4. Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('product_quota_tracking', 'business_verification_requests')
ORDER BY table_name, ordinal_position;

-- 5. Check if indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('user_profiles', 'businesses', 'product_quota_tracking', 'business_verification_requests')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('product_quota_tracking', 'business_verification_requests')
ORDER BY tablename, policyname;

-- 7. Check if quota tracking data was initialized
SELECT 
    'product_quota_tracking' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT quota_type) as quota_types
FROM product_quota_tracking
UNION ALL
SELECT 
    'assistant_usage' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT assistant_type) as assistant_types
FROM assistant_usage;

-- 8. Check user profile data
SELECT 
    subscription_level,
    has_business_features,
    verification_status,
    COUNT(*) as user_count
FROM user_profiles 
GROUP BY subscription_level, has_business_features, verification_status
ORDER BY subscription_level, has_business_features, verification_status;

-- 9. Summary
SELECT 
    'Migration Verification Summary' as check_type,
    'All checks completed' as status;
