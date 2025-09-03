import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { mobileAuthService } from '../services/authService';

interface UserSettingsProps {
  user: any;
  onUpdate: (user: any) => void;
  onClose: () => void;
}

export default function UserSettings({ user, onUpdate, onClose }: UserSettingsProps) {
  const [username, setUsername] = useState(user.username || '');
  const [fullName, setFullName] = useState(user.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('错误', '用户名不能为空');
      return;
    }

    setIsLoading(true);
    try {
      const result = await mobileAuthService.updateUserProfile(user.id, {
        username: username.trim(),
        full_name: fullName.trim(),
      });

      if (result.success && result.user) {
        onUpdate(result.user);
        Alert.alert('成功', '个人信息更新成功！');
      } else {
        Alert.alert('错误', result.error || '更新失败，请重试');
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      Alert.alert('错误', '更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('错误', '请输入当前密码');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('错误', '请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('错误', '新密码长度至少6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '两次输入的新密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      const result = await mobileAuthService.updatePassword(newPassword);

      if (result.success) {
        Alert.alert('成功', '密码修改成功！');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('错误', result.error || '密码修改失败，请重试');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      Alert.alert('错误', '密码修改失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>用户名 *</Text>
        <TextInput
          style={styles.textInput}
          value={username}
          onChangeText={setUsername}
          placeholder="请输入用户名"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>姓名</Text>
        <TextInput
          style={styles.textInput}
          value={fullName}
          onChangeText={setFullName}
          placeholder="请输入您的姓名"
          placeholderTextColor="#999"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>邮箱地址</Text>
        <Text style={styles.readOnlyText}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
        onPress={handleUpdateProfile}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.updateButtonText}>更新个人信息</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPasswordTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>当前密码 *</Text>
        <TextInput
          style={styles.textInput}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="请输入当前密码"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>新密码 *</Text>
        <TextInput
          style={styles.textInput}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="请输入新密码"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>确认新密码 *</Text>
        <TextInput
          style={styles.textInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="请再次输入新密码"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.updateButtonText}>修改密码</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>用户设置</Text>
        </View>

        {/* 标签栏 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              个人信息
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>
              修改密码
            </Text>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'profile' ? renderProfileTab() : renderPasswordTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  readOnlyText: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#666',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
