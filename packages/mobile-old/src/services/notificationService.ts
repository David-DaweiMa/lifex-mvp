import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'recommendation';
  timestamp: number;
  read: boolean;
  data?: any;
  action?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  recommendations: boolean;
  updates: boolean;
  reminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

class NotificationService {
  private notificationsKey = 'user_notifications';
  private settingsKey = 'notification_settings';
  private defaultSettings: NotificationSettings = {
    enabled: true,
    recommendations: true,
    updates: true,
    reminders: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  };

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // 确保设置存在
      const settings = await this.getNotificationSettings();
      if (!settings) {
        await this.saveNotificationSettings(this.defaultSettings);
      }
    } catch (error) {
      console.error('初始化通知服务失败:', error);
    }
  }

  /**
   * 发送本地通知
   */
  async sendLocalNotification(
    title: string,
    message: string,
    type: NotificationData['type'] = 'info',
    data?: any,
    action?: string
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        id: this.generateNotificationId(),
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
        data,
        action,
      };

      // 保存到本地存储
      await this.saveNotification(notification);

      // 检查是否在静音时间
      if (await this.isInQuietHours()) {
        console.log('当前在静音时间，跳过通知');
        return;
      }

      // 这里可以集成实际的推送通知库
      // 例如：PushNotification.localNotification(notification);
      console.log('发送本地通知:', notification);

      // 触发通知事件（用于UI更新）
      this.emitNotificationEvent(notification);
    } catch (error) {
      console.error('发送本地通知失败:', error);
    }
  }

  /**
   * 发送推荐通知
   */
  async sendRecommendationNotification(
    title: string,
    message: string,
    recommendationData: any
  ): Promise<void> {
    const settings = await this.getNotificationSettings();
    if (settings?.recommendations) {
      await this.sendLocalNotification(
        title,
        message,
        'recommendation',
        recommendationData,
        'view_recommendation'
      );
    }
  }

  /**
   * 发送更新通知
   */
  async sendUpdateNotification(title: string, message: string): Promise<void> {
    const settings = await this.getNotificationSettings();
    if (settings?.updates) {
      await this.sendLocalNotification(title, message, 'info', null, 'view_update');
    }
  }

  /**
   * 发送提醒通知
   */
  async sendReminderNotification(title: string, message: string, reminderData: any): Promise<void> {
    const settings = await this.getNotificationSettings();
    if (settings?.reminders) {
      await this.sendLocalNotification(title, message, 'warning', reminderData, 'view_reminder');
    }
  }

  /**
   * 获取所有通知
   */
  async getAllNotifications(): Promise<NotificationData[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(this.notificationsKey);
      if (notificationsJson) {
        const notifications: NotificationData[] = JSON.parse(notificationsJson);
        return notifications.sort((a, b) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('获取通知失败:', error);
      return [];
    }
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      return 0;
    }
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(this.notificationsKey, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('标记通知为已读失败:', error);
    }
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(this.notificationsKey, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
    }
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(this.notificationsKey, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  }

  /**
   * 清除所有通知
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.notificationsKey);
    } catch (error) {
      console.error('清除所有通知失败:', error);
    }
  }

  /**
   * 获取通知设置
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.settingsKey);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('获取通知设置失败:', error);
      return this.defaultSettings;
    }
  }

  /**
   * 保存通知设置
   */
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  /**
   * 更新通知设置
   */
  async updateNotificationSettings(updates: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getNotificationSettings();
      const updatedSettings = { ...currentSettings, ...updates };
      await this.saveNotificationSettings(updatedSettings);
    } catch (error) {
      console.error('更新通知设置失败:', error);
    }
  }

  /**
   * 检查是否在静音时间
   */
  private async isInQuietHours(): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.quietHours.enabled) {
        return false;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (startTime <= endTime) {
        // 同一天内
        return currentTime >= startTime && currentTime <= endTime;
      } else {
        // 跨天
        return currentTime >= startTime || currentTime <= endTime;
      }
    } catch (error) {
      console.error('检查静音时间失败:', error);
      return false;
    }
  }

  /**
   * 保存通知到本地存储
   */
  private async saveNotification(notification: NotificationData): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      notifications.unshift(notification);
      
      // 只保留最近100条通知
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      await AsyncStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('保存通知失败:', error);
    }
  }

  /**
   * 生成通知ID
   */
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 触发通知事件
   */
  private emitNotificationEvent(notification: NotificationData): void {
    // 这里可以集成事件系统
    // 例如：EventEmitter.emit('newNotification', notification);
    console.log('通知事件触发:', notification);
  }

  /**
   * 设置定时通知
   */
  async scheduleNotification(
    title: string,
    message: string,
    delayMs: number,
    data?: any
  ): Promise<string> {
    try {
      const notificationId = this.generateNotificationId();
      
      setTimeout(async () => {
        await this.sendLocalNotification(title, message, 'warning', data);
      }, delayMs);

      return notificationId;
    } catch (error) {
      console.error('设置定时通知失败:', error);
      throw error;
    }
  }

  /**
   * 取消定时通知
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    // 这里需要实现实际的取消逻辑
    console.log('取消定时通知:', notificationId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
