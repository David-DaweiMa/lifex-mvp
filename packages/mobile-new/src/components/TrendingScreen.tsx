import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Star, MapPin, Clock, Users } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface TrendingItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  waitTime: string;
  popularity: number;
  image: string;
  description: string;
}

const mockTrendingData: TrendingItem[] = [
  {
    id: '1',
    name: 'Café Supreme',
    category: 'Coffee & Brunch',
    rating: 4.8,
    distance: '0.3 km',
    waitTime: '5-10 min',
    popularity: 95,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    description: 'Perfect spot for remote work with excellent coffee and free WiFi',
  },
  {
    id: '2',
    name: 'Auckland Fitness Center',
    category: 'Gym & Fitness',
    rating: 4.6,
    distance: '0.8 km',
    waitTime: 'No wait',
    popularity: 88,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    description: 'Modern gym with personal trainers and group classes',
  },
  {
    id: '3',
    name: 'Ponsonby Hair Studio',
    category: 'Beauty & Wellness',
    rating: 4.9,
    distance: '1.2 km',
    waitTime: '15-20 min',
    popularity: 92,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    description: 'Premium hair salon with experienced stylists',
  },
  {
    id: '4',
    name: 'Kiwi Pet Grooming',
    category: 'Pet Services',
    rating: 4.7,
    distance: '0.5 km',
    waitTime: '10-15 min',
    popularity: 85,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    description: 'Professional pet grooming with gentle care',
  },
];

export default function TrendingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'services', name: 'Services' },
  ];

  const renderTrendingItem = (item: TrendingItem) => (
    <TouchableOpacity key={item.id} style={styles.trendingCard}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.popularityBadge}>
          <TrendingUp size={12} color={darkTheme.text.primary} />
          <Text style={styles.popularityText}>{item.popularity}%</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.businessName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={darkTheme.accent.yellow} fill={darkTheme.accent.yellow} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <MapPin size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>{item.distance}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>{item.waitTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Users size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>Trending</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trending Now</Text>
          <Text style={styles.headerSubtitle}>Discover what's popular in your area</Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending List */}
        <View style={styles.trendingList}>
          {mockTrendingData.map(renderTrendingItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: darkTheme.text.secondary,
  },
  categoryScrollView: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: darkTheme.background.card,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  categoryButtonActive: {
    backgroundColor: darkTheme.neon.purple,
    borderColor: darkTheme.neon.purple,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: darkTheme.text.primary,
  },
  categoryButtonTextActive: {
    color: darkTheme.text.primary,
  },
  trendingList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  trendingCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 120,
    backgroundColor: darkTheme.background.secondary,
    position: 'relative',
  },
  cardImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.neon.purple,
  },
  cardImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  popularityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accent.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  categoryText: {
    fontSize: 14,
    color: darkTheme.text.secondary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: darkTheme.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: darkTheme.text.muted,
  },
});
