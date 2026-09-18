import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FLEET_DATA, SCOOTY_COUNT, BIKE_COUNT, TOTAL_VEHICLE_COUNT } from '@/data/fleet';

export type CategoryFilter = 'All' | 'Scooty' | 'Bike';

interface CategoryPillsProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: { key: CategoryFilter; label: string; count: number; icon: any }[] = [
    { key: 'All', label: 'All Fleet', count: TOTAL_VEHICLE_COUNT, icon: 'grid-outline' },
    { key: 'Scooty', label: 'Scooters', count: SCOOTY_COUNT, icon: 'speedometer-outline' },
    { key: 'Bike', label: 'Motorcycles', count: BIKE_COUNT, icon: 'bicycle-outline' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.key)}>
              <Ionicons
                name={cat.icon}
                size={16}
                color={isActive ? '#FFFFFF' : Colors.textSecondary}
              />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {cat.label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {cat.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Layout.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 7,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Layout.shadow.subtle,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
