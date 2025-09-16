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
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Heart, 
  Share, 
  Navigation,
  Calendar,
  MessageCircle,
  Globe,
  Wifi,
  Car,
  CreditCard
} from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface BusinessDetail {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  hours: string[];
  amenities: string[];
  images: string[];
  isOpen: boolean;
  isLiked: boolean;
}

const mockBusinessDetail: BusinessDetail = {
  id: '1',
  name: 'Café Supreme',
  category: 'Coffee & Brunch',
  rating: 4.8,
  reviewCount: 234,
  distance: '0.3 km',
  address: '118 Ponsonby Road, Auckland',
  phone: '09-555-0123',
  website: 'www.cafesupreme.co.nz',
  description: 'A cozy café in the heart of Ponsonby, serving premium coffee blends and freshly baked pastries. Perfect for remote work with fast WiFi and quiet atmosphere.',
  hours: [
    'Monday: 7:00 AM - 5:00 PM',
    'Tuesday: 7:00 AM - 5:00 PM',
    'Wednesday: 7:00 AM - 5:00 PM',
    'Thursday: 7:00 AM - 5:00 PM',
    'Friday: 7:00 AM - 6:00 PM',
    'Saturday: 8:00 AM - 6:00 PM',
    'Sunday: 8:00 AM - 4:00 PM'
  ],
  amenities: ['Free WiFi', 'Parking Available', 'Credit Cards Accepted', 'Outdoor Seating'],
  images: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
  ],
  isOpen: true,
  isLiked: false,
};

export default function BusinessDetailScreen() {
  const [isLiked, setIsLiked] = useState(mockBusinessDetail.isLiked);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <ArrowLeft size={24} color={darkTheme.text.primary} />
      </TouchableOpacity>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Share size={20} color={darkTheme.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
          <Heart 
            size={20} 
            color={isLiked ? darkTheme.accent.red : darkTheme.text.primary}
            fill={isLiked ? darkTheme.accent.red : 'transparent'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <View style={styles.mainImage}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>{mockBusinessDetail.name.charAt(0)}</Text>
        </View>
        <View style={styles.imageIndicators}>
          {mockBusinessDetail.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                selectedImageIndex === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderBusinessInfo = () => (
    <View style={styles.businessInfo}>
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{mockBusinessDetail.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {mockBusinessDetail.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.categoryText}>{mockBusinessDetail.category}</Text>
      
      <View style={styles.ratingContainer}>
        <Star size={16} color={darkTheme.accent.yellow} fill={darkTheme.accent.yellow} />
        <Text style={styles.ratingText}>{mockBusinessDetail.rating}</Text>
        <Text style={styles.reviewCount}>({mockBusinessDetail.reviewCount} reviews)</Text>
        <Text style={styles.distanceText}>• {mockBusinessDetail.distance}</Text>
      </View>
      
      <Text style={styles.description}>{mockBusinessDetail.description}</Text>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      
      <TouchableOpacity style={styles.contactItem}>
        <MapPin size={16} color={darkTheme.text.muted} />
        <Text style={styles.contactText}>{mockBusinessDetail.address}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.contactItem}>
        <Phone size={16} color={darkTheme.text.muted} />
        <Text style={styles.contactText}>{mockBusinessDetail.phone}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.contactItem}>
        <Globe size={16} color={darkTheme.text.muted} />
        <Text style={styles.contactText}>{mockBusinessDetail.website}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHours = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Opening Hours</Text>
      {mockBusinessDetail.hours.map((hour, index) => (
        <View key={index} style={styles.hourItem}>
          <Text style={styles.hourText}>{hour}</Text>
        </View>
      ))}
    </View>
  );

  const renderAmenities = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {mockBusinessDetail.amenities.map((amenity, index) => (
          <View key={index} style={styles.amenityItem}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.primaryButton}>
        <Calendar size={20} color={darkTheme.text.primary} />
        <Text style={styles.primaryButtonText}>Book Now</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton}>
        <Navigation size={20} color={darkTheme.neon.purple} />
        <Text style={styles.secondaryButtonText}>Directions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton}>
        <MessageCircle size={20} color={darkTheme.neon.purple} />
        <Text style={styles.secondaryButtonText}>Reviews</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderBusinessInfo()}
        {renderContactInfo()}
        {renderHours()}
        {renderAmenities()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: darkTheme.background.card,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.background.glass,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 200,
    backgroundColor: darkTheme.background.secondary,
  },
  mainImage: {
    flex: 1,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.neon.purple,
  },
  imageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: darkTheme.text.primary,
  },
  businessInfo: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: darkTheme.accent.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  categoryText: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  reviewCount: {
    fontSize: 14,
    color: darkTheme.text.muted,
  },
  distanceText: {
    fontSize: 14,
    color: darkTheme.text.muted,
  },
  description: {
    fontSize: 16,
    color: darkTheme.text.primary,
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: darkTheme.background.glass,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: darkTheme.text.primary,
  },
  hourItem: {
    marginBottom: 8,
  },
  hourText: {
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    backgroundColor: darkTheme.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  amenityText: {
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.neon.purple,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.background.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.neon.purple,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: darkTheme.neon.purple,
  },
});
