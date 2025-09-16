import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Zap, Camera, Tag, Heart, Bell, User } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';
import ChatScreen from './ChatScreen';
import TrendingScreen from './TrendingScreen';
import DiscoverScreen from './DiscoverScreen';

const { width } = Dimensions.get('window');

export default function MainScreen() {
  const [currentView, setCurrentView] = useState<'chat' | 'trending' | 'discover' | 'specials' | 'subscription'>('chat');

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>L<Text style={styles.logoX}>X</Text></Text>
            <View style={styles.logoDot1} />
            <View style={styles.logoDot2} />
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandTitle}>
              Life<Text style={styles.brandX}>X</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Explore Kiwi's hidden gems with AI</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Bell size={20} color={darkTheme.neon.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <User size={20} color={darkTheme.neon.purple} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatScreen />;
      case 'trending':
        return <TrendingScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'specials':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Specials</Text>
            <Text style={styles.placeholderText}>Coming soon! Special deals and offers will be available here.</Text>
          </View>
        );
      case 'subscription':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Coly</Text>
            <Text style={styles.placeholderText}>Coming soon! Your personalized recommendations and favorites.</Text>
          </View>
        );
      default:
        return <ChatScreen />;
    }
  };

  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      {[
        { id: 'chat' as const, icon: MessageCircle, label: 'Chat' },
        { id: 'trending' as const, icon: Zap, label: 'Trending' },
        { id: 'discover' as const, icon: Camera, label: 'Discover' },
        { id: 'specials' as const, icon: Tag, label: 'Specials' },
        { id: 'subscription' as const, icon: Heart, label: 'Coly' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navTab}
          onPress={() => setCurrentView(tab.id)}
        >
          <tab.icon 
            size={20} 
            color={currentView === tab.id ? darkTheme.neon.purple : '#9CA3AF'} 
          />
          <Text style={[
            styles.navTabText,
            { color: currentView === tab.id ? darkTheme.neon.purple : '#9CA3AF' }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={darkTheme.background.primary} />
      {renderHeader()}
      {renderCurrentView()}
      {renderBottomNavigation()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  header: {
    backgroundColor: darkTheme.background.card,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.background.glass,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: darkTheme.neon.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  logoText: {
    color: darkTheme.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  logoX: {
    fontWeight: '900',
  },
  logoDot1: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoDot2: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandInfo: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  brandX: {
    fontWeight: '900',
    color: darkTheme.neon.purple,
  },
  brandSubtitle: {
    fontSize: 12,
    color: darkTheme.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text.primary,
  },
  quickPromptsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 12,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPromptButton: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  quickPromptText: {
    fontSize: 14,
    color: darkTheme.text.primary,
    fontWeight: '500',
  },
  discoveriesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: darkTheme.neon.purple,
    fontWeight: '500',
  },
  discoveriesList: {
    gap: 8,
  },
  discoveryCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  discoveryText: {
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: darkTheme.background.card,
    borderTopWidth: 1,
    borderTopColor: darkTheme.background.glass,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
