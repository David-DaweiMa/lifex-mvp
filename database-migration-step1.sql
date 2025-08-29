-- Step 1: Database Migration for User Type Simplification
-- This script adds new fields to support the simplified subscription system

-- 1. Add new subscription fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_level TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS has_business_features BOOLEAN DEFAULT false;

-- 2. Create assistant usage tracking table
CREATE TABLE IF NOT EXISTS assistant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  assistant_type TEXT NOT NULL CHECK (assistant_type IN ('coly', 'max')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assistant_usage_user_type_time 
ON assistant_usage(user_id, assistant_type, created_at);

CREATE INDEX IF NOT EXISTS idx_assistant_usage_created_at 
ON assistant_usage(created_at);

-- 4. Add index for subscription level queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_level 
ON user_profiles(subscription_level);

CREATE INDEX IF NOT EXISTS idx_user_profiles_business_features 
ON user_profiles(has_business_features);

-- 5. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('subscription_level', 'has_business_features');

-- 6. Show table structure
\d assistant_usage;
