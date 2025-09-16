import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  Heart, 
  Star, 
  MapPin, 
  Calendar, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit3,
  Camera,
  Mail,
  Phone
} from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  totalReviews: number;
  totalBookmarks: number;
  favoriteCategories: string[];
  location: string;
}

const mockUserProfile: UserProfile = {
  id: '1',
  name: 'David Ma',
  email: 'david@example.com',
  phone: '+64 21 123 4567',
  avatar: 'DM',
  joinDate: '2025-01-01',
  totalReviews: 24,
  totalBookmarks: 12,
  favoriteCategories: ['Coffee', 'Fitness', 'Beauty'],
  location: 'Auckland, New Zealand',
};

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditProfile = () => {
    setIsEditing(true);
    // TODO: Implement profile editing
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // TODO: Implement logout
          console.log('Logout pressed');
        }},
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{mockUserProfile.avatar}</Text>
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={16} color={darkTheme.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{mockUserProfile.name}</Text>
        <Text style={styles.userLocation}>{mockUserProfile.location}</Text>
        <Text style={styles.joinDate}>Member since {new Date(mockUserProfile.joinDate).toLocaleDateString()}</Text>
      </View>
      
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Edit3 size={16} color={darkTheme.neon.purple} />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{mockUserProfile.totalReviews}</Text>
        <Text style={styles.statLabel}>Reviews</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{mockUserProfile.totalBookmarks}</Text>
        <Text style={styles.statLabel}>Bookmarks</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{mockUserProfile.favoriteCategories.length}</Text>
        <Text style={styles.statLabel}>Categories</Text>
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <View style={styles.contactItem}>
        <Mail size={16} color={darkTheme.text.muted} />
        <Text style={styles.contactText}>{mockUserProfile.email}</Text>
      </View>
      <View style={styles.contactItem}>
        <Phone size={16} color={darkTheme.text.muted} />
        <Text style={styles.contactText}>{mockUserProfile.phone}</Text>
      </View>
    </View>
  );

  const renderFavoriteCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Favorite Categories</Text>
      <View style={styles.categoriesContainer}>
        {mockUserProfile.favoriteCategories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMenuSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings & Preferences</Text>
      
      <TouchableOpacity style={styles.menuItem}>
        <Settings size={20} color={darkTheme.text.muted} />
        <Text style={styles.menuText}>Account Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Bell size={20} color={darkTheme.text.muted} />
        <Text style={styles.menuText}>Notifications</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Shield size={20} color={darkTheme.text.muted} />
        <Text style={styles.menuText}>Privacy & Security</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <HelpCircle size={20} color={darkTheme.text.muted} />
        <Text style={styles.menuText}>Help & Support</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
        <LogOut size={20} color={darkTheme.accent.red} />
        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Stats Section */}
        {renderStatsSection()}

        {/* Contact Information */}
        {renderContactInfo()}

        {/* Favorite Categories */}
        {renderFavoriteCategories()}

        {/* Menu Section */}
        {renderMenuSection()}
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
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: darkTheme.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: darkTheme.neon.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: darkTheme.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: darkTheme.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: darkTheme.text.secondary,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: darkTheme.text.muted,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: darkTheme.neon.purple,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: darkTheme.neon.purple,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: darkTheme.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: darkTheme.text.muted,
  },
  statDivider: {
    width: 1,
    backgroundColor: darkTheme.background.glass,
    marginVertical: 8,
  },
  section: {
    backgroundColor: darkTheme.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: darkTheme.neon.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: darkTheme.text.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: darkTheme.text.primary,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: darkTheme.background.glass,
    marginTop: 8,
    paddingTop: 20,
  },
  logoutText: {
    color: darkTheme.accent.red,
  },
});
