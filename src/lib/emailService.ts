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
  private smtpTransporter: any = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'noreply@lifex.co.nz';
    
    // 初始化 Resend (推荐用于生产环境)
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    
    // 初始化 SMTP (备用方案) - 使用动态导入
    this.initSMTP();
  }

  private async initSMTP() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import('nodemailer');
        this.smtpTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (error) {
        console.warn('SMTP 初始化失败:', error);
      }
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      // 优先使用 Resend
      if (this.resend) {
        const { data, error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        if (error) {
          console.error('Resend email error:', error);
          throw new Error(error.message);
        }

        return { success: true };
      }

      // 备用 SMTP
      if (this.smtpTransporter) {
        await this.smtpTransporter.sendMail({
          from: this.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        return { success: true };
      }

      throw new Error('No email service configured');

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 生成邮件确认模板
   */
  generateEmailConfirmationTemplate(
    username: string,
    confirmationToken: string,
    email: string
  ): EmailTemplate {
    const confirmationUrl = `${process.env.EMAIL_CONFIRMATION_URL || 'http://localhost:3000/auth/confirm'}?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
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
              
              <p><strong>重要提示：</strong></p>
              <ul>
                <li>此链接将在 24 小时后失效</li>
                <li>如果您没有注册 LifeX 账户，请忽略此邮件</li>
                <li>如有问题，请联系我们的支持团队</li>
              </ul>
              
              <p>确认邮箱后，您将可以：</p>
              <ul>
                <li>使用 AI 智能助手获取个性化推荐</li>
                <li>发现新西兰本地优质商家</li>
                <li>发布和分享本地生活内容</li>
                <li>享受专属优惠和活动</li>
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

此链接将在 24 小时后失效。

如果您没有注册 LifeX 账户，请忽略此邮件。

确认邮箱后，您将可以：
- 使用 AI 智能助手获取个性化推荐
- 发现新西兰本地优质商家
- 发布和分享本地生活内容
- 享受专属优惠和活动

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
    email: string
  ): EmailTemplate {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
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
              
              <h3>💡 快速开始指南：</h3>
              <ol>
                <li>完善您的个人资料</li>
                <li>设置您的偏好和兴趣</li>
                <li>开始与 AI 助手对话</li>
                <li>探索附近的商家</li>
                <li>分享您的体验</li>
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

💡 快速开始指南：
1. 完善您的个人资料
2. 设置您的偏好和兴趣
3. 开始与 AI 助手对话
4. 探索附近的商家
5. 分享您的体验

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
    confirmationToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.generateEmailConfirmationTemplate(username, confirmationToken, email);
    
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
    username: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.generateWelcomeTemplate(username, email);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

// 导出单例实例
export const emailService = new EmailService();
