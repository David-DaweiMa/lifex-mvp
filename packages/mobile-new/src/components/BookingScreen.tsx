import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar, Clock, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface Booking {
  id: string;
  businessName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: string;
  location: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    businessName: 'Café Supreme',
    service: 'Coffee & Workspace',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'confirmed',
    price: '$25',
    location: '118 Ponsonby Road, Auckland',
  },
  {
    id: '2',
    businessName: 'Auckland Fitness Center',
    service: 'Personal Training',
    date: '2024-01-16',
    time: '2:00 PM',
    status: 'pending',
    price: '$80',
    location: '45 Queen Street, Auckland',
  },
  {
    id: '3',
    businessName: 'Ponsonby Hair Studio',
    service: 'Haircut & Style',
    date: '2024-01-10',
    time: '11:30 AM',
    status: 'completed',
    price: '$65',
    location: '23 Ponsonby Road, Auckland',
  },
];

const filterOptions = ['All Bookings', 'Upcoming', 'Completed', 'Cancelled'];

export default function BookingScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All Bookings');

  const getFilteredBookings = () => {
    if (selectedFilter === 'All Bookings') return mockBookings;
    if (selectedFilter === 'Upcoming') return mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    if (selectedFilter === 'Completed') return mockBookings.filter(b => b.status === 'completed');
    if (selectedFilter === 'Cancelled') return mockBookings.filter(b => b.status === 'cancelled');
    return mockBookings;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={darkTheme.neon.green} />;
      case 'pending':
        return <Clock size={16} color={darkTheme.accent.yellow} />;
      case 'cancelled':
        return <XCircle size={16} color={darkTheme.accent.red} />;
      case 'completed':
        return <CheckCircle size={16} color={darkTheme.neon.green} />;
      default:
        return <AlertCircle size={16} color={darkTheme.text.muted} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return darkTheme.neon.green;
      case 'pending':
        return darkTheme.accent.yellow;
      case 'cancelled':
        return darkTheme.accent.red;
      case 'completed':
        return darkTheme.neon.green;
      default:
        return darkTheme.text.muted;
    }
  };

  const renderFilterTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {filterOptions.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterTab,
            selectedFilter === filter && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === filter && styles.activeFilterTabText,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{booking.businessName}</Text>
          <Text style={styles.serviceName}>{booking.service}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(booking.status)}
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={darkTheme.text.muted} />
          <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={darkTheme.text.muted} />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.priceText}>{booking.price}</Text>
        <View style={styles.actionButtons}>
          {booking.status === 'pending' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'confirmed' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
            <MessageCircle size={16} color={darkTheme.text.primary} />
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage your appointments and reservations</Text>
      </View>

      {renderFilterTabs()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={darkTheme.text.muted} />
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'All Bookings' 
                ? "You haven't made any bookings yet. Start exploring and book your first service!"
                : `No ${selectedFilter.toLowerCase()} bookings found.`
              }
            </Text>
          </View>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: darkTheme.background.card,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.background.glass,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: darkTheme.text.secondary,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: darkTheme.background.card,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.background.glass,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    marginRight: 8,
    backgroundColor: darkTheme.background.secondary,
  },
  activeFilterTab: {
    backgroundColor: darkTheme.neon.purple,
    borderColor: darkTheme.neon.purple,
  },
  filterTabText: {
    color: darkTheme.text.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterTabText: {
    color: darkTheme.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bookingCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: darkTheme.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.neon.purple,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    backgroundColor: darkTheme.background.secondary,
  },
  primaryButton: {
    backgroundColor: darkTheme.neon.purple,
    borderColor: darkTheme.neon.purple,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: darkTheme.text.primary,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: darkTheme.text.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: darkTheme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
