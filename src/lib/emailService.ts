import { Resend } from 'resend';

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
  }

  /**
   * 发送邮件
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
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
   * 生成邮件确认模板
   */
  generateEmailConfirmationTemplate(
    username: string,
    confirmationToken: string,
    email: string,
    userType: string = 'free'
  ): EmailTemplate {
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${confirmationToken}`;
    
    console.log('生成确认邮件模板');
    console.log('确认URL:', confirmationUrl);
    console.log('用户类型:', userType);
    
    // 根据用户类型生成不同的配额信息
    const getQuotaInfo = (type: string) => {
      switch (type) {
        case 'free':
          return '20次AI聊天/天, 10次趋势分析/月, 2次广告/月';
        case 'customer':
          return '100次AI聊天/天, 50次趋势分析/月, 10次广告/月';
        case 'premium':
          return '500次AI聊天/天, 200次趋势分析/月, 50次广告/月';
        case 'free_business':
          return '20次AI聊天/天, 10次趋势分析/月, 2次广告/月, 20个产品, 2个店铺';
        case 'professional_business':
          return '100次AI聊天/天, 50次趋势分析/月, 10次广告/月, 50个产品, 3个店铺';
        case 'enterprise_business':
          return '500次AI聊天/天, 200次趋势分析/月, 50次广告/月, 200个产品, 10个店铺';
        default:
          return '20次AI聊天/天, 10次趋势分析/月, 2次广告/月';
      }
    };
    
    const quotaInfo = getQuotaInfo(userType);
    
    return {
      subject: '欢迎加入 LifeX - 请确认您的邮箱',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>确认您的 LifeX 账户</title>
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
              <h1>🎉 欢迎加入 LifeX</h1>
              <p>新西兰本地生活推荐平台</p>
            </div>
            <div class="content">
              <h2>您好 ${username}！</h2>
              <p>感谢您注册 LifeX 账户。为了确保您的账户安全，请点击下面的按钮确认您的邮箱地址：</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">确认邮箱地址</a>
              </div>
              
              <p>如果您无法点击按钮，请复制以下链接到浏览器地址栏：</p>
              <p style="word-break: break-all; color: #667eea;">${confirmationUrl}</p>
              
              <div class="quota-info">
                <h3>📊 您的账户配额</h3>
                <p><strong>用户类型：</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
                <p><strong>包含功能：</strong> ${quotaInfo}</p>
              </div>
              
              <p><strong>重要提示：</strong></p>
              <ul>
                <li>此链接将在 24 小时后失效</li>
                <li>如果您没有注册 LifeX 账户，请忽略此邮件</li>
                <li>确认邮箱后即可开始使用所有功能</li>
                <li>如有问题，请联系我们的支持团队</li>
              </ul>
              
              <p>确认邮箱后，您将可以：</p>
              <ul>
                <li>使用 AI 智能助手获取个性化推荐</li>
                <li>发现新西兰本地优质商家</li>
                <li>发布和分享本地生活内容</li>
                <li>享受专属优惠和活动</li>
                <li>管理您的商家账户（商家用户）</li>
              </ul>
            </div>
            <div class="footer">
              <p>此邮件由 LifeX 系统自动发送，请勿回复</p>
              <p>© 2024 LifeX. 保留所有权利。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
欢迎加入 LifeX！

您好 ${username}！

感谢您注册 LifeX 账户。为了确保您的账户安全，请确认您的邮箱地址。

请访问以下链接确认您的邮箱：
${confirmationUrl}

您的账户配额：
用户类型：${userType.charAt(0).toUpperCase() + userType.slice(1)}
包含功能：${quotaInfo}

此链接将在 24 小时后失效。

如果您没有注册 LifeX 账户，请忽略此邮件。

确认邮箱后，您将可以：
- 使用 AI 智能助手获取个性化推荐
- 发现新西兰本地优质商家
- 发布和分享本地生活内容
- 享受专属优惠和活动
- 管理您的商家账户（商家用户）

如有问题，请联系我们的支持团队。

© 2024 LifeX. 保留所有权利。
      `
    };
  }

  /**
   * 生成欢迎邮件模板
   */
  generateWelcomeTemplate(
    username: string,
    email: string,
    userType: string = 'free'
  ): EmailTemplate {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    console.log('生成欢迎邮件模板');
    console.log('应用URL:', appUrl);
    console.log('用户类型:', userType);
    
    // 根据用户类型生成不同的功能描述
    const getFeatureDescription = (type: string) => {
      switch (type) {
        case 'free':
          return '免费用户功能';
        case 'customer':
          return '付费用户功能 - 享受更多AI聊天和高级功能';
        case 'premium':
          return '高级用户功能 - 无限制使用所有功能';
        case 'free_business':
          return '免费商家功能 - 管理您的商家信息';
        case 'professional_business':
          return '专业商家功能 - 高级商家管理工具';
        case 'enterprise_business':
          return '企业商家功能 - 完整的企业级解决方案';
        default:
          return '免费用户功能';
      }
    };
    
    const featureDescription = getFeatureDescription(userType);
    
    return {
      subject: '🎉 欢迎来到 LifeX - 您的账户已激活！',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>欢迎来到 LifeX</title>
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
              <h1>🎉 欢迎来到 LifeX</h1>
              <p>您的账户已成功激活！</p>
            </div>
            <div class="content">
              <h2>恭喜您，${username}！</h2>
              <p>您的 LifeX 账户已成功激活，现在可以开始探索新西兰的精彩本地生活了！</p>
              
              <div class="user-type">
                <h3>👤 账户类型：${userType.charAt(0).toUpperCase() + userType.slice(1)}</h3>
                <p>${featureDescription}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${appUrl}" class="button">开始探索 LifeX</a>
              </div>
              
              <h3>🚀 立即体验这些功能：</h3>
              
              <div class="feature">
                <h4>🤖 AI 智能助手</h4>
                <p>与我们的 AI 助手对话，获取个性化推荐和建议</p>
              </div>
              
              <div class="feature">
                <h4>🏪 发现本地商家</h4>
                <p>探索新西兰各地的优质餐厅、咖啡店、服务提供商</p>
              </div>
              
              <div class="feature">
                <h4>📱 分享生活点滴</h4>
                <p>发布您的本地生活体验，与其他用户分享</p>
              </div>
              
              <div class="feature">
                <h4>🎯 个性化推荐</h4>
                <p>基于您的偏好获得量身定制的推荐</p>
              </div>
              
              ${userType.includes('business') ? `
              <div class="feature">
                <h4>🏢 商家管理</h4>
                <p>管理您的商家信息、产品和服务</p>
              </div>
              ` : ''}
              
              <h3>💡 快速开始指南：</h3>
              <ol>
                <li>完善您的个人资料</li>
                <li>设置您的偏好和兴趣</li>
                <li>开始与 AI 助手对话</li>
                <li>探索附近的商家</li>
                <li>分享您的体验</li>
                ${userType.includes('business') ? '<li>设置您的商家信息</li>' : ''}
              </ol>
              
              <p><strong>需要帮助？</strong></p>
              <p>我们的支持团队随时为您服务：</p>
              <ul>
                <li>📧 邮箱：support@lifex.co.nz</li>
                <li>💬 在线聊天：访问我们的网站</li>
              </ul>
            </div>
            <div class="footer">
              <p>感谢您选择 LifeX！</p>
              <p>© 2024 LifeX. 保留所有权利。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 欢迎来到 LifeX！

恭喜您，${username}！

您的 LifeX 账户已成功激活，现在可以开始探索新西兰的精彩本地生活了！

账户类型：${userType.charAt(0).toUpperCase() + userType.slice(1)}
${featureDescription}

立即开始体验：
${appUrl}

🚀 立即体验这些功能：

🤖 AI 智能助手
与我们的 AI 助手对话，获取个性化推荐和建议

🏪 发现本地商家
探索新西兰各地的优质餐厅、咖啡店、服务提供商

📱 分享生活点滴
发布您的本地生活体验，与其他用户分享

🎯 个性化推荐
基于您的偏好获得量身定制的推荐

${userType.includes('business') ? `
🏢 商家管理
管理您的商家信息、产品和服务
` : ''}

💡 快速开始指南：
1. 完善您的个人资料
2. 设置您的偏好和兴趣
3. 开始与 AI 助手对话
4. 探索附近的商家
5. 分享您的体验
${userType.includes('business') ? '6. 设置您的商家信息' : ''}

需要帮助？
我们的支持团队随时为您服务：
- 邮箱：support@lifex.co.nz
- 在线聊天：访问我们的网站

感谢您选择 LifeX！

© 2024 LifeX. 保留所有权利。
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
  ): Promise<{ success: boolean; error?: string }> {
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
  ): Promise<{ success: boolean; error?: string }> {
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
   * 发送邮件验证（新方法）
   */
  async sendEmailVerification(
    email: string,
    userId: string,
    userType: string = 'free'
  ): Promise<{ success: boolean; error?: string }> {
    console.log('=== 发送邮件验证 ===');
    console.log('邮箱:', email);
    console.log('用户ID:', userId);
    console.log('用户类型:', userType);
    
    // 从数据库获取用户名
    const username = email.split('@')[0]; // 临时使用邮箱前缀作为用户名
    
    // 生成确认token（这里需要从数据库获取）
    const confirmationToken = 'temp-token'; // 实际应该从数据库获取
    
    return await this.sendEmailConfirmation(email, username, confirmationToken, userType);
  }
}

// 导出单例实例
export const emailService = new EmailService();

// 导出便捷函数
export const sendEmailVerification = async (email: string, userId: string, userType: string = 'free') => {
  return await emailService.sendEmailVerification(email, userId, userType);
};
