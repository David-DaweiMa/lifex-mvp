import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import notificationService, { NotificationData, NotificationSettings } from '../services/notificationService';

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isVisible, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadNotifications();
      loadSettings();
    }
  }, [isVisible]);

  const loadNotifications = async () => {
    try {
      const allNotifications = await notificationService.getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const notificationSettings = await notificationService.getNotificationSettings();
      setSettings(notificationSettings);
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('标记通知为已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      '删除通知',
      '确定要删除这条通知吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              await loadNotifications();
            } catch (error) {
              console.error('删除通知失败:', error);
            }
          },
        },
      ]
    );
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      '清除所有通知',
      '确定要清除所有通知吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAllNotifications();
              await loadNotifications();
            } catch (error) {
              console.error('清除所有通知失败:', error);
            }
          },
        },
      ]
    );
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      await notificationService.updateNotificationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('更新通知设置失败:', error);
    }
  };

  const handleQuietHoursChange = async (enabled: boolean, start?: string, end?: string) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        quietHours: {
          ...settings.quietHours,
          enabled,
          ...(start && { start }),
          ...(end && { end }),
        },
      };
      await notificationService.updateNotificationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('更新静音时间设置失败:', error);
    }
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'recommendation':
        return '🎯';
      default:
        return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>通知 ({notifications.length})</Text>
        <View style={styles.tabActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.actionButtonText}>全部已读</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearAllNotifications}
          >
            <Text style={styles.actionButtonText}>清除全部</Text>
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>暂无通知</Text>
          <Text style={styles.emptyDescription}>
            当有新消息时，会在这里显示
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification,
              ]}
              onPress={() => handleMarkAsRead(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </Text>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>通知设置</Text>
      
      {settings && (
        <>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>启用通知</Text>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => handleSettingChange('enabled', value)}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>推荐通知</Text>
            <Switch
              value={settings.recommendations}
              onValueChange={(value) => handleSettingChange('recommendations', value)}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>更新通知</Text>
            <Switch
              value={settings.updates}
              onValueChange={(value) => handleSettingChange('updates', value)}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>提醒通知</Text>
            <Switch
              value={settings.reminders}
              onValueChange={(value) => handleSettingChange('reminders', value)}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>静音时间</Text>
            <Switch
              value={settings.quietHours.enabled}
              onValueChange={(value) => handleQuietHoursChange(value)}
              disabled={!settings.enabled}
            />
          </View>

          {settings.quietHours.enabled && (
            <View style={styles.quietHoursSettings}>
              <View style={styles.timeSetting}>
                <Text style={styles.timeLabel}>开始时间</Text>
                <Text style={styles.timeValue}>{settings.quietHours.start}</Text>
              </View>
              <View style={styles.timeSetting}>
                <Text style={styles.timeLabel}>结束时间</Text>
                <Text style={styles.timeValue}>{settings.quietHours.end}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>通知中心</Text>
        </View>

        {/* 标签栏 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              通知
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              设置
            </Text>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          {activeTab === 'notifications' ? renderNotificationsTab() : renderSettingsTab()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#666',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  quietHoursSettings: {
    marginTop: 10,
    paddingLeft: 20,
  },
  timeSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

