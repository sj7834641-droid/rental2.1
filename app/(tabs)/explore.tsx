import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FLEET_DATA, Vehicle } from '@/data/fleet';
import { CategoryPills, CategoryFilter } from '@/components/CategoryPills';
import { VehicleCard } from '@/components/VehicleCard';
import { PriceBreakdownModal } from '@/components/PriceBreakdownModal';
import { FullPriceSheetModal } from '@/components/FullPriceSheetModal';

type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'depositAsc' | 'ratingDesc';

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [rateModalVehicle, setRateModalVehicle] = useState<Vehicle | null>(null);
  const [fullSheetVisible, setFullSheetVisible] = useState(false);

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'default', label: 'Recommended' },
    { key: 'depositAsc', label: 'Lowest Deposit' },
    { key: 'priceAsc', label: 'Price: Low → High' },
    { key: 'priceDesc', label: 'Price: High → Low' },
    { key: 'ratingDesc', label: 'Top Rated' },
  ];

  // Filtering & Sorting
  const filteredFleet = useMemo(() => {
    let result = FLEET_DATA.filter((v) => {
      const matchesCategory = category === 'All' || v.type === category;
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.tag && v.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'priceAsc') {
      result = [...result].sort((a, b) => a.pricing['24Hr'] - b.pricing['24Hr']);
    } else if (sortBy === 'priceDesc') {
      result = [...result].sort((a, b) => b.pricing['24Hr'] - a.pricing['24Hr']);
    } else if (sortBy === 'depositAsc') {
      result = [...result].sort((a, b) => a.deposit - b.deposit);
    } else if (sortBy === 'ratingDesc') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, searchQuery, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Rental Fleet Catalog</Text>
          <View style={styles.liveCountPill}>
            <Text style={styles.liveCountText}>10 Verified</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search Activa, Pulsar, Jupiter, Glamour..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <CategoryPills selectedCategory={category} onSelectCategory={setCategory} />

      {/* Sort Filter Chips */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <View style={styles.sortLabelWrap}>
            <Ionicons name="filter-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.sortLabel}>SORT:</Text>
          </View>
          {sortOptions.map((opt) => {
            const isSelected = sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortChip, isSelected && styles.sortChipActive]}
                activeOpacity={0.7}
                onPress={() => setSortBy(opt.key)}>
                <Text style={[styles.sortChipText, isSelected && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Fleet Count Info */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCount}>
          Showing {filteredFleet.length} vehicles
        </Text>
        <Text style={styles.hubLocationTag}>📍 Bengaluru Hub Network</Text>
      </View>

      {/* Monday to Friday Tariff Sheet Banner Button */}
      <View style={styles.sheetTriggerWrap}>
        <TouchableOpacity
          style={styles.tariffSheetTrigger}
          activeOpacity={0.85}
          onPress={() => setFullSheetVisible(true)}>
          <View style={styles.sheetIconBg}>
            <Ionicons name="newspaper-outline" size={18} color="#B45309" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTriggerTitle}>Monday to Friday (Day Price List)</Text>
            <Text style={styles.sheetTriggerSub}>Tap to view complete rate chart & deposit table</Text>
          </View>
          <View style={styles.sheetViewPill}>
            <Text style={styles.sheetViewPillText}>View Chart</Text>
            <Ionicons name="chevron-forward" size={13} color="#B45309" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Vehicles List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {filteredFleet.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={54} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching rides found</Text>
            <Text style={styles.emptyDesc}>
              Try searching for "Activa", "Jupiter", or change category filters.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setCategory('All');
                setSortBy('default');
              }}>
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFleet.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPressCard={(v) => router.push(`/vehicle/${v.id}` as any)}
              onPressRates={(v) => setRateModalVehicle(v)}
              onPressBook={(v) => router.push(`/vehicle/${v.id}` as any)}
            />
          ))
        )}
      </ScrollView>

      {/* Price Table Modal */}
      <PriceBreakdownModal
        visible={!!rateModalVehicle}
        vehicle={rateModalVehicle}
        onClose={() => setRateModalVehicle(null)}
        onSelectBooking={(v) => router.push(`/vehicle/${v.id}` as any)}
      />

      {/* Full Monday to Friday Fleet Rate Sheet Modal */}
      <FullPriceSheetModal
        visible={fullSheetVisible}
        onClose={() => setFullSheetVisible(false)}
        onSelectVehicle={(vId) => router.push(`/vehicle/${vId}` as any)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  liveCountPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveCountText: {
    color: Colors.successDark,
    fontSize: 11,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  sortContainer: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortScroll: {
    paddingHorizontal: Layout.spacing.lg,
    gap: 6,
    alignItems: 'center',
  },
  sortLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  hubLocationTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: Layout.spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
  },
  resetBtnText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  sheetTriggerWrap: {
    paddingHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.xs,
  },
  tariffSheetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 12,
  },
  sheetIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTriggerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#78350F',
  },
  sheetTriggerSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 1,
  },
  sheetViewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.radius.full,
    gap: 2,
  },
  sheetViewPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
});
