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
import { Tag, Clock, MapPin, Star, Percent, Calendar, Users, Heart } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface SpecialOffer {
  id: string;
  title: string;
  businessName: string;
  category: string;
  discount: string;
  originalPrice: string;
  discountedPrice: string;
  description: string;
  validUntil: string;
  distance: string;
  rating: number;
  participants: number;
  image: string;
  isLiked: boolean;
}

const mockSpecialOffers: SpecialOffer[] = [
  {
    id: '1',
    title: '50% Off Coffee & Pastries',
    businessName: 'Café Supreme',
    category: 'Food & Drink',
    discount: '50%',
    originalPrice: '$20',
    discountedPrice: '$10',
    description: 'Enjoy our premium coffee blends with freshly baked pastries. Perfect for breakfast or afternoon break.',
    validUntil: '2025-01-25',
    distance: '0.3 km',
    rating: 4.8,
    participants: 124,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    isLiked: false,
  },
  {
    id: '2',
    title: 'Free Personal Training Session',
    businessName: 'Auckland Fitness Center',
    category: 'Fitness',
    discount: '100%',
    originalPrice: '$80',
    discountedPrice: 'FREE',
    description: 'Get a free personal training session with our certified trainers. Perfect for beginners!',
    validUntil: '2025-01-30',
    distance: '0.8 km',
    rating: 4.6,
    participants: 89,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    isLiked: true,
  },
  {
    id: '3',
    title: '30% Off Hair Styling',
    businessName: 'Ponsonby Hair Studio',
    category: 'Beauty',
    discount: '30%',
    originalPrice: '$120',
    discountedPrice: '$84',
    description: 'Professional hair styling and coloring services. Book your appointment today!',
    validUntil: '2025-02-05',
    distance: '1.2 km',
    rating: 4.9,
    participants: 67,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    isLiked: false,
  },
  {
    id: '4',
    title: 'Buy 2 Get 1 Free Pet Grooming',
    businessName: 'Kiwi Pet Grooming',
    category: 'Pet Services',
    discount: '33%',
    originalPrice: '$90',
    discountedPrice: '$60',
    description: 'Professional pet grooming services. Your furry friend deserves the best care!',
    validUntil: '2025-01-28',
    distance: '0.5 km',
    rating: 4.7,
    participants: 45,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    isLiked: false,
  },
];

export default function SpecialsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedOffers, setLikedOffers] = useState<Set<string>>(new Set(['2']));

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'services', name: 'Services' },
  ];

  const toggleLike = (offerId: string) => {
    setLikedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  const renderSpecialOffer = (offer: SpecialOffer) => (
    <TouchableOpacity key={offer.id} style={styles.offerCard}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>{offer.businessName.charAt(0)}</Text>
        </View>
        <View style={styles.discountBadge}>
          <Percent size={12} color={darkTheme.text.primary} />
          <Text style={styles.discountText}>{offer.discount}</Text>
        </View>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(offer.id)}
        >
          <Heart
            size={16}
            color={likedOffers.has(offer.id) ? darkTheme.accent.red : darkTheme.text.muted}
            fill={likedOffers.has(offer.id) ? darkTheme.accent.red : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{offer.originalPrice}</Text>
            <Text style={styles.discountedPrice}>{offer.discountedPrice}</Text>
          </View>
        </View>
        
        <Text style={styles.businessName}>{offer.businessName}</Text>
        <Text style={styles.categoryText}>{offer.category}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {offer.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <Clock size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>Expires {offer.validUntil}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>{offer.distance}</Text>
          </View>
          <View style={styles.infoItem}>
            <Users size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>{offer.participants} claimed</Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <Star size={14} color={darkTheme.accent.yellow} fill={darkTheme.accent.yellow} />
          <Text style={styles.ratingText}>{offer.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Special Offers</Text>
          <Text style={styles.headerSubtitle}>Exclusive deals and discounts</Text>
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

        {/* Special Offers List */}
        <View style={styles.offersList}>
          {mockSpecialOffers.map(renderSpecialOffer)}
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
  offersList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  offerCard: {
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
    backgroundColor: darkTheme.accent.orange,
  },
  cardImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accent.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 16,
    backgroundColor: darkTheme.background.overlay,
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
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: darkTheme.text.muted,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.accent.green,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.text.primary,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
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
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 10,
    color: darkTheme.text.muted,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
});
