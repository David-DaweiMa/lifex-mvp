import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import locationService from '../services/locationService';
import type { LocationPermission } from '../services/locationService';

interface LocationPermissionProps {
  isVisible: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export default function LocationPermission({
  isVisible,
  onClose,
  onPermissionGranted,
}: LocationPermissionProps) {
  const [permission, setPermission] = useState<LocationPermission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkPermission();
    }
  }, [isVisible]);

  const checkPermission = async () => {
    try {
      const currentPermission = await locationService.checkLocationPermission();
      setPermission(currentPermission);
    } catch (error) {
      console.error('检查位置权限失败:', error);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const newPermission = await locationService.requestLocationPermission();
      setPermission(newPermission);
      
      if (newPermission.granted) {
        Alert.alert(
          '权限已授予',
          '位置权限已成功授予，现在可以使用基于位置的服务了。',
          [
            {
              text: '确定',
              onPress: () => {
                onPermissionGranted();
                onClose();
              },
            },
          ]
        );
      } else if (newPermission.denied) {
        Alert.alert(
          '权限被拒绝',
          '位置权限被拒绝，您需要在设置中手动开启位置权限才能使用基于位置的服务。',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '去设置',
              onPress: () => {
                // 这里可以引导用户去系统设置
                console.log('引导用户去系统设置');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('请求位置权限失败:', error);
      Alert.alert('错误', '请求位置权限失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPermissionStatus = () => {
    if (!permission) return null;

    if (permission.granted) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusTitle}>位置权限已授予</Text>
          <Text style={styles.statusDescription}>
            您现在可以使用基于位置的服务，如附近推荐、导航等。
          </Text>
        </View>
      );
    }

    if (permission.denied) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>❌</Text>
          <Text style={styles.statusTitle}>位置权限被拒绝</Text>
          <Text style={styles.statusDescription}>
            您需要在系统设置中手动开启位置权限才能使用基于位置的服务。
          </Text>
        </View>
      );
    }

    if (permission.restricted) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>⚠️</Text>
          <Text style={styles.statusTitle}>位置权限受限</Text>
          <Text style={styles.statusDescription}>
            位置权限受到限制，可能是由于家长控制或其他系统设置。
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusIcon}>❓</Text>
        <Text style={styles.statusTitle}>位置权限状态未知</Text>
        <Text style={styles.statusDescription}>
          无法确定位置权限状态，请尝试重新请求权限。
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>位置权限</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 内容 */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>📍</Text>
          </View>

          <Text style={styles.title}>需要位置权限</Text>
          <Text style={styles.description}>
            为了提供更好的服务体验，我们需要访问您的位置信息。这将用于：
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>提供附近推荐</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureText}>显示附近商家</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚗</Text>
              <Text style={styles.featureText}>计算距离和路线</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={styles.featureText}>个性化内容推荐</Text>
            </View>
          </View>

          {renderPermissionStatus()}

          <View style={styles.buttonContainer}>
            {!permission?.granted && (
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={requestPermission}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? '请求中...' : '授予位置权限'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>
                {permission?.granted ? '完成' : '稍后再说'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.privacyNote}>
            我们承诺保护您的隐私，位置信息仅用于提供服务，不会泄露给第三方。
          </Text>
        </View>
      </View>
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
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  mainIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  featureList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
