import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import CameraCapture from './CameraCapture';
import MediaLibrary from './MediaLibrary';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  timestamp: number;
  size?: number;
  duration?: number;
}

export default function CameraFeatures() {
  const [showCamera, setShowCamera] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<MediaItem[]>([]);

  const handleCapture = (uri: string, type: 'photo' | 'video') => {
    const newMedia: MediaItem = {
      id: Date.now().toString(),
      uri,
      type,
      timestamp: Date.now(),
      size: type === 'photo' ? 2048576 : 10485760, // 模拟文件大小
      duration: type === 'video' ? 15 : undefined, // 模拟视频时长
    };

    setCapturedMedia(prev => [newMedia, ...prev]);
    
    Alert.alert(
      '捕获成功',
      `已${type === 'photo' ? '拍照' : '录像'}！`,
      [
        { text: '确定' },
        { text: '查看媒体库', onPress: () => setShowMediaLibrary(true) },
      ]
    );
  };

  const handleSelectMedia = (media: MediaItem) => {
    Alert.alert(
      '媒体详情',
      `类型: ${media.type === 'photo' ? '照片' : '视频'}\n大小: ${formatFileSize(media.size || 0)}\n时间: ${formatTimestamp(media.timestamp)}${media.duration ? `\n时长: ${formatDuration(media.duration)}` : ''}`,
      [
        { text: '确定' },
        { text: '分享', onPress: () => console.log('分享媒体:', media.id) },
        { text: '编辑', onPress: () => console.log('编辑媒体:', media.id) },
      ]
    );
  };

  const handleDeleteMedia = (mediaId: string) => {
    setCapturedMedia(prev => prev.filter(item => item.id !== mediaId));
    Alert.alert('成功', '媒体文件已删除');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000 * 60) return '刚刚';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}分钟前`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}小时前`;
    if (diff < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(diff / (1000 * 60 * 60 * 24))}天前`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getRecentMedia = () => {
    return capturedMedia.slice(0, 3); // 只显示最近3个
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>相机功能</Text>
        <Text style={styles.subtitle}>拍照 • 录像 • 媒体管理</Text>
      </View>

      {/* 快速操作 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.actionButtonIcon}>📸</Text>
          <Text style={styles.actionButtonText}>拍照</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.actionButtonIcon}>🎥</Text>
          <Text style={styles.actionButtonText}>录像</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowMediaLibrary(true)}
        >
          <Text style={styles.actionButtonIcon}>📁</Text>
          <Text style={styles.actionButtonText}>媒体库</Text>
        </TouchableOpacity>
      </View>

      {/* 最近媒体 */}
      {capturedMedia.length > 0 && (
        <View style={styles.recentMediaSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近捕获</Text>
            <TouchableOpacity onPress={() => setShowMediaLibrary(true)}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recentMediaGrid}>
            {getRecentMedia().map((media) => (
              <TouchableOpacity
                key={media.id}
                style={styles.recentMediaItem}
                onPress={() => handleSelectMedia(media)}
              >
                <View style={styles.mediaThumbnail}>
                  <Text style={styles.mediaIcon}>
                    {media.type === 'photo' ? '📸' : '🎥'}
                  </Text>
                  {media.type === 'video' && media.duration && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{formatDuration(media.duration)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.mediaType}>
                  {media.type === 'photo' ? '照片' : '视频'}
                </Text>
                <Text style={styles.mediaTime}>{formatTimestamp(media.timestamp)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 功能说明 */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>功能特性</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📸</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>高清拍照</Text>
            <Text style={styles.featureDescription}>
              支持前后摄像头切换，自动对焦，闪光灯控制
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎥</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>视频录制</Text>
            <Text style={styles.featureDescription}>
              支持720p高清录制，最长60秒，自动保存
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📁</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>媒体管理</Text>
            <Text style={styles.featureDescription}>
              网格/列表视图切换，文件信息显示，批量管理
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>隐私保护</Text>
            <Text style={styles.featureDescription}>
              所有媒体文件仅存储在本地，不上传云端
            </Text>
          </View>
        </View>
      </View>

      {/* 相机组件 */}
      <CameraCapture
        isVisible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />

      {/* 媒体库组件 */}
      <Modal
        visible={showMediaLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMediaLibrary(false)}
      >
        <MediaLibrary
          onSelectMedia={handleSelectMedia}
          onDeleteMedia={handleDeleteMedia}
        />
        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => setShowMediaLibrary(false)}
        >
          <Text style={styles.closeModalButtonText}>关闭</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  recentMediaSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  recentMediaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentMediaItem: {
    alignItems: 'center',
    flex: 1,
  },
  mediaThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  mediaIcon: {
    fontSize: 24,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  durationText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  mediaType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  mediaTime: {
    fontSize: 10,
    color: '#999',
  },
  featuresSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

