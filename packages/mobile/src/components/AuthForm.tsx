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

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
  onClose: () => void;
}

export default function AuthForm({ onAuthSuccess, onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('错误', '请输入邮箱地址');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('错误', '请输入密码');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少6位');
      return false;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        Alert.alert('错误', '两次输入的密码不一致');
        return false;
      }

      if (!username.trim()) {
        Alert.alert('错误', '请输入用户名');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result;
      
      if (isLogin) {
        result = await mobileAuthService.loginUser(email.trim(), password);
      } else {
        result = await mobileAuthService.registerUser(
          email.trim(),
          password,
          {
            username: username.trim(),
            full_name: fullName.trim(),
          },
          false
        );
      }

      if (result.success && result.user) {
        Alert.alert(
          '成功',
          isLogin ? '登录成功！' : '注册成功！',
          [
            {
              text: '确定',
              onPress: () => onAuthSuccess(result.user),
            },
          ]
        );
      } else {
        Alert.alert('错误', result.error || '操作失败，请重试');
      }
    } catch (error: any) {
      console.error('认证错误:', error);
      Alert.alert('错误', '操作失败，请检查网络连接或稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('错误', '请先输入邮箱地址');
      return;
    }

    try {
      const result = await mobileAuthService.resetPassword(email.trim());
      if (result.success) {
        Alert.alert(
          '成功',
          '重置密码邮件已发送，请检查您的邮箱',
          [{ text: '确定' }]
        );
      } else {
        Alert.alert('错误', result.error || '发送失败，请重试');
      }
    } catch (error) {
      console.error('重置密码错误:', error);
      Alert.alert('错误', '发送失败，请稍后重试');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFullName('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isLogin ? '登录账户' : '创建账户'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isLogin
                ? '欢迎回来！请登录您的账户'
                : '开始您的个性化体验之旅'}
            </Text>
          </View>

          {/* 表单 */}
          <View style={styles.form}>
            {!isLogin && (
              <>
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
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>邮箱地址 *</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="请输入邮箱地址"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>密码 *</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="请输入密码"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>确认密码 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="请再次输入密码"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* 操作按钮 */}
            <TouchableOpacity
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? '登录' : '注册'}
                </Text>
              )}
            </TouchableOpacity>

            {/* 忘记密码 */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>忘记密码？</Text>
              </TouchableOpacity>
            )}

            {/* 切换模式 */}
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>
                {isLogin ? '还没有账户？' : '已有账户？'}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <Text style={styles.switchModeButton}>
                  {isLogin ? '立即注册' : '立即登录'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 底部说明 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              继续使用即表示您同意我们的
            </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>服务条款</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>和</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>隐私政策</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
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
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchModeText: {
    fontSize: 16,
    color: '#666',
  },
  switchModeButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  footer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    marginHorizontal: 5,
  },
});

