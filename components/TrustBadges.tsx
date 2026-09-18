import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: 'shield-checkmark',
      color: '#10B981',
      title: 'Zero / Low Deposit',
      desc: 'Starts at ₹1 • Instant refund on drop-off',
    },
    {
      icon: 'fitness',
      color: '#3B82F6',
      title: 'Free Sanitized Helmet',
      desc: 'ISI certified • Cleaned before every ride',
    },
    {
      icon: 'headset',
      color: '#EF4444',
      title: '24/7 Roadside Assist',
      desc: 'Rapid support across all Bengaluru',
    },
    {
      icon: 'construct',
      color: '#8B5CF6',
      title: '100% Serviced Fleet',
      desc: 'Multipoint checked brakes & tyres',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Why Bengaluru Rides RapidRental</Text>
      <View style={styles.grid}>
        {badges.map((b, i) => (
          <View key={i} style={styles.badgeItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${b.color}15` }]}>
              <Ionicons name={b.icon as any} size={20} color={b.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  grid: {
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Layout.shadow.subtle,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
