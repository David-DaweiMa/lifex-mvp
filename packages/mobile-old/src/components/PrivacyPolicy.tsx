import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Shield, Eye, Database, Cookie } from 'lucide-react-native';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          {/* @ts-ignore */}
          <ArrowLeft size={20} color="#71717a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Last updated: December 19, 2024</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Database size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Personal Information</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Name, email address, and contact information</Text>
            <Text style={styles.listItem}>• Account preferences and settings</Text>
            <Text style={styles.listItem}>• Location data (with your permission) - used for location-based recommendations</Text>
            <Text style={styles.listItem}>• Communication history and support interactions</Text>
            <Text style={styles.listItem}>• Camera access (with your permission) - used for photo capture features</Text>
            <Text style={styles.listItem}>• Device information and app usage analytics</Text>
          </View>

          <Text style={styles.subsectionTitle}>Business Information (Business Owners)</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Business name, category, and description</Text>
            <Text style={styles.listItem}>• Business contact information and hours</Text>
            <Text style={styles.listItem}>• Service offerings and pricing</Text>
            <Text style={styles.listItem}>• Business registration and verification documents</Text>
          </View>

          <Text style={styles.subsectionTitle}>Usage Information</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• App usage patterns and preferences</Text>
            <Text style={styles.listItem}>• Search queries and interactions</Text>
            <Text style={styles.listItem}>• Device information and IP address</Text>
            <Text style={styles.listItem}>• Cookies and similar tracking technologies</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Eye size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Provide and improve our platform services</Text>
            <Text style={styles.listItem}>• Connect users with relevant local businesses</Text>
            <Text style={styles.listItem}>• Process bookings and transactions</Text>
            <Text style={styles.listItem}>• Send important account and service updates</Text>
            <Text style={styles.listItem}>• Provide customer support</Text>
            <Text style={styles.listItem}>• Comply with legal obligations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share information in the following circumstances:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• With business account holders when you make bookings or inquiries</Text>
            <Text style={styles.listItem}>• With your explicit consent</Text>
            <Text style={styles.listItem}>• To comply with legal requirements</Text>
            <Text style={styles.listItem}>• To protect our rights and safety</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Cookie size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>4. Cookies and Tracking</Text>
          </View>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Shield size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>5. Data Security</Text>
          </View>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            Under New Zealand privacy laws, you have the right to:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Access your personal information</Text>
            <Text style={styles.listItem}>• Correct inaccurate information</Text>
            <Text style={styles.listItem}>• Request deletion of your data</Text>
            <Text style={styles.listItem}>• Object to certain uses of your information</Text>
            <Text style={styles.listItem}>• Data portability</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            LifeX is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            For privacy-related questions or to exercise your rights, contact us at:
            {'\n'}Email: privacy@lifex.co.nz
            {'\n'}Website: https://www.lifex.co.nz
            {'\n'}Address: Auckland, New Zealand
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#71717a',
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#a855f7',
    marginLeft: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    marginBottom: 12,
  },
  list: {
    marginLeft: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    marginBottom: 4,
  },
});

