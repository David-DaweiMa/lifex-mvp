-- Database Migration Step 2: Business Verification and Product Quota Support
-- This script adds necessary fields for business verification and enhanced product management

-- Add verification_status to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));

-- Add business verification fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_verification_status ON businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id_created_at ON businesses(user_id, created_at);

-- Create product_quota_tracking table for detailed quota management
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

-- Add indexes for quota tracking
CREATE INDEX IF NOT EXISTS idx_product_quota_user_id ON product_quota_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_product_quota_period ON product_quota_tracking(quota_type, quota_period_start, quota_period_end);

-- Create business_verification_requests table for tracking verification submissions
CREATE TABLE IF NOT EXISTS business_verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('initial', 'upgrade', 'renewal')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    submitted_data JSONB NOT NULL,
    admin_notes TEXT,
    admin_id UUID REFERENCES user_profiles(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for verification requests
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON business_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON business_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON business_verification_requests(submitted_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_product_quota_updated_at 
    BEFORE UPDATE ON product_quota_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at 
    BEFORE UPDATE ON business_verification_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize quota tracking for new users
CREATE OR REPLACE FUNCTION initialize_user_quotas()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert daily quota tracking
    INSERT INTO product_quota_tracking (
        user_id, 
        quota_type, 
        quota_period_start, 
        quota_period_end, 
        limit_count
    ) VALUES (
        NEW.id,
        'daily',
        DATE_TRUNC('day', NOW()),
        DATE_TRUNC('day', NOW()) + INTERVAL '1 day',
        CASE 
            WHEN NEW.subscription_level = 'premium' THEN 50
            WHEN NEW.subscription_level = 'essential' THEN 10
            ELSE 5
        END
    );
    
    -- Insert monthly quota tracking
    INSERT INTO product_quota_tracking (
        user_id, 
        quota_type, 
        quota_period_start, 
        quota_period_end, 
        limit_count
    ) VALUES (
        NEW.id,
        'monthly',
        DATE_TRUNC('month', NOW()),
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
        CASE 
            WHEN NEW.subscription_level = 'premium' THEN 500
            WHEN NEW.subscription_level = 'essential' THEN 100
            ELSE 50
        END
    );
    
    -- Insert total quota tracking
    INSERT INTO product_quota_tracking (
        user_id, 
        quota_type, 
        quota_period_start, 
        quota_period_end, 
        limit_count
    ) VALUES (
        NEW.id,
        'total',
        '1970-01-01'::timestamp,
        '2099-12-31'::timestamp,
        CASE 
            WHEN NEW.subscription_level = 'premium' THEN 1000
            ELSE 100
        END
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to initialize quotas for new users
CREATE TRIGGER initialize_user_quotas_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION initialize_user_quotas();

-- Create function to update quota when business is created
CREATE OR REPLACE FUNCTION update_quota_on_business_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily quota
    UPDATE product_quota_tracking 
    SET current_count = current_count + 1
    WHERE user_id = NEW.user_id 
    AND quota_type = 'daily'
    AND quota_period_start <= NOW()
    AND quota_period_end > NOW();
    
    -- Update monthly quota
    UPDATE product_quota_tracking 
    SET current_count = current_count + 1
    WHERE user_id = NEW.user_id 
    AND quota_type = 'monthly'
    AND quota_period_start <= NOW()
    AND quota_period_end > NOW();
    
    -- Update total quota
    UPDATE product_quota_tracking 
    SET current_count = current_count + 1
    WHERE user_id = NEW.user_id 
    AND quota_type = 'total';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update quota when business is created
CREATE TRIGGER update_quota_on_business_creation_trigger
    AFTER INSERT ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_quota_on_business_creation();

-- Add RLS policies for new tables
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

-- Update existing user_profiles to initialize quotas (for existing users)
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
    SELECT user_id, COUNT(*) as count 
    FROM businesses 
    GROUP BY user_id
) business_count ON business_count.user_id = up.id
WHERE NOT EXISTS (
    SELECT 1 FROM product_quota_tracking pqt 
    WHERE pqt.user_id = up.id AND pqt.quota_type = 'total'
);

-- Display the updated schema
\d user_profiles;
\d businesses;
\d product_quota_tracking;
\d business_verification_requests;
