import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Star, MapPin, Clock, TrendingUp, Bookmark, History, Settings } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface PersonalizedItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  description: string;
  reason: string;
  isBookmarked: boolean;
  lastVisited?: string;
}

const mockPersonalizedData: PersonalizedItem[] = [
  {
    id: '1',
    name: 'Café Supreme',
    category: 'Coffee & Brunch',
    rating: 4.8,
    distance: '0.3 km',
    description: 'Perfect spot for remote work with excellent coffee and free WiFi',
    reason: 'Based on your love for quiet workspaces',
    isBookmarked: true,
    lastVisited: '2 days ago',
  },
  {
    id: '2',
    name: 'Auckland Fitness Center',
    category: 'Gym & Fitness',
    rating: 4.6,
    distance: '0.8 km',
    description: 'Modern gym with personal trainers and group classes',
    reason: 'Matches your fitness goals and schedule',
    isBookmarked: false,
    lastVisited: '1 week ago',
  },
  {
    id: '3',
    name: 'Ponsonby Hair Studio',
    category: 'Beauty & Wellness',
    rating: 4.9,
    distance: '1.2 km',
    description: 'Premium hair salon with experienced stylists',
    reason: 'Similar to places you\'ve rated highly',
    isBookmarked: true,
  },
  {
    id: '4',
    name: 'Kiwi Pet Grooming',
    category: 'Pet Services',
    rating: 4.7,
    distance: '0.5 km',
    description: 'Professional pet grooming with gentle care',
    reason: 'Near your frequently visited areas',
    isBookmarked: false,
  },
];

export default function ColyScreen() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'bookmarks' | 'history'>('recommendations');
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set(['1', '3']));

  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderPersonalizedItem = (item: PersonalizedItem) => (
    <TouchableOpacity key={item.id} style={styles.itemCard}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.reasonBadge}>
          <TrendingUp size={12} color={darkTheme.text.primary} />
          <Text style={styles.reasonText}>AI Match</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => toggleBookmark(item.id)}
        >
          <Bookmark
            size={16}
            color={bookmarkedItems.has(item.id) ? darkTheme.accent.yellow : darkTheme.text.muted}
            fill={bookmarkedItems.has(item.id) ? darkTheme.accent.yellow : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={darkTheme.accent.yellow} fill={darkTheme.accent.yellow} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Why recommended:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <MapPin size={12} color={darkTheme.text.muted} />
            <Text style={styles.infoText}>{item.distance}</Text>
          </View>
          {item.lastVisited && (
            <View style={styles.infoItem}>
              <History size={12} color={darkTheme.text.muted} />
              <Text style={styles.infoText}>{item.lastVisited}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>For You</Text>
              <Text style={styles.sectionSubtitle}>Personalized recommendations based on your preferences</Text>
            </View>
            <View style={styles.itemsList}>
              {mockPersonalizedData.map(renderPersonalizedItem)}
            </View>
          </View>
        );
      case 'bookmarks':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Bookmarks</Text>
              <Text style={styles.sectionSubtitle}>Places you've saved for later</Text>
            </View>
            <View style={styles.itemsList}>
              {mockPersonalizedData.filter(item => bookmarkedItems.has(item.id)).map(renderPersonalizedItem)}
            </View>
          </View>
        );
      case 'history':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Places you've visited recently</Text>
            </View>
            <View style={styles.itemsList}>
              {mockPersonalizedData.filter(item => item.lastVisited).map(renderPersonalizedItem)}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Coly</Text>
          <Text style={styles.headerSubtitle}>Your personalized companion</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color={darkTheme.neon.purple} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {[
            { id: 'recommendations' as const, label: 'For You', icon: TrendingUp },
            { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark },
            { id: 'history' as const, label: 'History', icon: History },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon
                size={16}
                color={activeTab === tab.id ? darkTheme.neon.purple : darkTheme.text.muted}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    flex: 1,
    marginLeft: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: darkTheme.background.card,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: darkTheme.neon.purple,
    borderColor: darkTheme.neon.purple,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: darkTheme.text.muted,
  },
  tabButtonTextActive: {
    color: darkTheme.text.primary,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: darkTheme.text.secondary,
  },
  itemsList: {
    gap: 16,
    paddingBottom: 20,
  },
  itemCard: {
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
  reasonBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accent.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reasonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  bookmarkButton: {
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
  itemName: {
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
  reasonContainer: {
    backgroundColor: darkTheme.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.text.secondary,
    marginBottom: 4,
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
