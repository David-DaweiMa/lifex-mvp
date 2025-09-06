import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Shield, Users, Briefcase } from 'lucide-react-native';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          {/* @ts-ignore */}
          <ArrowLeft size={20} color="#71717a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>Last updated: December 19, 2024</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using LifeX, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Platform Services</Text>
          <Text style={styles.paragraph}>
            LifeX provides a platform connecting consumers with local businesses in New Zealand, offering:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Business discovery and recommendation services</Text>
            <Text style={styles.listItem}>• AI-powered life assistant</Text>
            <Text style={styles.listItem}>• Booking and review systems</Text>
            <Text style={styles.listItem}>• Business management tools for registered businesses</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Users size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>3. Personal Account Terms</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>User Responsibilities</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Provide accurate and up-to-date information</Text>
            <Text style={styles.listItem}>• Use the platform in accordance with New Zealand laws</Text>
            <Text style={styles.listItem}>• Respect other users and businesses</Text>
            <Text style={styles.listItem}>• Not engage in fraudulent or harmful activities</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* @ts-ignore */}
            <Briefcase size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>4. Business Account Terms</Text>
          </View>
          
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              {/* @ts-ignore */}
              <Shield size={16} color="#fbbf24" />
              <Text style={styles.warningTitle}>Legal Compliance Requirements</Text>
            </View>
            <Text style={styles.warningText}>
              All business account holders must comply with New Zealand's Consumer Guarantees Act (CGA) and related legislation.
            </Text>
          </View>

          <Text style={styles.subsectionTitle}>Business Account Obligations</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Service Quality:</Text> Provide services with reasonable skill and care</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Fitness for Purpose:</Text> Ensure services are fit for their intended purpose</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Timeliness:</Text> Complete services within a reasonable timeframe</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Fair Pricing:</Text> Charge reasonable prices for services provided</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Accurate Information:</Text> Provide truthful business information</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Professional Conduct:</Text> Maintain professional standards in all interactions</Text>
          </View>

          <Text style={styles.subsectionTitle}>Business Listing Requirements</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Business must be legally registered in New Zealand</Text>
            <Text style={styles.listItem}>• Must have appropriate licenses for your service category</Text>
            <Text style={styles.listItem}>• Insurance requirements may apply for certain services</Text>
            <Text style={styles.listItem}>• Regular verification of business status may be required</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            LifeX acts as a platform connecting users with businesses. We are not responsible for the quality, safety, or legality of services provided by business owners listed on our platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. App Store Terms</Text>
          <Text style={styles.paragraph}>
            This app is distributed through the Apple App Store and Google Play Store. By downloading and using this app, you agree to:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Comply with the respective app store terms of service</Text>
            <Text style={styles.listItem}>• Use the app only on devices you own or control</Text>
            <Text style={styles.listItem}>• Not attempt to reverse engineer or modify the app</Text>
            <Text style={styles.listItem}>• Respect intellectual property rights</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or via email. Continued use of the service after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service, please contact us at:
            {'\n'}Email: legal@lifex.co.nz
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
  bold: {
    fontWeight: '600',
    color: '#ffffff',
  },
  warningBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#fbbf24',
    lineHeight: 16,
  },
});

