import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  timestamp: number;
  size?: number;
  duration?: number;
}

interface MediaLibraryProps {
  onSelectMedia: (media: MediaItem) => void;
  onDeleteMedia?: (mediaId: string) => void;
}

export default function MediaLibrary({ onSelectMedia, onDeleteMedia }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 模拟媒体数据
  useEffect(() => {
    loadMockMedia();
  }, []);

  const loadMockMedia = () => {
    const mockMedia: MediaItem[] = [
      {
        id: '1',
        uri: 'mock://photo1.jpg',
        type: 'photo',
        timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
        size: 2048576, // 2MB
      },
      {
        id: '2',
        uri: 'mock://video1.mp4',
        type: 'video',
        timestamp: Date.now() - 1000 * 60 * 60, // 1小时前
        size: 10485760, // 10MB
        duration: 15, // 15秒
      },
      {
        id: '3',
        uri: 'mock://photo2.jpg',
        type: 'photo',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
        size: 1536000, // 1.5MB
      },
      {
        id: '4',
        uri: 'mock://video2.mp4',
        type: 'video',
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3小时前
        size: 20971520, // 20MB
        duration: 30, // 30秒
      },
    ];
    setMediaItems(mockMedia);
  };

  const handleMediaPress = (media: MediaItem) => {
    setSelectedMedia(media);
    onSelectMedia(media);
  };

  const handleDeleteMedia = (mediaId: string) => {
    Alert.alert(
      '删除媒体',
      '确定要删除这个媒体文件吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            if (onDeleteMedia) {
              onDeleteMedia(mediaId);
            }
            setMediaItems(current => current.filter(item => item.id !== mediaId));
            setSelectedMedia(null);
          },
        },
      ]
    );
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

  const renderMediaItem = (media: MediaItem) => (
    <TouchableOpacity
      key={media.id}
      style={[
        styles.mediaItem,
        viewMode === 'grid' ? styles.gridItem : styles.listItem,
        selectedMedia?.id === media.id && styles.selectedItem,
      ]}
      onPress={() => handleMediaPress(media)}
      onLongPress={() => onDeleteMedia && handleDeleteMedia(media.id)}
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
      
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaType}>
          {media.type === 'photo' ? '照片' : '视频'}
        </Text>
        <Text style={styles.mediaSize}>{formatFileSize(media.size || 0)}</Text>
        <Text style={styles.mediaTimestamp}>{formatTimestamp(media.timestamp)}</Text>
      </View>
      
      {onDeleteMedia && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMedia(media.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>媒体库</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewModeButton]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={styles.viewModeButtonText}>⊞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewModeButton]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.viewModeButtonText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {mediaItems.filter(item => item.type === 'photo').length}
          </Text>
          <Text style={styles.statLabel}>照片</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {mediaItems.filter(item => item.type === 'video').length}
          </Text>
          <Text style={styles.statLabel}>视频</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {formatFileSize(mediaItems.reduce((total, item) => total + (item.size || 0), 0))}
          </Text>
          <Text style={styles.statLabel}>总大小</Text>
        </View>
      </View>

      {/* 媒体列表 */}
      {mediaItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>暂无媒体文件</Text>
          <Text style={styles.emptyDescription}>
            拍摄照片或视频后，它们将显示在这里
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.mediaContainer} showsVerticalScrollIndicator={false}>
          <View style={[
            styles.mediaGrid,
            viewMode === 'grid' ? styles.gridLayout : styles.listLayout
          ]}>
            {mediaItems.map(renderMediaItem)}
          </View>
        </ScrollView>
      )}

      {/* 底部操作 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonIcon}>📁</Text>
          <Text style={styles.actionButtonText}>导入</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonIcon}>🔍</Text>
          <Text style={styles.actionButtonText}>搜索</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonIcon}>⚙️</Text>
          <Text style={styles.actionButtonText}>设置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  activeViewModeButton: {
    backgroundColor: '#007AFF',
  },
  viewModeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  mediaContainer: {
    flex: 1,
    padding: 20,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLayout: {
    justifyContent: 'space-between',
  },
  listLayout: {
    flexDirection: 'column',
  },
  mediaItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 15,
  },
  gridItem: {
    width: (width - 60) / 2,
    marginRight: 0,
  },
  listItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  mediaThumbnail: {
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  'gridItem .mediaThumbnail': {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  'listItem .mediaThumbnail': {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  mediaIcon: {
    fontSize: 32,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  mediaInfo: {
    flex: 1,
    padding: 10,
  },
  mediaType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  mediaSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  mediaTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
});
