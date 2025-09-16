import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import notificationService from '../services/notificationService';

export default function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);

  const testNotification = async (type: string, title: string, message: string) => {
    setIsLoading(true);
    try {
      switch (type) {
        case 'info':
          await notificationService.sendLocalNotification(title, message, 'info');
          break;
        case 'success':
          await notificationService.sendLocalNotification(title, message, 'success');
          break;
        case 'warning':
          await notificationService.sendLocalNotification(title, message, 'warning');
          break;
        case 'error':
          await notificationService.sendLocalNotification(title, message, 'error');
          break;
        case 'recommendation':
          await notificationService.sendRecommendationNotification(title, message, { test: true });
          break;
        case 'update':
          await notificationService.sendUpdateNotification(title, message);
          break;
        case 'reminder':
          await notificationService.sendReminderNotification(title, message, { test: true });
          break;
        case 'scheduled':
          const notificationId = await notificationService.scheduleNotification(
            title,
            message,
            5000 // 5秒后发送
          );
          Alert.alert('定时通知已设置', `通知ID: ${notificationId}\n将在5秒后发送`);
          return;
        default:
          await notificationService.sendLocalNotification(title, message);
      }
      
      Alert.alert('成功', '通知已发送！');
    } catch (error) {
      console.error('发送通知失败:', error);
      Alert.alert('错误', '发送通知失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotifications = [
    {
      type: 'info',
      title: '信息通知',
      message: '这是一条普通信息通知，用于显示一般信息。',
      icon: 'ℹ️',
      color: '#2196F3',
    },
    {
      type: 'success',
      title: '成功通知',
      message: '操作已成功完成！这是一条成功通知。',
      icon: '✅',
      color: '#4CAF50',
    },
    {
      type: 'warning',
      title: '警告通知',
      message: '请注意，这是一个警告通知，需要您的关注。',
      icon: '⚠️',
      color: '#FF9800',
    },
    {
      type: 'error',
      title: '错误通知',
      message: '发生了一个错误，请检查并重试。',
      icon: '❌',
      color: '#F44336',
    },
    {
      type: 'recommendation',
      title: '推荐通知',
      message: '为您推荐了一些新内容，点击查看详情。',
      icon: '🎯',
      color: '#9C27B0',
    },
    {
      type: 'update',
      title: '更新通知',
      message: '应用已更新到最新版本，包含新功能和改进。',
      icon: '🔄',
      color: '#607D8B',
    },
    {
      type: 'reminder',
      title: '提醒通知',
      message: '别忘了完成今天的任务！这是一个提醒通知。',
      icon: '⏰',
      color: '#795548',
    },
    {
      type: 'scheduled',
      title: '定时通知',
      message: '这是一条定时通知，将在5秒后自动发送。',
      icon: '⏱️',
      color: '#E91E63',
    },
  ];

  const clearAllNotifications = async () => {
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
              Alert.alert('成功', '所有通知已清除');
            } catch (error) {
              console.error('清除通知失败:', error);
              Alert.alert('错误', '清除通知失败，请稍后重试');
            }
          },
        },
      ]
    );
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      Alert.alert('成功', '所有通知已标记为已读');
    } catch (error) {
      console.error('标记已读失败:', error);
      Alert.alert('错误', '标记已读失败，请稍后重试');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>LifeX MVP</Text>
          <Text style={styles.headerDescription}>查看重要通知和更新</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
            <Text style={styles.actionButtonText}>全部已读</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearAllNotifications}>
            <Text style={styles.actionButtonText}>清除全部</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>
        点击下面的按钮测试不同类型的通知。所有通知都会保存到通知中心。
      </Text>

      <ScrollView style={styles.notificationsContainer} showsVerticalScrollIndicator={false}>
        {testNotifications.map((notification, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.notificationCard, { borderLeftColor: notification.color }]}
            onPress={() => testNotification(notification.type, notification.title, notification.message)}
            disabled={isLoading}
          >
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationIcon}>{notification.icon}</Text>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationType}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: notification.color }]}>
                <Text style={styles.typeBadgeText}>
                  {notification.type.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            
            <View style={styles.notificationFooter}>
              <Text style={styles.testText}>点击测试</Text>
              {isLoading && <Text style={styles.loadingText}>发送中...</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          提示：发送通知后，可以在通知中心查看和管理所有通知
        </Text>
      </View>
    </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsContainer: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 15,
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
  notificationType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  typeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

