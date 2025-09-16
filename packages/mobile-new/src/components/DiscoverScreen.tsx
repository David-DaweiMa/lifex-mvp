import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Filter, Camera, Star, Clock } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface DiscoveryItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  image: string;
  description: string;
  isNew: boolean;
}

const mockDiscoveryData: DiscoveryItem[] = [
  {
    id: '1',
    name: 'Hidden Gem Café',
    category: 'Coffee',
    rating: 4.9,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    description: 'Cozy café with locally roasted coffee and homemade pastries',
    isNew: true,
  },
  {
    id: '2',
    name: 'Auckland Art Gallery',
    category: 'Culture',
    rating: 4.7,
    distance: '1.1 km',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    description: 'Contemporary art gallery featuring local and international artists',
    isNew: false,
  },
  {
    id: '3',
    name: 'Ponsonby Market',
    category: 'Shopping',
    rating: 4.6,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    description: 'Local market with fresh produce and artisan goods',
    isNew: true,
  },
  {
    id: '4',
    name: 'Sky Tower Restaurant',
    category: 'Fine Dining',
    rating: 4.8,
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    description: 'Fine dining with panoramic city views',
    isNew: false,
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'culture', name: 'Culture' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'outdoor', name: 'Outdoor' },
  ];

  const renderDiscoveryItem = (item: DiscoveryItem) => (
    <TouchableOpacity key={item.id} style={styles.discoveryCard}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>{item.name.charAt(0)}</Text>
        </View>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Star size={12} color={darkTheme.accent.yellow} fill={darkTheme.accent.yellow} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.businessName}>{item.name}</Text>
          <View style={styles.distanceContainer}>
            <MapPin size={12} color={darkTheme.text.muted} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
        
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Camera size={16} color={darkTheme.neon.purple} />
            <Text style={styles.actionButtonText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MapPin size={16} color={darkTheme.neon.green} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find hidden gems around you</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={darkTheme.text.muted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search places, categories..."
              placeholderTextColor={darkTheme.text.muted}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={darkTheme.neon.purple} />
            </TouchableOpacity>
          </View>
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

        {/* Discovery List */}
        <View style={styles.discoveryList}>
          {mockDiscoveryData.map(renderDiscoveryItem)}
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: darkTheme.text.primary,
  },
  filterButton: {
    padding: 4,
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
  discoveryList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  discoveryCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 140,
    backgroundColor: darkTheme.background.secondary,
    position: 'relative',
  },
  cardImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.neon.green,
  },
  cardImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: darkTheme.accent.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: darkTheme.text.muted,
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
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: darkTheme.text.primary,
  },
});
