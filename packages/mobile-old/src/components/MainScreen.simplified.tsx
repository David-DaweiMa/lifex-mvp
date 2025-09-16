import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// 简化的MainScreen组件，减少依赖链
export default function MainScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const [aiStatus, setAiStatus] = useState({ isAvailable: true, model: 'GPT-4' });

  // 简化的标签页渲染
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'ai-chat':
        return renderAIChatTab();
      case 'recommendations':
        return renderRecommendationsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderHomeTab();
    }
  };

  const renderHomeTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>欢迎使用 LifeX MVP!</Text>
        <Text style={styles.welcomeSubtitle}>AI驱动的智能生活助手</Text>
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
            onPress={() => setAiStatus({...aiStatus, isAvailable: !aiStatus.isAvailable})}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>刷新状态</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAIChatTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>AI 对话</Text>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>🤖 AI助手功能</Text>
        <Text style={styles.placeholderDescription}>
          这里将显示AI对话界面，支持智能问答和个性化建议
        </Text>
        <TouchableOpacity style={styles.demoButton}>
          <Text style={styles.demoButtonText}>开始对话</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecommendationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>智能推荐</Text>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>🎯 个性化推荐</Text>
        <Text style={styles.placeholderDescription}>
          基于你的位置和偏好，推荐附近的最佳商家和服务
        </Text>
        <TouchableOpacity style={styles.demoButton}>
          <Text style={styles.demoButtonText}>获取推荐</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>个人资料</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>用户名:</Text>
          <Text style={styles.profileValue}>Demo User</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>邮箱:</Text>
          <Text style={styles.profileValue}>demo@lifex.nz</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>订阅等级:</Text>
          <Text style={styles.profileValue}>Premium</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>编辑资料</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LifeX MVP</Text>
          <Text style={styles.headerDescription}>
            {activeTab === 'home' && '智能推荐 • AI助手 • 个性化服务'}
            {activeTab === 'ai-chat' && '与AI助手对话，获得智能建议'}
            {activeTab === 'recommendations' && '发现附近的最佳商家'}
            {activeTab === 'profile' && '管理你的个人资料和设置'}
          </Text>
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
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
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
  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 24,
    marginBottom: 15,
  },
  placeholderDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  demoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
