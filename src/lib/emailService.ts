import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private supabaseAdmin: any;

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lifex.co.nz';
    
    // 初始化 Resend
    if (process.env.RESEND_API_KEY) {
      try {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        console.log('✅ Resend 客户端初始化成功');
        console.log('发件人邮箱:', this.fromEmail);
      } catch (error) {
        console.error('❌ Resend 客户端初始化失败:', error);
        this.resend = null;
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY 未配置，邮件服务将不可用');
    }

    // 初始化专用的Supabase管理员客户端
    this.initializeSupabaseAdmin();
  }

  /**
   * 初始化Supabase管理员客户端
   */
  private initializeSupabaseAdmin() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Supabase配置缺失');
        console.error('URL存在:', !!supabaseUrl);
        console.error('Service Key存在:', !!supabaseServiceKey);
        return;
      }

      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      console.log('✅ Supabase管理员客户端初始化成功');
      console.log('Supabase URL:', supabaseUrl);
      console.log('Service Key前缀:', supabaseServiceKey.substring(0, 10) + '...');
    } catch (error) {
      console.error('❌ Supabase管理员客户端初始化失败:', error);
      this.supabaseAdmin = null;
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    try {
      console.log('=== 开始发送邮件 ===');
      console.log('收件人:', emailData.to);
      console.log('主题:', emailData.subject);
      console.log('发件人:', this.fromEmail);

      // 检查邮件服务是否可用
      if (!this.resend) {
        const error = '邮件服务未配置或初始化失败';
        console.error('❌', error);
        return { success: false, error };
      }

      // 检查必要的环境变量
      if (!process.env.RESEND_API_KEY) {
        const error = 'RESEND_API_KEY 未配置';
        console.error('❌', error);
        return { success: false, error };
      }

      if (!this.fromEmail) {
        const error = '发件人邮箱未配置';
        console.error('❌', error);
        return { success: false, error };
      }

      // 使用 Resend 发送邮件
      console.log('正在发送邮件...');
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      if (error) {
        console.error('❌ Resend 邮件发送失败:', error);
        
        // 处理频率限制错误
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { 
            success: false, 
            error: '邮件发送频率过高，请稍后再试。如果问题持续存在，请联系客服。',
            rateLimited: true
          };
        }
        
        return { success: false, error: error.message };
      }

      console.log('✅ 邮件发送成功');
      console.log('邮件ID:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ 邮件发送异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 带重试机制的Token保存
   */
  private async saveTokenToDatabase(
    userId: string,
    email: string,
    token: string,
    maxRetries: number = 3
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!this.supabaseAdmin) {
      return { success: false, error: 'Supabase管理员客户端未初始化' };
    }

    console.log('=== 保存Token到数据库 ===');
    console.log('用户ID:', userId);
    console.log('邮箱:', email);
    console.log('Token:', token);

    // 先验证用户是否存在
    console.log('步骤1: 验证用户存在性');
    try {
      const { data: userExists, error: userError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('id, email, email_verified')
        .eq('id', userId)
        .single();

      if (userError || !userExists) {
        console.error('❌ 用户验证失败:', userError);
        return { 
          success: false, 
          error: `用户不存在或查询失败: ${userError?.message || '用户不存在'}` 
        };
      }

      console.log('✅ 用户验证成功:', userExists);
    } catch (err) {
      console.error('❌ 用户验证异常:', err);
      return { success: false, error: '用户验证异常' };
    }

    // 清理旧的Token记录
    console.log('步骤2: 清理旧Token记录');
    try {
      const { error: deleteError } = await this.supabaseAdmin
        .from('email_confirmations')
        .delete()
        .eq('user_id', userId)
        .eq('token_type', 'email_verification');

      if (deleteError) {
        console.warn('⚠️ 清理旧Token失败，但继续执行:', deleteError.message);
      } else {
        console.log('✅ 旧Token记录已清理');
      }
    } catch (err) {
      console.warn('⚠️ 清理旧Token异常，但继续执行:', err);
    }

    // 使用重试机制保存新Token
    console.log('步骤3: 保存新Token');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Token保存尝试 ${attempt}/${maxRetries}`);

        const { data: saveData, error: saveError } = await this.supabaseAdmin
          .from('email_confirmations')
          .insert({
            user_id: userId,
            email: email,
            token: token,
            token_type: 'email_verification', // 🔧 修复：确保使用正确的token_type
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          })
          .select();

        if (saveError) {
          console.error(`❌ Token保存失败 (尝试 ${attempt}):`, {
            message: saveError.message,
            details: saveError.details,
            hint: saveError.hint,
            code: saveError.code
          });

          if (attempt >= maxRetries) {
            return { 
              success: false, 
              error: `Token保存失败 (已重试${maxRetries}次): ${saveError.message}` 
            };
          }

          // 等待后重试
          console.log(`等待 ${attempt * 1000}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }

        console.log('✅ Token保存成功:', saveData);
        
        // 验证Token是否真的保存了
        console.log('步骤4: 验证Token保存');
        const { data: verifyData, error: verifyError } = await this.supabaseAdmin
          .from('email_confirmations')
          .select('*')
          .eq('token', token)
          .single();

        if (verifyError || !verifyData) {
          console.error('❌ Token验证失败:', verifyError);
          if (attempt >= maxRetries) {
            return { success: false, error: 'Token保存验证失败' };
          }
          continue;
        }

        console.log('✅ Token验证成功:', verifyData);
        return { success: true, data: saveData };

      } catch (saveException) {
        console.error(`💥 Token保存异常 (尝试 ${attempt}):`, saveException);
        
        if (attempt >= maxRetries) {
          return { 
            success: false, 
            error: `Token保存异常: ${saveException instanceof Error ? saveException.message : '未知错误'}` 
          };
        }

        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    return { success: false, error: 'Token保存失败，所有重试都失败了' };
  }

  /**
   * Generate email confirmation template
   */
  generateEmailConfirmationTemplate(
    username: string,
    confirmationToken: string,
    email: string,
    userType: string = 'free'
  ): EmailTemplate {
    // 🔧 Point to confirmation route, will automatically redirect to result page
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('Generating confirmation email template');
    console.log('Confirmation URL:', confirmationUrl);
    console.log('User type:', userType);
    
    // Generate different quota information based on user type
    const getQuotaInfo = (type: string) => {
      switch (type) {
        case 'free':
          return '20 AI chats/day, 10 trend analysis/month, 2 ads/month';
        case 'customer':
          return '100 AI chats/day, 50 trend analysis/month, 10 ads/month';
        case 'premium':
          return '500 AI chats/day, 200 trend analysis/month, 50 ads/month';
        case 'free_business':
          return '20 AI chats/day, 10 trend analysis/month, 2 ads/month, 20 products, 2 stores';
        case 'professional_business':
          return '100 AI chats/day, 50 trend analysis/month, 10 ads/month, 50 products, 3 stores';
        case 'enterprise_business':
          return '500 AI chats/day, 200 trend analysis/month, 50 ads/month, 200 products, 10 stores';
        default:
          return '20 AI chats/day, 10 trend analysis/month, 2 ads/month';
      }
    };
    
    const quotaInfo = getQuotaInfo(userType);
    
    return {
      subject: 'Welcome to LifeX - Please Confirm Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your LifeX Account</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .quota-info { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to LifeX</h1>
              <p>New Zealand Local Life Recommendation Platform</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>Thank you for registering a LifeX account. To ensure your account security, please click the button below to confirm your email address:</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
              </div>
              
              <p>If you cannot click the button, please copy the following link to your browser address bar:</p>
              <p style="word-break: break-all; color: #667eea;">${confirmationUrl}</p>
              
              <div class="quota-info">
                <h3>📊 Your Account Quota</h3>
                <p><strong>User Type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
                <p><strong>Included Features:</strong> ${quotaInfo}</p>
              </div>
              
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>This link will expire in 24 hours</li>
                <li>If you did not register a LifeX account, please ignore this email</li>
                <li>After confirming your email, you can start using all features</li>
                <li>If you have any questions, please contact our support team</li>
              </ul>
              
              <p>After confirming your email, you will be able to:</p>
              <ul>
                <li>Use AI intelligent assistant for personalized recommendations</li>
                <li>Discover quality local businesses in New Zealand</li>
                <li>Post and share local life content</li>
                <li>Enjoy exclusive offers and events</li>
                <li>Manage your business account (business users)</li>
              </ul>
              
              <p><strong>⏰ Time Limit:</strong> This confirmation link will automatically expire in 24 hours. If the link expires, please register your account again.</p>
            </div>
            <div class="footer">
              <p>This email is automatically sent by the LifeX system, please do not reply</p>
              <p>© 2024 LifeX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to LifeX!

Hello ${username}!

Thank you for registering a LifeX account. To ensure your account security, please confirm your email address.

Please visit the following link to confirm your email:
${confirmationUrl}

Your Account Quota:
User Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
Included Features: ${quotaInfo}

This link will expire in 24 hours.

If you did not register a LifeX account, please ignore this email.

After confirming your email, you will be able to:
- Use AI intelligent assistant for personalized recommendations
- Discover quality local businesses in New Zealand
- Post and share local life content
- Enjoy exclusive offers and events
- Manage your business account (business users)

If you have any questions, please contact our support team.

© 2024 LifeX. All rights reserved.
      `
    };
  }

  /**
   * Generate welcome email template
   */
  generateWelcomeTemplate(
    username: string,
    email: string,
    userType: string = 'free'
  ): EmailTemplate {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    console.log('Generating welcome email template');
    console.log('App URL:', appUrl);
    console.log('User type:', userType);
    
    // Generate different feature descriptions based on user type
    const getFeatureDescription = (type: string) => {
      switch (type) {
        case 'free':
          return 'Free user features';
        case 'customer':
          return 'Paid user features - Enjoy more AI chats and advanced features';
        case 'premium':
          return 'Premium user features - Unlimited access to all features';
        case 'free_business':
          return 'Free business features - Manage your business information';
        case 'professional_business':
          return 'Professional business features - Advanced business management tools';
        case 'enterprise_business':
          return 'Enterprise business features - Complete enterprise-level solutions';
        default:
          return 'Free user features';
      }
    };
    
    const featureDescription = getFeatureDescription(userType);
    
    return {
      subject: '🎉 Welcome to LifeX - Your Account is Activated!',
              html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LifeX</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .user-type { background: #e8f4fd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to LifeX</h1>
              <p>Your account has been successfully activated!</p>
            </div>
            <div class="content">
              <h2>Congratulations, ${username}!</h2>
              <p>Your LifeX account has been successfully activated, and you can now start exploring the wonderful local life in New Zealand!</p>
              
              <div class="user-type">
                <h3>👤 Account Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}</h3>
                <p>${featureDescription}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${appUrl}" class="button">Start Exploring LifeX</a>
              </div>
              
              <h3>🚀 Experience these features now:</h3>
              
              <div class="feature">
                <h4>🤖 AI Intelligent Assistant</h4>
                <p>Chat with our AI assistant to get personalized recommendations and advice</p>
              </div>
              
              <div class="feature">
                <h4>🏪 Discover Local Businesses</h4>
                <p>Explore quality restaurants, cafes, and service providers across New Zealand</p>
              </div>
              
              <div class="feature">
                <h4>📱 Share Life Moments</h4>
                <p>Post your local life experiences and share with other users</p>
              </div>
              
              <div class="feature">
                <h4>🎯 Personalized Recommendations</h4>
                <p>Get tailored recommendations based on your preferences</p>
              </div>
              
              ${userType.includes('business') ? `
              <div class="feature">
                <h4>🏢 Business Management</h4>
                <p>Manage your business information, products, and services</p>
              </div>
              ` : ''}
              
              <h3>💡 Quick Start Guide:</h3>
              <ol>
                <li>Complete your profile</li>
                <li>Set your preferences and interests</li>
                <li>Start chatting with the AI assistant</li>
                <li>Explore nearby businesses</li>
                <li>Share your experiences</li>
                ${userType.includes('business') ? '<li>Set up your business information</li>' : ''}
              </ol>
              
              <p><strong>Need help?</strong></p>
              <p>Our support team is always here for you:</p>
              <ul>
                <li>📧 Email: support@lifex.co.nz</li>
                <li>💬 Online chat: Visit our website</li>
              </ul>
            </div>
            <div class="footer">
              <p>Thank you for choosing LifeX!</p>
              <p>© 2024 LifeX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 Welcome to LifeX!

Congratulations, ${username}!

Your LifeX account has been successfully activated, and you can now start exploring the wonderful local life in New Zealand!

Account Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
${featureDescription}

Start experiencing now:
${appUrl}

🚀 Experience these features now:

🤖 AI Intelligent Assistant
Chat with our AI assistant to get personalized recommendations and advice

🏪 Discover Local Businesses
Explore quality restaurants, cafes, and service providers across New Zealand

📱 Share Life Moments
Post your local life experiences and share with other users

🎯 Personalized Recommendations
Get tailored recommendations based on your preferences

${userType.includes('business') ? `
🏢 Business Management
Manage your business information, products, and services
` : ''}

💡 Quick Start Guide:
1. Complete your profile
2. Set your preferences and interests
3. Start chatting with the AI assistant
4. Explore nearby businesses
5. Share your experiences
${userType.includes('business') ? '6. Set up your business information' : ''}

Need help?
Our support team is always here for you:
- Email: support@lifex.co.nz
- Online chat: Visit our website

Thank you for choosing LifeX!

© 2024 LifeX. All rights reserved.
      `
    };
  }

  /**
   * 发送邮件确认
   */
  async sendEmailConfirmation(
    email: string,
    username: string,
    confirmationToken: string,
    userType: string = 'free'
  ): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    console.log('=== 发送邮件确认 ===');
    console.log('邮箱:', email);
    console.log('用户名:', username);
    console.log('确认Token:', confirmationToken);
    console.log('用户类型:', userType);
    
    const template = this.generateEmailConfirmationTemplate(username, confirmationToken, email, userType);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(
    email: string,
    username: string,
    userType: string = 'free'
  ): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    console.log('=== 发送欢迎邮件 ===');
    console.log('邮箱:', email);
    console.log('用户名:', username);
    console.log('用户类型:', userType);
    
    const template = this.generateWelcomeTemplate(username, email, userType);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * 发送邮件验证（完整版本）
   */
  async sendEmailVerification(
    email: string,
    userId: string,
    userType: string = 'free'
  ): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    console.log('=== 发送邮件验证 ===');
    console.log('邮箱:', email);
    console.log('用户ID:', userId);
    console.log('用户类型:', userType);
    
    try {
      // 验证输入参数
      if (!email || !userId) {
        console.error('❌ 参数验证失败');
        return { success: false, error: '邮箱和用户ID不能为空' };
      }

      // 验证环境配置
      if (!this.supabaseAdmin) {
        console.error('❌ Supabase管理员客户端未初始化');
        return { success: false, error: 'Supabase管理员客户端未初始化' };
      }

      if (!this.resend) {
        console.error('❌ Resend客户端未初始化');
        return { success: false, error: 'Resend客户端未初始化' };
      }

      // 生成新的确认token
      const confirmationToken = this.generateRandomToken();
      const username = email.split('@')[0]; // 使用邮箱前缀作为用户名
      
      console.log('生成新token:', confirmationToken);
      console.log('用户名:', username);
      
      // 保存token到数据库 - 使用新的重试机制
      const saveResult = await this.saveTokenToDatabase(userId, email, confirmationToken);
      
      if (!saveResult.success) {
        console.error('❌ Token保存失败:', saveResult.error);
        // 即使Token保存失败，也尝试发送邮件（临时方案）
        console.log('⚠️ Token保存失败，但继续发送邮件（用户可能需要重新注册）');
      } else {
        console.log('✅ Token已成功保存到数据库');
      }
      
      // 发送邮件 - 无论Token是否保存成功都发送
      console.log('📧 开始发送邮件...');
      const emailResult = await this.sendEmailConfirmation(email, username, confirmationToken, userType);
      
      if (!emailResult.success) {
        console.error('📧 邮件发送失败:', emailResult.error);
        return emailResult;
      }
      
      console.log('✅ 邮件发送成功');
      
      // 返回综合结果
      if (!saveResult.success) {
        return {
          success: false,
          error: `邮件已发送，但Token保存失败: ${saveResult.error}。请联系支持团队。`
        };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('💥 发送邮件验证异常:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '发送邮件失败' 
      };
    }
  }

  /**
   * 🔧 修复：数据库连接诊断功能
   */
  async diagnoseDatabaseConnection(): Promise<{
    success: boolean;
    results: Record<string, any>;
  }> {
    const results: Record<string, any> = {};
    
    try {
      console.log('=== 数据库连接诊断 ===');
      
      if (!this.supabaseAdmin) {
        return {
          success: false,
          results: { error: 'Supabase管理员客户端未初始化' }
        };
      }

      // 1. 🔧 修复：测试基本连接 - 使用正确的查询语法
      try {
        const { count, error: connectionError } = await this.supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        results.connection_test = {
          success: !connectionError,
          error: connectionError?.message,
          count: count
        };
      } catch (err) {
        results.connection_test = {
          success: false,
          error: err instanceof Error ? err.message : '连接测试异常'
        };
      }

      // 2. 测试email_confirmations表
      try {
        const { data: tableTest, error: tableError } = await this.supabaseAdmin
          .from('email_confirmations')
          .select('*')
          .limit(3);

        results.email_confirmations_test = {
          success: !tableError,
          error: tableError?.message,
          record_count: tableTest?.length || 0,
          sample_records: tableTest || []
        };
      } catch (err) {
        results.email_confirmations_test = {
          success: false,
          error: err instanceof Error ? err.message : '表测试异常'
        };
      }

      // 3. 🔧 修复：测试插入权限 - 使用真实的用户ID
      try {
        // 首先获取一个真实的用户ID
        const { data: realUser, error: userError } = await this.supabaseAdmin
          .from('user_profiles')
          .select('id')
          .limit(1)
          .single();

        if (!userError && realUser) {
          // 使用真实用户ID进行测试
          const testToken = 'diagnostic-test-' + Date.now();
          
          const { data: insertData, error: insertError } = await this.supabaseAdmin
            .from('email_confirmations')
            .insert({
              user_id: realUser.id,
              email: 'diagnostic@test.com',
              token: testToken,
              token_type: 'email_verification',
              expires_at: new Date(Date.now() + 60000).toISOString()
            })
            .select();

          results.insert_test = {
            success: !insertError,
            error: insertError?.message,
            data: insertData,
            used_real_user: true,
            user_id: realUser.id
          };

          // 清理测试数据
          if (!insertError) {
            await this.supabaseAdmin
              .from('email_confirmations')
              .delete()
              .eq('token', testToken);
            
            results.cleanup = { success: true, message: '测试数据已清理' };
          }
        } else {
          // 没有真实用户，跳过插入测试
          results.insert_test = {
            success: false,
            error: '没有找到真实用户进行测试，请先注册一个用户',
            skipped: true
          };
        }

      } catch (err) {
        results.insert_test = {
          success: false,
          error: err instanceof Error ? err.message : '插入测试异常'
        };
      }

      // 4. 🔧 新增：检查token_type约束
      try {
        const { data: constraintInfo, error: constraintError } = await this.supabaseAdmin
          .rpc('get_check_constraints', { table_name: 'email_confirmations' });

        results.constraint_check = {
          success: !constraintError,
          error: constraintError?.message,
          constraints: constraintInfo || []
        };
      } catch (err) {
        results.constraint_check = {
          success: false,
          error: 'Cannot check constraints: ' + (err instanceof Error ? err.message : '未知错误')
        };
      }

      return {
        success: true,
        results
      };

    } catch (error) {
      console.error('💥 诊断过程中发生错误:', error);
      return {
        success: false,
        results: {
          ...results,
          general_error: error instanceof Error ? error.message : '未知错误'
        }
      };
    }
  }

  /**
   * 生成随机token
   */
  private generateRandomToken(): string {
    // 使用更安全的token生成方式
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    
    // 降级方案
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 获取服务状态
   */
  getServiceStatus(): {
    resend: boolean;
    supabase: boolean;
    config: Record<string, boolean>;
  } {
    return {
      resend: !!this.resend,
      supabase: !!this.supabaseAdmin,
      config: {
        resend_api_key: !!process.env.RESEND_API_KEY,
        resend_from_email: !!process.env.RESEND_FROM_EMAIL,
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        app_url: !!process.env.NEXT_PUBLIC_APP_URL
      }
    };
  }
}

// 导出单例实例
export const emailService = new EmailService();

// 导出便捷函数
export const sendEmailVerification = async (
  email: string, 
  userId: string, 
  userType: string = 'free'
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> => {
  return await emailService.sendEmailVerification(email, userId, userType);
};

// 导出诊断函数
export const diagnoseDatabaseConnection = async (): Promise<{
  success: boolean;
  results: Record<string, any>;
}> => {
  return await emailService.diagnoseDatabaseConnection();
};

// 导出服务状态检查
export const getEmailServiceStatus = (): {
  resend: boolean;
  supabase: boolean;
  config: Record<string, boolean>;
} => {
  return emailService.getServiceStatus();
};