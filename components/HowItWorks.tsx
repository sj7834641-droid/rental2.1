import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Pick Station & Bike',
      desc: 'Select your Bangalore station and browse 10 verified scooters and bikes.',
      icon: 'search-outline',
    },
    {
      number: '2',
      title: 'Verify & Show OTP',
      desc: 'Quick digital KYC verification. Show your 4-digit OTP at hub to get keys.',
      icon: 'key-outline',
    },
    {
      number: '3',
      title: 'Ride & Instant Refund',
      desc: 'Hit the road! Return at the hub to get your security deposit refunded right away.',
      icon: 'checkmark-done-circle-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Rent In 3 Easy Steps</Text>
      <View style={styles.stepsWrapper}>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepCard}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{step.number}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
            <Ionicons name={step.icon as any} size={22} color={Colors.primary} />
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
  stepsWrapper: {
    gap: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
