import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { mobileAuthService } from '../services/authService';
import { mobileAIService } from '../services/aiService';
import AIChat from './AIChat';
import AIRecommendations from './AIRecommendations';
import AuthForm from './AuthForm';
import UserSettings from './UserSettings';
import NotificationCenter from './NotificationCenter';
import LocationPermission from './LocationPermission';
import NotificationTester from './NotificationTester';
import CameraFeatures from './CameraFeatures';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  subscription_level: string;
}

export default function MainScreen() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [aiStatus, setAiStatus] = useState<{ isAvailable: boolean; model: string }>({ isAvailable: false, model: 'unknown' });
  const [activeTab, setActiveTab] = useState<'home' | 'ai-chat' | 'recommendations' | 'profile' | 'notifications' | 'camera'>('home');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    checkUserSession();
    checkAIStatus();
    checkUnreadNotifications();
  }, []);

  const checkUserSession = async () => {
    try {
      const result = await mobileAuthService.checkSession();
      if (result.isAuthenticated && result.user) {
        setCurrentUser(result.user);
      }
    } catch (error) {
      console.log('检查会话失败:', error);
    }
  };

  const checkAIStatus = async () => {
    try {
      const status = await mobileAIService.checkAIStatus();
      setAiStatus({
        isAvailable: status.isAvailable,
        model: status.model,
      });
    } catch (error) {
      console.log('检查AI状态失败:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await mobileAuthService.logoutUser();
      if (result.success) {
        setCurrentUser(null);
        setActiveTab('home');
      }
    } catch (error) {
      console.error('退出失败:', error);
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setShowAuthForm(false);
    setActiveTab('home');
  };

  const handleCloseAuthForm = () => {
    setShowAuthForm(false);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  const handleCloseUserSettings = () => {
    setShowUserSettings(false);
  };

  const handleLocationPermissionGranted = () => {
    setShowLocationPermission(false);
    // 可以在这里刷新位置相关的数据
    console.log('位置权限已授予');
  };

  const handleShowLocationPermission = () => {
    setShowLocationPermission(true);
  };

  const checkUnreadNotifications = async () => {
    try {
      const notificationService = await import('../services/notificationService');
      const count = await notificationService.default.getUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.log('检查未读通知失败:', error);
    }
  };

  const renderHomeTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          {currentUser ? `欢迎回来，${currentUser.username || currentUser.email}!` : '欢迎使用 LifeX MVP!'}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          智能推荐 • AI助手 • 个性化服务
        </Text>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>AI 服务状态</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>状态:</Text>
            <Text style={[styles.statusValue, { color: aiStatus.isAvailable ? '#4CAF50' : '#F44336' }]}>
              {aiStatus.isAvailable ? '在线' : '离线'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>模型:</Text>
            <Text style={styles.statusValue}>{aiStatus.model}</Text>
          </View>
        </View>
      </View>

             <View style={styles.quickActionsSection}>
         <Text style={styles.sectionTitle}>快速操作</Text>
         <View style={styles.actionGrid}>
           <TouchableOpacity
             style={styles.actionButton}
             onPress={() => setActiveTab('ai-chat')}
           >
             <Text style={styles.actionButtonIcon}>💬</Text>
             <Text style={styles.actionButtonText}>AI 对话</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.actionButton}
             onPress={() => setActiveTab('recommendations')}
           >
             <Text style={styles.actionButtonIcon}>🎯</Text>
             <Text style={styles.actionButtonText}>智能推荐</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.actionButton}
             onPress={() => setActiveTab('profile')}
           >
             <Text style={styles.actionButtonIcon}>👤</Text>
             <Text style={styles.actionButtonText}>个人资料</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.actionButton}
             onPress={checkAIStatus}
           >
             <Text style={styles.actionButtonIcon}>🔄</Text>
             <Text style={styles.actionButtonText}>刷新状态</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.actionButton}
             onPress={handleShowLocationPermission}
           >
             <Text style={styles.actionButtonIcon}>📍</Text>
             <Text style={styles.actionButtonText}>位置权限</Text>
           </TouchableOpacity>
         </View>
       </View>

       

      {!currentUser && (
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>开始使用</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.authButtonText}>登录 / 注册</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {currentUser ? (
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>个人资料</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>用户名:</Text>
              <Text style={styles.profileValue}>{currentUser.username || '未设置'}</Text>
            </View>
            
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>邮箱:</Text>
              <Text style={styles.profileValue}>{currentUser.email}</Text>
            </View>
            
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>姓名:</Text>
              <Text style={styles.profileValue}>{currentUser.full_name || '未设置'}</Text>
            </View>
            
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>订阅等级:</Text>
              <Text style={styles.profileValue}>{currentUser.subscription_level}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowUserSettings(true)}
          >
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>退出登录</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>用户认证</Text>
          <Text style={styles.authDescription}>
            登录或注册以享受个性化服务和AI推荐
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => setShowAuthForm(true)}
          >
            <Text style={styles.authButtonText}>登录 / 注册</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'profile':
        return renderProfileTab();
      case 'ai-chat':
        return <AIChat />;
             case 'recommendations':
         return <AIRecommendations />;
       case 'notifications':
         return <NotificationTester />;
             case 'camera':
        return <CameraFeatures />;
      default:
        return renderHomeTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
              {/* 顶部导航栏 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LifeX MVP</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotificationCenter(true)}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {currentUser && (
              <TouchableOpacity
                style={styles.userAvatar}
                onPress={() => setActiveTab('profile')}
              >
                <Text style={styles.userAvatarText}>
                  {currentUser.username?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

      {/* 标签栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>首页</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ai-chat' && styles.activeTab]}
          onPress={() => setActiveTab('ai-chat')}
        >
          <Text style={[styles.tabText, activeTab === 'ai-chat' && styles.activeTabText]}>AI对话</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>推荐</Text>
        </TouchableOpacity>
        
                 <TouchableOpacity
           style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
           onPress={() => setActiveTab('profile')}
         >
           <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>我的</Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
           onPress={() => setActiveTab('notifications')}
         >
           <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>通知</Text>
         </TouchableOpacity>
         
                 <TouchableOpacity
          style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
          onPress={() => setActiveTab('camera')}
        >
          <Text style={[styles.tabText, activeTab === 'camera' && styles.activeTabText]}>相机</Text>
        </TouchableOpacity>
        

      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* 认证表单 */}
      {showAuthForm && (
        <AuthForm
          onAuthSuccess={handleAuthSuccess}
          onClose={handleCloseAuthForm}
        />
      )}

      {/* 用户设置 */}
      {showUserSettings && currentUser && (
        <UserSettings
          user={currentUser}
          onUpdate={handleUserUpdate}
          onClose={handleCloseUserSettings}
        />
      )}

             {/* 通知中心 */}
       <NotificationCenter
         isVisible={showNotificationCenter}
         onClose={() => setShowNotificationCenter(false)}
       />

       {/* 位置权限 */}
       <LocationPermission
         isVisible={showLocationPermission}
         onClose={() => setShowLocationPermission(false)}
         onPermissionGranted={handleLocationPermissionGranted}
       />
     </SafeAreaView>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 18,
    color: 'white',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  authSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  authDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileSection: {
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoon: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 50,
  },
});
