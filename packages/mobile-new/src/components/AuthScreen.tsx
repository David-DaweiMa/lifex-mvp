import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName || !formData.confirmPassword) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isLogin) {
        Alert.alert('Success', 'Login successful!');
        // TODO: Navigate to main app
      } else {
        Alert.alert('Success', 'Account created successfully!');
        setIsLogin(true);
        setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <ArrowLeft size={24} color={darkTheme.text.primary} />
      </TouchableOpacity>
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
  );

  const renderForm = () => (
    <View style={styles.form}>
      {!isLogin && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color={darkTheme.text.muted} />
            <TextInput
              style={styles.textInput}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={darkTheme.text.muted}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputWrapper}>
          <Mail size={20} color={darkTheme.text.muted} />
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            placeholderTextColor={darkTheme.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color={darkTheme.text.muted} />
          <TextInput
            style={styles.textInput}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Enter your password"
            placeholderTextColor={darkTheme.text.muted}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color={darkTheme.text.muted} />
            ) : (
              <Eye size={20} color={darkTheme.text.muted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!isLogin && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={darkTheme.text.muted} />
            <TextInput
              style={styles.textInput}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              placeholderTextColor={darkTheme.text.muted}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={darkTheme.text.muted} />
              ) : (
                <Eye size={20} color={darkTheme.text.muted} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      disabled={isLoading}
    >
      <Text style={styles.submitButtonText}>
        {isLoading 
          ? (isLogin ? 'Signing In...' : 'Creating Account...') 
          : (isLogin ? 'Sign In' : 'Create Account')
        }
      </Text>
    </TouchableOpacity>
  );

  const renderAuthToggle = () => (
    <View style={styles.authToggle}>
      <Text style={styles.authToggleText}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
      </Text>
      <TouchableOpacity onPress={toggleAuthMode}>
        <Text style={styles.authToggleLink}>
          {isLogin ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSocialAuth = () => (
    <View style={styles.socialAuth}>
      <Text style={styles.socialAuthText}>Or continue with</Text>
      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderForm()}
          {renderSubmitButton()}
          {renderAuthToggle()}
          {renderSocialAuth()}
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
  header: {
    padding: 16,
    paddingTop: 32,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    lineHeight: 24,
  },
  form: {
    padding: 16,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: darkTheme.text.primary,
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: darkTheme.neon.purple,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  authToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  authToggleText: {
    fontSize: 16,
    color: darkTheme.text.secondary,
  },
  authToggleLink: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.neon.purple,
  },
  socialAuth: {
    padding: 16,
    paddingTop: 0,
  },
  socialAuthText: {
    fontSize: 14,
    color: darkTheme.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: darkTheme.background.card,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: darkTheme.text.primary,
  },
});
