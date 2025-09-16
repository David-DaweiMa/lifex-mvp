import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  Crown,
  Check,
  ArrowLeft,
  Star,
  Zap,
  MessageCircle,
  TrendingUp,
  Store,
  CreditCard,
  Users,
  Sparkles,
  Heart,
  Building
} from 'lucide-react-native';
import { darkTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

interface MembershipPlansScreenProps {
  onNavigateBack?: () => void;
}

export default function MembershipPlansScreen({ onNavigateBack }: MembershipPlansScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('essential');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Star,
      color: darkTheme.text.secondary,
      features: [
        '5 AI chat messages per day',
        'Basic business discovery',
        'Limited recommendations',
        'Standard support'
      ],
      limitations: [
        'No trending insights',
        'No premium features',
        'Limited AI interactions'
      ]
    },
    {
      id: 'essential',
      name: 'Essential',
      price: '$9.99',
      period: 'per month',
      description: 'Most popular for regular users',
      icon: Zap,
      color: darkTheme.neon.purple,
      features: [
        '50 AI chat messages per day',
        'Full business discovery',
        'Personalized recommendations',
        'Trending insights',
        'Priority support',
        'Advanced search filters'
      ],
      limitations: [
        'Limited premium features',
        'Standard AI model'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: 'per month',
      description: 'For power users and businesses',
      icon: Crown,
      color: darkTheme.accent.yellow,
      features: [
        'Unlimited AI chat messages',
        'Advanced business analytics',
        'Premium AI recommendations',
        'Real-time trending data',
        'Priority booking assistance',
        'Custom business insights',
        'API access',
        'White-label options'
      ],
      limitations: []
    }
  ];

  const renderPlanCard = (plan: any) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlanCard,
        plan.popular && styles.popularPlanCard,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
          <plan.icon size={24} color={plan.color} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>
      </View>

      <View style={styles.planPricing}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPeriod}>/{plan.period}</Text>
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Check size={16} color={darkTheme.neon.green} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {plan.limitations.length > 0 && (
        <View style={styles.planLimitations}>
          {plan.limitations.map((limitation: string, index: number) => (
            <View key={index} style={styles.limitationItem}>
              <Text style={styles.limitationText}>• {limitation}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderComparisonTable = () => (
    <View style={styles.comparisonSection}>
      <Text style={styles.sectionTitle}>Plan Comparison</Text>
      <View style={styles.comparisonTable}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonHeaderText}>Features</Text>
          <Text style={styles.comparisonHeaderText}>Free</Text>
          <Text style={styles.comparisonHeaderText}>Essential</Text>
          <Text style={styles.comparisonHeaderText}>Premium</Text>
        </View>
        
        {[
          { feature: 'AI Chat Messages', free: '5/day', essential: '50/day', premium: 'Unlimited' },
          { feature: 'Business Discovery', free: 'Basic', essential: 'Full', premium: 'Advanced' },
          { feature: 'Recommendations', free: 'Limited', essential: 'Personalized', premium: 'Premium AI' },
          { feature: 'Trending Insights', free: 'No', essential: 'Yes', premium: 'Real-time' },
          { feature: 'Support', free: 'Standard', essential: 'Priority', premium: 'Priority' },
          { feature: 'API Access', free: 'No', essential: 'No', premium: 'Yes' },
        ].map((row, index) => (
          <View key={index} style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>{row.feature}</Text>
            <Text style={styles.comparisonValue}>{row.free}</Text>
            <Text style={styles.comparisonValue}>{row.essential}</Text>
            <Text style={styles.comparisonValue}>{row.premium}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onNavigateBack && (
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <ArrowLeft size={24} color={darkTheme.text.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>Unlock the full potential of LifeX</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        {renderComparisonTable()}

        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>
              {selectedPlan === 'free' ? 'Continue with Free' : `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}`}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.ctaNote}>
            {selectedPlan === 'free' 
              ? 'You can upgrade anytime from your profile'
              : 'Cancel anytime. No hidden fees.'
            }
          </Text>
        </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  plansContainer: {
    paddingVertical: 20,
  },
  planCard: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: darkTheme.background.glass,
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: darkTheme.neon.purple,
  },
  popularPlanCard: {
    borderColor: darkTheme.neon.purple,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: darkTheme.neon.purple,
    borderRadius: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  popularBadgeText: {
    color: darkTheme.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: darkTheme.text.secondary,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  planPeriod: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: darkTheme.text.primary,
    flex: 1,
  },
  planLimitations: {
    marginTop: 8,
  },
  limitationItem: {
    marginBottom: 4,
  },
  limitationText: {
    fontSize: 12,
    color: darkTheme.text.muted,
  },
  comparisonSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
    marginBottom: 16,
  },
  comparisonTable: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: darkTheme.background.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.background.glass,
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 14,
    color: darkTheme.text.primary,
  },
  comparisonValue: {
    flex: 1,
    fontSize: 14,
    color: darkTheme.text.secondary,
    textAlign: 'center',
  },
  ctaSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: darkTheme.neon.purple,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  ctaButtonText: {
    color: darkTheme.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaNote: {
    fontSize: 12,
    color: darkTheme.text.muted,
    textAlign: 'center',
  },
});
