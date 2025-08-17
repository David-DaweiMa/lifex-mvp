-- 禁用Supabase自动邮件发送的SQL脚本

-- 方法1: 禁用邮件确认功能
UPDATE auth.config 
SET email_confirmation_required = false 
WHERE id = 1;

-- 方法2: 禁用所有邮件模板
UPDATE auth.config 
SET 
  email_confirmation_required = false,
  enable_signup = true,
  enable_confirmations = false
WHERE id = 1;

-- 方法3: 检查当前配置
SELECT 
  email_confirmation_required,
  enable_signup,
  enable_confirmations
FROM auth.config 
WHERE id = 1;

-- 方法4: 如果上述方法不行，可以尝试删除邮件相关配置
-- 注意：这可能会影响其他功能，请谨慎使用
-- DELETE FROM auth.config WHERE email_confirmation_required = true;
