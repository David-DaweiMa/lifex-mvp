import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { mobileAIService } from '../services/aiService';
import locationService from '../services/locationService';
import notificationService from '../services/notificationService';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  tags: string[];
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '全部', icon: '🌟' },
    { id: 'food', name: '美食', icon: '🍔' },
    { id: 'shopping', name: '购物', icon: '🛍️' },
    { id: 'entertainment', name: '娱乐', icon: '🎮' },
    { id: 'health', name: '健康', icon: '💪' },
    { id: 'education', name: '教育', icon: '📚' },
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // 尝试获取基于位置的推荐
      try {
        const nearbyResponse = await mobileAIService.getNearbyRecommendations();
        if (nearbyResponse && nearbyResponse.recommendations) {
          const formattedRecommendations: Recommendation[] = nearbyResponse.recommendations.map((rec: any, index: number) => ({
            id: index.toString(),
            title: rec.title || `附近推荐 ${index + 1}`,
            description: rec.description || rec.explanation || '基于您当前位置的推荐',
            category: rec.category || 'general',
            confidence: rec.confidence || 0.8,
            tags: [...(rec.tags || ['推荐']), '📍 附近'],
          }));
          
          setRecommendations(formattedRecommendations);
          
          // 发送通知
          await notificationService.sendLocalNotification(
            '发现附近推荐',
            `为您找到了${formattedRecommendations.length}个附近推荐`,
            'recommendation'
          );
          
          return;
        }
      } catch (locationError) {
        console.log('基于位置的推荐失败，使用离线推荐:', locationError);
      }

      // 如果基于位置的推荐失败，使用离线推荐
      const response = await mobileAIService.getOfflineRecommendations();
      
      if (response && response.recommendations) {
        // 转换推荐数据格式
        const formattedRecommendations: Recommendation[] = response.recommendations.map((rec: any, index: number) => ({
          id: index.toString(),
          title: rec.title || `推荐 ${index + 1}`,
          description: rec.description || rec.explanation || '这是一个个性化推荐',
          category: rec.category || 'general',
          confidence: rec.confidence || 0.8,
          tags: rec.tags || ['推荐'],
        }));
        
        setRecommendations(formattedRecommendations);
      } else {
        // 生成默认推荐
        generateDefaultRecommendations();
      }
    } catch (error) {
      console.error('加载推荐失败:', error);
      generateDefaultRecommendations();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultRecommendations = () => {
    const defaultRecommendations: Recommendation[] = [
      {
        id: '1',
        title: '健康生活建议',
        description: '基于你的偏好，建议每天保持30分钟运动，多吃蔬菜水果，保持充足睡眠。',
        category: 'health',
        confidence: 0.9,
        tags: ['健康', '运动', '饮食'],
      },
      {
        id: '2',
        title: '工作效率提升',
        description: '建议使用番茄工作法，每25分钟专注工作，然后休息5分钟，提高工作效率。',
        category: 'education',
        confidence: 0.85,
        tags: ['工作', '效率', '时间管理'],
      },
      {
        id: '3',
        title: '美食探索',
        description: '附近新开了一家健康餐厅，提供低卡路里美食，符合你的健康饮食偏好。',
        category: 'food',
        confidence: 0.8,
        tags: ['美食', '健康', '餐厅'],
      },
      {
        id: '4',
        title: '购物优惠',
        description: '你关注的品牌正在进行促销活动，部分商品折扣高达50%，建议及时关注。',
        category: 'shopping',
        confidence: 0.75,
        tags: ['购物', '优惠', '促销'],
      },
    ];
    setRecommendations(defaultRecommendations);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    setIsRefreshing(false);
  };

  const refreshLocationRecommendations = async () => {
    try {
      setIsLoading(true);
      // 获取当前位置并刷新推荐
      const nearbyResponse = await mobileAIService.getNearbyRecommendations();
      if (nearbyResponse && nearbyResponse.recommendations) {
        const formattedRecommendations: Recommendation[] = nearbyResponse.recommendations.map((rec: any, index: number) => ({
          id: index.toString(),
          title: rec.title || `附近推荐 ${index + 1}`,
          description: rec.description || rec.explanation || '基于您当前位置的推荐',
          category: rec.category || 'general',
          confidence: rec.confidence || 0.8,
          tags: [...(rec.tags || ['推荐']), '📍 附近'],
        }));
        
        setRecommendations(formattedRecommendations);
        
        await notificationService.sendLocalNotification(
          '位置推荐已更新',
          `基于新位置为您找到了${formattedRecommendations.length}个推荐`,
          'recommendation'
        );
      }
    } catch (error) {
      console.error('刷新位置推荐失败:', error);
      Alert.alert('错误', '刷新位置推荐失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationPress = (recommendation: Recommendation) => {
    Alert.alert(
      recommendation.title,
      recommendation.description,
      [
        { text: '关闭', style: 'cancel' },
        { text: '了解更多', onPress: () => console.log('了解更多:', recommendation.id) },
      ]
    );
  };

  const getFilteredRecommendations = () => {
    if (selectedCategory === 'all') {
      return recommendations;
    }
    return recommendations.filter(rec => rec.category === selectedCategory);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    return '低';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>正在生成个性化推荐...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LifeX MVP</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={refreshLocationRecommendations}
          >
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 分类筛选 */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 推荐列表 */}
      <ScrollView
        style={styles.recommendationsContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {getFilteredRecommendations().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🤔</Text>
            <Text style={styles.emptyTitle}>暂无推荐</Text>
            <Text style={styles.emptyDescription}>
              尝试下拉刷新或选择其他分类
            </Text>
          </View>
        ) : (
          getFilteredRecommendations().map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              style={styles.recommendationCard}
              onPress={() => handleRecommendationPress(recommendation)}
            >
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(recommendation.confidence) },
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {getConfidenceText(recommendation.confidence)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.recommendationDescription}>
                {recommendation.description}
              </Text>
              
              <View style={styles.tagsContainer}>
                {recommendation.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.recommendationFooter}>
                <Text style={styles.categoryLabel}>
                  {categories.find(c => c.id === recommendation.category)?.name || '其他'}
                </Text>
                <Text style={styles.confidenceLabel}>
                  置信度: {(recommendation.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationButtonText: {
    fontSize: 18,
    color: '#1976d2',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#666',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  recommendationsContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
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
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#999',
  },
});
