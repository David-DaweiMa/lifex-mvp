import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';

interface AuthScreenProps {
  onBack?: () => void;
}

export default function AuthScreen({ onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email.trim(), password);
      } else {
        result = await register(email.trim(), password, {
          full_name: fullName.trim(),
          username: username.trim() || undefined,
        });
      }

      if (result.success) {
        Alert.alert(
          'Success',
          isLogin ? 'Welcome back!' : 'Account created successfully!',
          [{ text: 'OK' }]
        );
        // 认证成功，MainScreen会自动更新状态
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={darkTheme.text.primary} />
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isLogin 
            ? 'Sign in to continue your journey' 
            : 'Join LifeX to discover amazing places'
          }
        </Text>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={darkTheme.text.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={darkTheme.text.muted}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}

      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username (Optional)</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={darkTheme.text.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor={darkTheme.text.muted}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Mail size={20} color={darkTheme.text.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={darkTheme.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Lock size={20} color={darkTheme.text.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={darkTheme.text.muted}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
      </Text>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.footerLink}>
          {isLogin ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderForm()}
          {renderFooter()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: darkTheme.text.primary,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: darkTheme.neon.purple,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: darkTheme.background.glass,
  },
  submitButtonText: {
    color: darkTheme.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
    color: darkTheme.text.secondary,
  },
  footerLink: {
    fontSize: 16,
    color: darkTheme.neon.purple,
    fontWeight: '600',
  },
});