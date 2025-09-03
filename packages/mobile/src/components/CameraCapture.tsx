import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';

interface CameraCaptureProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: (uri: string, type: 'photo' | 'video') => void;
}

export default function CameraCapture({ isVisible, onClose, onCapture }: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (isVisible) {
      requestCameraPermission();
    }
  }, [isVisible]);

  const requestCameraPermission = async () => {
    try {
      // 模拟权限请求
      setHasPermission(true);
    } catch (error) {
      console.error('请求相机权限失败:', error);
      setHasPermission(false);
    }
  };

  const takePicture = async () => {
    try {
      // 模拟拍照
      const mockUri = `mock://photo_${Date.now()}.jpg`;
      setCapturedImage(mockUri);
      setIsPreviewMode(true);
    } catch (error) {
      console.error('拍照失败:', error);
      Alert.alert('错误', '拍照失败，请重试');
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // 模拟录像
      setTimeout(() => {
        const mockUri = `mock://video_${Date.now()}.mp4`;
        setCapturedVideo(mockUri);
        setIsPreviewMode(true);
        setIsRecording(false);
      }, 2000); // 2秒后完成
    } catch (error) {
      console.error('录像失败:', error);
      Alert.alert('错误', '录像失败，请重试');
    }
  };

  const stopRecording = async () => {
    // 模拟停止录像
    setIsRecording(false);
  };

  const handleCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage, 'photo');
    } else if (capturedVideo) {
      onCapture(capturedVideo, 'video');
    }
    handleClose();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsPreviewMode(false);
  };

  const handleClose = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsPreviewMode(false);
    onClose();
  };

  const toggleCameraType = () => {
    setCameraType((current: 'back' | 'front') => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlashMode = () => {
    setFlashMode((current: 'on' | 'off') => 
      current === 'off' ? 'on' : 'off'
    );
  };

  if (hasPermission === null) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>请求相机权限中...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>没有相机权限</Text>
            <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        {!isPreviewMode ? (
          // 相机预览模式
          <View style={styles.camera}>
            <View style={styles.cameraOverlay}>
              {/* 顶部控制栏 */}
              <View style={styles.topControls}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                
                <View style={styles.topRightControls}>
                  <TouchableOpacity style={styles.flashButton} onPress={toggleFlashMode}>
                    <Text style={styles.flashButtonText}>
                      {flashMode === 'on' ? '⚡' : '⚡'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.switchButton} onPress={toggleCameraType}>
                    <Text style={styles.switchButtonText}>🔄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 相机预览区域 */}
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraPreviewText}>
                  📸 相机预览
                </Text>
                <Text style={styles.cameraPreviewSubtext}>
                  当前摄像头: {cameraType === 'back' ? '后置' : '前置'}
                </Text>
                <Text style={styles.cameraPreviewSubtext}>
                  闪光灯: {flashMode === 'on' ? '开启' : '关闭'}
                </Text>
              </View>

              {/* 底部控制栏 */}
              <View style={styles.bottomControls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.recordButton, isRecording && styles.recordingButton]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Text style={styles.recordButtonText}>
                    {isRecording ? '⏹️' : '🔴'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // 预览模式
          <View style={styles.previewContainer}>
            {capturedImage ? (
              <View style={styles.previewImageContainer}>
                <Text style={styles.previewTitle}>照片预览</Text>
                <View style={styles.previewImage}>
                  <Text style={styles.previewPlaceholder}>📸 照片预览</Text>
                </View>
              </View>
            ) : (
              <View style={styles.previewVideoContainer}>
                <Text style={styles.previewTitle}>视频预览</Text>
                <View style={styles.previewVideo}>
                  <Text style={styles.previewPlaceholder}>🎥 视频预览</Text>
                </View>
              </View>
            )}
            
            <View style={styles.previewControls}>
              <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                <Text style={styles.retakeButtonText}>重拍</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.useButton} onPress={handleCapture}>
                <Text style={styles.useButtonText}>使用</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraPreviewText: {
    fontSize: 32,
    color: 'white',
    marginBottom: 20,
  },
  cameraPreviewSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  flashButtonText: {
    fontSize: 20,
  },
  switchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  recordButtonText: {
    fontSize: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  previewTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  previewImage: {
    width: width - 40,
    height: height * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  previewVideo: {
    width: width - 40,
    height: height * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    color: 'white',
    fontSize: 18,
    opacity: 0.7,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  useButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
