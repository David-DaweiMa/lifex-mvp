// src/lib/emailService.ts - Complete updated file with service provider support

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
            token_type: 'email_verification',
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
              <p>Thank you for registering a LifeX account. To start enjoying all our features, please confirm your email address by clicking the button below:</p>
              
              <div class="quota-info">
                <h3>🎯 Your Account Features</h3>
                <p><strong>Account Type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
                <p><strong>Features:</strong> ${quotaInfo}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, please copy and paste the following link into your browser:<br>
                <span style="word-break: break-all;">${confirmationUrl}</span>
              </p>
              
              <p style="font-size: 14px; color: #999;">
                This confirmation link will expire in 24 hours. If you did not register a LifeX account, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 LifeX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to LifeX!

Hello ${username},

Thank you for registering a LifeX account. Please confirm your email address by visiting the following link:

${confirmationUrl}

Your Account Features:
Account Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
Features: ${quotaInfo}

This confirmation link will expire in 24 hours.

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
   * 生成服务商专用的确认邮件模板
   */
  private generateServiceProviderEmailTemplate(
    username: string,
    email: string,
    confirmationToken: string,
    serviceCategory?: string
  ): { subject: string; html: string; text: string } {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/auth/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
    const serviceCategories: Record<string, string> = {
      restaurant: 'Restaurant & Dining',
      beauty: 'Beauty & Hair',
      wellness: 'Health & Wellness',
      home_service: 'Home Services',
      education: 'Education & Training',
      repair: 'Repair Services',
      other: 'Other Services'
    };

    const categoryName = serviceCategories[serviceCategory || 'other'] || 'Service';

    const subject = `Confirm Your LifeX Service Provider Account - ${categoryName} Provider`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LifeX Service Provider Account Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 30px 0; }
          .legal-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
          .next-steps { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          .legal-title { color: #856404; margin-top: 0; display: flex; align-items: center; }
          .legal-text { color: #856404; }
          .steps-title { color: #155724; margin-top: 0; }
          .steps-text { color: #155724; }
          .legal-list { color: #856404; padding-left: 20px; }
          .steps-list { color: #155724; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LifeX Service Providers</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #a855f7; margin-top: 0;">Hello, ${username}!</h2>
            <p>Thank you for choosing to become a <strong>${categoryName}</strong> service provider on the LifeX platform.</p>
            <p>To complete your registration, please click the link below to confirm your email address:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">
                Confirm Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, please copy and paste the following link into your browser:<br>
              <span style="word-break: break-all;">${confirmationUrl}</span>
            </p>
          </div>

          <div class="legal-notice">
            <h3 class="legal-title">
              ⚖️ Important: Service Provider Legal Obligations
            </h3>
            <p class="legal-text" style="margin-bottom: 10px;">As a service provider in New Zealand, you must comply with the Consumer Guarantees Act (CGA) requirements:</p>
            <ul class="legal-list">
              <li>Provide services with reasonable skill and care</li>
              <li>Ensure services are fit for their intended purpose</li>
              <li>Complete services within a reasonable timeframe</li>
              <li>Charge reasonable prices</li>
            </ul>
            <p class="legal-text" style="font-size: 14px;">
              For detailed information, please refer to our <a href="${baseUrl}/legal/service-provider-obligations" style="color: #856404;">Service Provider Obligations Guide</a>
            </p>
          </div>

          <div class="next-steps">
            <h3 class="steps-title">🎯 Next Steps</h3>
            <p class="steps-text">After confirming your email, you can:</p>
            <ul class="steps-list">
              <li>Complete your service provider profile</li>
              <li>Add service items and pricing</li>
              <li>Set business hours and contact information</li>
              <li>Start receiving customer bookings</li>
            </ul>
          </div>

          <div class="footer">
            <p>This email was sent automatically, please do not reply directly.<br>
            If you have any questions, please visit our <a href="${baseUrl}/support" style="color: #a855f7;">Help Center</a></p>
            <p style="font-size: 12px; margin-top: 10px;">
              © 2024 LifeX. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to LifeX Service Providers!

      Hello ${username},

      Thank you for choosing to become a ${categoryName} service provider on the LifeX platform.

      Please click the following link to confirm your email address:
      ${confirmationUrl}

      Important Notice: As a service provider in New Zealand, you must comply with the Consumer Guarantees Act (CGA) requirements:
      • Provide services with reasonable skill and care
      • Ensure services are fit for their intended purpose  
      • Complete services within a reasonable timeframe
      • Charge reasonable prices

      After confirming your email, you can complete your service provider profile and start receiving customer bookings.

      If you have any questions, please visit our Help Center: ${baseUrl}/support

      © 2024 LifeX. All rights reserved.
    `;

    return { subject, html, text };
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
   * 增强的邮件确认发送方法
   */
  async sendEmailConfirmation(
    email: string,
    username: string,
    confirmationToken: string,
    userType: string = 'customer',
    serviceCategory?: string
  ): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    console.log('=== 发送邮件确认 ===');
    console.log('邮箱:', email);
    console.log('用户名:', username);
    console.log('确认Token:', confirmationToken);
    console.log('用户类型:', userType);
    console.log('服务类别:', serviceCategory);
    
    // 判断是否为服务商类型
    const isServiceProvider = ['free_business', 'professional_business', 'enterprise_business'].includes(userType);
    
    let template;
    if (isServiceProvider) {
      // 使用服务商专用模板
      template = this.generateServiceProviderEmailTemplate(username, email, confirmationToken, serviceCategory);
    } else {
      // 使用普通用户模板
      template = this.generateEmailConfirmationTemplate(username, confirmationToken, email, userType);
    }

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
    userType: string = 'free',
    serviceCategory?: string
  ): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
    console.log('=== 发送邮件验证 ===');
    console.log('邮箱:', email);
    console.log('用户ID:', userId);
    console.log('用户类型:', userType);
    console.log('服务类别:', serviceCategory);
    
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
      const emailResult = await this.sendEmailConfirmation(
        email, 
        username, 
        confirmationToken, 
        userType,
        serviceCategory
      );
      
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
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 数据库连接诊断
   */
  async diagnoseDatabaseConnection(): Promise<{
    success: boolean;
    results: Record<string, any>;
  }> {
    console.log('=== 开始数据库连接诊断 ===');
    
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config_check: {},
      connection_test: {},
      table_access_test: {}
    };

    try {
      // 1. 配置检查
      console.log('步骤1: 配置检查');
      results.config_check = {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        resend_api_key: !!process.env.RESEND_API_KEY,
        resend_from_email: !!process.env.RESEND_FROM_EMAIL,
        app_url: !!process.env.NEXT_PUBLIC_APP_URL
      };

      if (!this.supabaseAdmin) {
        results.connection_test.error = 'Supabase管理员客户端未初始化';
        return {
          success: false,
          results
        };
      }

      // 2. 连接测试
      console.log('步骤2: 连接测试');
      try {
        const { data: connectionTest, error: connectionError } = await this.supabaseAdmin
          .from('user_profiles')
          .select('count')
          .limit(1);

        results.connection_test = {
          success: !connectionError,
          error: connectionError?.message
        };

        if (connectionError) {
          console.error('❌ 数据库连接失败:', connectionError);
        } else {
          console.log('✅ 数据库连接成功');
        }
      } catch (connErr) {
        console.error('❌ 连接测试异常:', connErr);
        results.connection_test = {
          success: false,
          error: connErr instanceof Error ? connErr.message : '连接测试异常'
        };
      }

      // 3. 表访问测试
      console.log('步骤3: 表访问测试');
      try {
        // 测试 user_profiles 表
        const { data: profilesData, error: profilesError } = await this.supabaseAdmin
          .from('user_profiles')
          .select('count')
          .limit(1);

        // 测试 email_confirmations 表
        const { data: confirmationsData, error: confirmationsError } = await this.supabaseAdmin
          .from('email_confirmations')
          .select('count')
          .limit(1);

        results.table_access_test = {
          user_profiles: {
            accessible: !profilesError,
            error: profilesError?.message
          },
          email_confirmations: {
            accessible: !confirmationsError,
            error: confirmationsError?.message
          }
        };

        console.log('表访问测试结果:', results.table_access_test);

      } catch (tableErr) {
        console.error('❌ 表访问测试异常:', tableErr);
        results.table_access_test.error = tableErr instanceof Error ? tableErr.message : '表访问测试异常';
      }

      // 4. 综合评估
      const hasConfigIssues = !Object.values(results.config_check).every(Boolean);
      const hasConnectionIssues = !results.connection_test.success;
      const hasTableAccessIssues = results.table_access_test.error || 
        !results.table_access_test.user_profiles?.accessible || 
        !results.table_access_test.email_confirmations?.accessible;

      results.summary = {
        overall_success: !hasConfigIssues && !hasConnectionIssues && !hasTableAccessIssues,
        issues: {
          config: hasConfigIssues,
          connection: hasConnectionIssues,
          table_access: hasTableAccessIssues
        }
      };

      console.log('=== 诊断完成 ===');
      console.log('总体状态:', results.summary.overall_success ? '成功' : '失败');

      return {
        success: results.summary.overall_success,
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

// 导出便捷函数 - 更新支持服务类别
export const sendEmailVerification = async (
  email: string, 
  userId: string, 
  userType: string = 'free',
  serviceCategory?: string
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> => {
  return await emailService.sendEmailVerification(email, userId, userType, serviceCategory);
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