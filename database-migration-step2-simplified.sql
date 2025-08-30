-- Database Migration Step 2: Simplified Business Verification and Product Quota Support
-- This is a simplified version focusing on essential features

-- 1. Add verification_status to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));

-- 2. Add business verification fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_verification_status ON businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id_created_at ON businesses(owner_id, created_at);

-- 4. Create simplified product_quota_tracking table
CREATE TABLE IF NOT EXISTS product_quota_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL CHECK (quota_type IN ('daily', 'monthly', 'total')),
    quota_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    quota_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    current_count INTEGER DEFAULT 0,
    limit_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add indexes for quota tracking
CREATE INDEX IF NOT EXISTS idx_product_quota_user_id ON product_quota_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_product_quota_period ON product_quota_tracking(quota_type, quota_period_start, quota_period_end);

-- 6. Create simplified business_verification_requests table
CREATE TABLE IF NOT EXISTS business_verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('initial', 'upgrade', 'renewal')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    submitted_data JSONB NOT NULL,
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add indexes for verification requests
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON business_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON business_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON business_verification_requests(submitted_at);

-- 8. Add RLS policies for new tables
ALTER TABLE product_quota_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_quota_tracking
CREATE POLICY "Users can view their own quota tracking" ON product_quota_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage quota tracking" ON product_quota_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for business_verification_requests
CREATE POLICY "Users can view their own verification requests" ON business_verification_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON business_verification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage verification requests" ON business_verification_requests
    FOR ALL USING (auth.role() = 'service_role');

-- 9. Initialize quota tracking for existing users (simplified)
INSERT INTO product_quota_tracking (
    user_id, 
    quota_type, 
    quota_period_start, 
    quota_period_end, 
    current_count,
    limit_count
)
SELECT 
    up.id,
    'daily',
    DATE_TRUNC('day', NOW()),
    DATE_TRUNC('day', NOW()) + INTERVAL '1 day',
    0,
    CASE 
        WHEN up.subscription_level = 'premium' THEN 50
        WHEN up.subscription_level = 'essential' THEN 10
        ELSE 5
    END
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM product_quota_tracking pqt 
    WHERE pqt.user_id = up.id AND pqt.quota_type = 'daily'
);

INSERT INTO product_quota_tracking (
    user_id, 
    quota_type, 
    quota_period_start, 
    quota_period_end, 
    current_count,
    limit_count
)
SELECT 
    up.id,
    'monthly',
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    0,
    CASE 
        WHEN up.subscription_level = 'premium' THEN 500
        WHEN up.subscription_level = 'essential' THEN 100
        ELSE 50
    END
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM product_quota_tracking pqt 
    WHERE pqt.user_id = up.id AND pqt.quota_type = 'monthly'
);

INSERT INTO product_quota_tracking (
    user_id, 
    quota_type, 
    quota_period_start, 
    quota_period_end, 
    current_count,
    limit_count
)
SELECT 
    up.id,
    'total',
    '1970-01-01'::timestamp,
    '2099-12-31'::timestamp,
    COALESCE(business_count.count, 0),
    CASE 
        WHEN up.subscription_level = 'premium' THEN 1000
        ELSE 100
    END
FROM user_profiles up
LEFT JOIN (
    SELECT owner_id, COUNT(*) as count 
    FROM businesses 
    GROUP BY owner_id
) business_count ON business_count.owner_id = up.id
WHERE NOT EXISTS (
    SELECT 1 FROM product_quota_tracking pqt 
    WHERE pqt.user_id = up.id AND pqt.quota_type = 'total'
);

-- 10. Display the updated schema
SELECT 'Migration completed successfully' as status;
