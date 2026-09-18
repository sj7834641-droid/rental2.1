import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FLEET_DATA, Vehicle } from '@/data/fleet';
import { useRental } from '@/context/RentalContext';
import { HeaderBar } from '@/components/HeaderBar';
import { SearchDurationBar } from '@/components/SearchDurationBar';
import { CategoryPills, CategoryFilter } from '@/components/CategoryPills';
import { VehicleCard } from '@/components/VehicleCard';
import { PriceBreakdownModal } from '@/components/PriceBreakdownModal';
import { ActiveRideCard } from '@/components/ActiveRideCard';
import { TrustBadges } from '@/components/TrustBadges';
import { HowItWorks } from '@/components/HowItWorks';
import { FAQAccordion } from '@/components/FAQAccordion';
import { FullPriceSheetModal } from '@/components/FullPriceSheetModal';

export default function HomeScreen() {
  const router = useRouter();
  const { activeBooking } = useRental();

  const [category, setCategory] = useState<CategoryFilter>('All');
  const [selectedVehicleForRates, setSelectedVehicleForRates] = useState<Vehicle | null>(null);
  const [fullSheetVisible, setFullSheetVisible] = useState(false);

  // Filter vehicles
  const filteredVehicles = FLEET_DATA.filter((v) => {
    if (category === 'All') return true;
    return v.type === category;
  });

  const handleCardPress = (v: Vehicle) => {
    router.push(`/vehicle/${v.id}` as any);
  };

  const handleBookPress = (v: Vehicle) => {
    router.push(`/vehicle/${v.id}` as any);
  };

  const handleRatesPress = (v: Vehicle) => {
    setSelectedVehicleForRates(v);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Top Header */}
      <HeaderBar
        onOpenHelp={() => router.push('/modal' as any)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Active Booking Banner (Rentelo / Bounce pattern) */}
        {activeBooking && (
          <View style={styles.activeRideSection}>
            <Text style={styles.sectionHeading}>Your Live Ride</Text>
            <ActiveRideCard booking={activeBooking} />
          </View>
        )}

        {/* Hero Search & Duration Widget */}
        <SearchDurationBar
          onSearchPress={() => router.push('/(tabs)/explore' as any)}
        />

        {/* Promo Banner Strip */}
        <View style={styles.promoStrip}>
          <TouchableOpacity
            style={styles.promoCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/explore' as any)}>
            <View style={styles.promoIconBg}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.promoTitle}>₹1 SECURITY DEPOSIT</Text>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>LIMITED</Text>
                </View>
              </View>
              <Text style={styles.promoDesc}>
                Rent TVS Jupiter with just ₹1 refundable deposit!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Available Fleet In Bengaluru</Text>
            <Text style={styles.sectionSubtitle}>
              All 10 bikes ready for instant hub pickup
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore' as any)}
            style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <CategoryPills
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

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
              <Text style={styles.sheetTriggerSub}>Official rates & deposit matrix for all 10 vehicles</Text>
            </View>
            <View style={styles.sheetViewPill}>
              <Text style={styles.sheetViewPillText}>View Chart</Text>
              <Ionicons name="chevron-forward" size={13} color="#B45309" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Vehicle Cards List */}
        <View style={styles.fleetContainer}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPressCard={handleCardPress}
              onPressRates={handleRatesPress}
              onPressBook={handleBookPress}
            />
          ))}
        </View>

        {/* Trust & Value Proposition */}
        <TrustBadges />

        {/* 3-Step Process */}
        <HowItWorks />

        {/* FAQs Accordion */}
        <FAQAccordion />

        {/* Footer info */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <Ionicons name="bicycle" size={20} color={Colors.primary} />
            <Text style={styles.footerBrandText}>RapidRental India</Text>
          </View>
          <Text style={styles.footerSubText}>
            Affordable, reliable two-wheeler mobility for Bengaluru.
          </Text>
          <Text style={styles.footerCopyright}>
            © 2026 RapidRental Technologies Pvt. Ltd. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Single Vehicle Price Modal */}
      <PriceBreakdownModal
        visible={!!selectedVehicleForRates}
        vehicle={selectedVehicleForRates}
        onClose={() => setSelectedVehicleForRates(null)}
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
  scrollContent: {
    paddingBottom: 40,
  },
  activeRideSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  promoStrip: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xs,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: '#FECDD3',
    gap: Layout.spacing.md,
  },
  promoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  promoBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  promoDesc: {
    fontSize: 11,
    color: Colors.text,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  fleetContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Layout.spacing.lg,
    backgroundColor: Colors.card,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  footerBrandText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  footerSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
  },
  sheetTriggerWrap: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
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
