import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FLEET_DATA } from '@/data/fleet';
import { useRental, BookingAddons } from '@/context/RentalContext';
import { AddonSelector } from '@/components/AddonSelector';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    pickupHub,
    dropHub,
    durationHours,
    calculateFare,
  } = useRental();

  const vehicle = FLEET_DATA.find((v) => v.id === Number(id));

  const [addons, setAddons] = useState<BookingAddons>({
    extraHelmet: false,
    mobileMount: false,
    damageProtection: true, // Recommended checked by default
  });

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Vehicle not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate live fare for currently selected duration
  const fare = calculateFare(vehicle, durationHours, addons);

  const handleProceedToCheckout = () => {
    // Navigate to checkout with vehicle ID and add-ons state
    router.push({
      pathname: '/booking/checkout',
      params: {
        vehicleId: vehicle.id,
        extraHelmet: addons.extraHelmet ? '1' : '0',
        mobileMount: addons.mobileMount ? '1' : '0',
        damageProtection: addons.damageProtection ? '1' : '0',
      },
    } as any);
  };

  const tariffRows = [
    { package: '3 Hours', fare: vehicle.pricing['3Hr'], km: '15 km free' },
    { package: '6 Hours', fare: vehicle.pricing['6Hr'], km: '30 km free' },
    { package: '12 Hours', fare: vehicle.pricing['12Hr'], km: '60 km free' },
    { package: '24 Hours (1 Day)', fare: vehicle.pricing['24Hr'], km: '150 km free', highlight: true },
    { package: '7 Days (Weekly)', fare: vehicle.pricing['7Days'], km: '1050 km free', highlight: true },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: vehicle.name,
          headerBackTitle: 'Fleet',
          headerRight: () => (
            <View style={styles.headerRightBadge}>
              <Text style={styles.headerRightText}>₹{vehicle.deposit} Deposit</Text>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Large Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={vehicle.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.ratingTag}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingScore}>{vehicle.rating.toFixed(1)}</Text>
            <Text style={styles.ratingTrips}>• {vehicle.tripCount} Bengaluru Trips</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Tag */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.vehicleTitle}>{vehicle.name}</Text>
              <View style={[styles.typePill, vehicle.type === 'Bike' ? styles.bikePill : styles.scootyPill]}>
                <Text style={styles.typePillText}>{vehicle.type.toUpperCase()}</Text>
              </View>
            </View>

            {vehicle.tag && (
              <View style={[styles.tagPill, vehicle.deposit === 1 && { backgroundColor: '#DC2626' }]}>
                <Text style={styles.tagPillText}>{vehicle.tag}</Text>
              </View>
            )}
            <Text style={styles.descriptionText}>{vehicle.description}</Text>
          </View>

          {/* Quick Specifications Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Ionicons name="speedometer-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>ENGINE</Text>
              <Text style={styles.specValue}>{vehicle.engineCc}</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="color-filter-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>TRANSMISSION</Text>
              <Text style={styles.specValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="leaf-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>MILEAGE</Text>
              <Text style={styles.specValue}>{vehicle.mileage}</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="water-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>FUEL TANK</Text>
              <Text style={styles.specValue}>{vehicle.fuelCapacity}</Text>
            </View>
          </View>

          {/* Complete Transparent Tariff Table */}
          <View style={styles.tariffCard}>
            <View style={styles.tariffHeader}>
              <View>
                <Text style={styles.tariffTitle}>Transparent Rental Tariffs</Text>
                <Text style={styles.tariffSub}>Exact rates as per official price sheet</Text>
              </View>
              <View style={styles.otPill}>
                <Text style={styles.otPillText}>OT: ₹{vehicle.overtime}</Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.thRow}>
                <Text style={styles.thCol}>DURATION TIER</Text>
                <Text style={[styles.thCol, { textAlign: 'center' }]}>KMS INCLUDED</Text>
                <Text style={[styles.thCol, { textAlign: 'right' }]}>RENTAL PRICE</Text>
              </View>

              {tariffRows.map((r, i) => (
                <View
                  key={r.package}
                  style={[styles.trRow, i % 2 === 1 && styles.trAlt, r.highlight && styles.trHighlight]}>
                  <Text style={[styles.tdText, r.highlight && styles.tdTextBold]}>{r.package}</Text>
                  <Text style={[styles.tdSub, { textAlign: 'center' }]}>{r.km}</Text>
                  <Text style={[styles.tdPrice, r.highlight && { color: Colors.primary }]}>₹{r.fare}</Text>
                </View>
              ))}
            </View>

            {/* Overtime & Deposit Strip */}
            <View style={styles.tariffSummaryRow}>
              <View style={styles.tariffSummaryItem}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.tariffSummaryText}>
                  Overtime: <Text style={{ fontWeight: '800' }}>₹{vehicle.overtime}</Text>
                </Text>
              </View>
              <View style={styles.tariffSummaryItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.successDark} />
                <Text style={[styles.tariffSummaryText, { color: Colors.successDark }]}>
                  Refundable Deposit: <Text style={{ fontWeight: '800' }}>₹{vehicle.deposit}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Pickup & Drop Station Details */}
          <View style={styles.hubDetailsCard}>
            <Text style={styles.hubDetailsTitle}>Pickup & Drop Hub</Text>
            <View style={styles.hubRow}>
              <View style={styles.hubIconCircle}>
                <Ionicons name="location" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hubNameText}>{pickupHub.name}</Text>
                <Text style={styles.hubAddrText}>{pickupHub.address}</Text>
                <Text style={styles.hubHoursText}>
                  🕒 {pickupHub.operatingHours} • {pickupHub.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Key Features List */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresHeading}>Vehicle Highlights & Equipment</Text>
            <View style={styles.featuresList}>
              {vehicle.features.map((feat, i) => (
                <View key={i} style={styles.featItem}>
                  <Ionicons name="checkmark-done" size={16} color={Colors.successDark} />
                  <Text style={styles.featText}>{feat}</Text>
                </View>
              ))}
              <View style={styles.featItem}>
                <Ionicons name="checkmark-done" size={16} color={Colors.successDark} />
                <Text style={styles.featText}>1 Free Sanitized ISI-certified Helmet included</Text>
              </View>
              <View style={styles.featItem}>
                <Ionicons name="checkmark-done" size={16} color={Colors.successDark} />
                <Text style={styles.featText}>24/7 Roadside Assistance support across Bengaluru</Text>
              </View>
            </View>
          </View>

          {/* Add-on Selector */}
          <AddonSelector addons={addons} onChange={setAddons} />

          {/* Required Documents Checklist */}
          <View style={styles.docsCard}>
            <Text style={styles.docsTitle}>Mandatory Requirements at Pickup</Text>
            <View style={styles.docItem}>
              <Ionicons name="id-card-outline" size={18} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.docHead}>Original Driver's License</Text>
                <Text style={styles.docSub}>Valid two-wheeler DL (Gear/Non-gear). Digital DigiLocker accepted.</Text>
              </View>
            </View>
            <View style={styles.docItem}>
              <Ionicons name="person-circle-outline" size={18} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.docHead}>Original Government Photo ID</Text>
                <Text style={styles.docSub}>Aadhaar Card, Passport, or Voter ID for identity check.</Text>
              </View>
            </View>
            <View style={styles.docItem}>
              <Ionicons name="shield-outline" size={18} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.docHead}>Rider Age 18+</Text>
                <Text style={styles.docSub}>Helmets are mandatory by Bengaluru City Traffic Police law.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomFare}>
          <Text style={styles.bottomDurationLabel}>{fare.packageTier}</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomCurrency}>₹</Text>
            <Text style={styles.bottomPrice}>{fare.totalPayable}</Text>
            <Text style={styles.bottomDepositNotice}>
              (incl. ₹{fare.deposit} deposit)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.proceedBtn}
          activeOpacity={0.85}
          onPress={handleProceedToCheckout}>
          <Text style={styles.proceedBtnText}>Book This Ride</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Layout.radius.sm,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerRightBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.radius.full,
  },
  headerRightText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  ratingTag: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingScore: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingTrips: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: Layout.spacing.lg,
  },
  titleSection: {
    marginBottom: Layout.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scootyPill: {
    backgroundColor: '#7C3AED',
  },
  bikePill: {
    backgroundColor: '#EA580C',
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  tagPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 19,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Layout.spacing.md,
  },
  specBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 3,
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
  },
  tariffCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.subtle,
  },
  tariffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  tariffTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  tariffSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  otPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  otPillText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  table: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: 6,
  },
  thRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
  },
  thCol: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trAlt: {
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
  },
  trHighlight: {
    backgroundColor: Colors.primaryMuted,
  },
  tdText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  tdTextBold: {
    fontWeight: '800',
  },
  tdSub: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tdPrice: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'right',
  },
  tariffSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tariffSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tariffSummaryText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  hubDetailsCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
  },
  hubDetailsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  hubRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  hubAddrText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hubHoursText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 3,
  },
  featuresCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
  },
  featuresHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  featuresList: {
    gap: 6,
  },
  featItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  docsCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  docsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  docHead: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  docSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Layout.shadow.elevated,
  },
  bottomFare: {
    flex: 1,
  },
  bottomDurationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  bottomCurrency: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  bottomDepositNotice: {
    fontSize: 10,
    color: Colors.successDark,
    fontWeight: '700',
    marginLeft: 6,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    gap: 6,
    ...Layout.shadow.subtle,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
