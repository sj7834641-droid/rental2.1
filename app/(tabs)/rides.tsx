import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useRental, BookingRecord } from '@/context/RentalContext';
import { ActiveRideCard } from '@/components/ActiveRideCard';

export default function RidesScreen() {
  const router = useRouter();
  const { activeBooking, bookingHistory } = useRental();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const handleDownloadInvoice = (b: BookingRecord) => {
    Alert.alert(
      'Tax Invoice Generated 📄',
      `Invoice for booking #${b.id} with GSTIN 29AAACR4819Q1ZT has been prepared.`
    );
  };

  const handleRateRide = (b: BookingRecord) => {
    Alert.alert(
      'Thank you for rating! ⭐',
      `Your 5-star rating for ${b.vehicle.name} has been recorded. You earned 50 RapidCoins!`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings & Rides</Text>
        <Text style={styles.subtitle}>
          Track active vehicle handover OTP & view trip invoices
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setTab('active')}>
            <Ionicons
              name="flash"
              size={14}
              color={tab === 'active' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, tab === 'active' && styles.tabBtnTextActive]}>
              Active Ride
            </Text>
            {activeBooking && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>1</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setTab('history')}>
            <Ionicons
              name="time"
              size={14}
              color={tab === 'history' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, tab === 'history' && styles.tabBtnTextActive]}>
              Past Trips ({bookingHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tab === 'active' ? (
          /* Active Ride View */
          activeBooking ? (
            <View style={styles.activeContainer}>
              <ActiveRideCard booking={activeBooking} />

              {/* Station Guidance Tip */}
              <View style={styles.hubGuidanceCard}>
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidanceTitle}>Pickup Checklist at Hub</Text>
                  <Text style={styles.guidanceDesc}>
                    Present your physical original Driver's License and quote OTP{' '}
                    <Text style={{ fontWeight: '800', color: Colors.primary }}>
                      {activeBooking.pickupOtp}
                    </Text>{' '}
                    to the supervisor to receive your sanitized helmet and keys.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            /* No Active Ride Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bicycle" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No active ride right now</Text>
              <Text style={styles.emptyDesc}>
                Book a scooter or motorcycle from 7 Bangalore hubs with zero/low deposit.
              </Text>
              <TouchableOpacity
                style={styles.bookNowCta}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/explore' as any)}>
                <Text style={styles.bookNowCtaText}>Browse Available Fleet</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )
        ) : (
          /* Past Trips View */
          <View style={styles.historyContainer}>
            {bookingHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No past trip records</Text>
                <Text style={styles.emptyDesc}>
                  Your completed trips and invoices will be stored here.
                </Text>
              </View>
            ) : (
              bookingHistory.map((b) => {
                const isCancelled = b.status === 'CANCELLED';
                return (
                  <View key={b.id} style={styles.historyCard}>
                    <View style={styles.historyTopRow}>
                      <View>
                        <Text style={styles.historyVehicleName}>{b.vehicle.name}</Text>
                        <Text style={styles.historyId}>{b.id}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isCancelled ? styles.statusCancelled : styles.statusCompleted,
                        ]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCancelled && { color: Colors.danger },
                          ]}>
                          {b.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyDetailsBox}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pickup Hub:</Text>
                        <Text style={styles.detailValue}>{b.pickupHub.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Rental Period:</Text>
                        <Text style={styles.detailValue}>{b.hours} Hours ({b.fare.packageTier})</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Fare Paid:</Text>
                        <Text style={[styles.detailValue, { fontWeight: '800' }]}>
                          ₹{b.fare.totalPayable}
                        </Text>
                      </View>
                    </View>

                    {/* Deposit refund strip */}
                    <View style={styles.refundConfirmedStrip}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.successDark} />
                      <Text style={styles.refundConfirmedText}>
                        Deposit of ₹{b.fare.deposit} refunded to original payment method
                      </Text>
                    </View>

                    {/* History Actions */}
                    <View style={styles.historyActionsRow}>
                      <TouchableOpacity
                        style={styles.invoiceBtn}
                        activeOpacity={0.8}
                        onPress={() => handleDownloadInvoice(b)}>
                        <Ionicons name="receipt-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.invoiceBtnText}>Invoice</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rateBtn}
                        activeOpacity={0.8}
                        onPress={() => handleRateRide(b)}>
                        <Ionicons name="star-outline" size={14} color={Colors.primary} />
                        <Text style={styles.rateBtnText}>Rate Ride</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Layout.spacing.md,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Layout.radius.sm,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    ...Layout.shadow.subtle,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  badgeCount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeCountText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    paddingBottom: 40,
  },
  activeContainer: {},
  hubGuidanceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  guidanceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  guidanceDesc: {
    fontSize: 11,
    color: Colors.text,
    marginTop: 3,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Layout.spacing.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  bookNowCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    marginTop: 18,
    gap: 8,
    ...Layout.shadow.elevated,
  },
  bookNowCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  historyContainer: {
    gap: Layout.spacing.md,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyVehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  historyId: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: Colors.successLight,
  },
  statusCancelled: {
    backgroundColor: Colors.dangerLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.successDark,
  },
  historyDetailsBox: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    padding: Layout.spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '600',
  },
  refundConfirmedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    gap: 6,
    marginBottom: 10,
  },
  refundConfirmedText: {
    color: Colors.successDark,
    fontSize: 10,
    fontWeight: '700',
  },
  historyActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  invoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Layout.radius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  invoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Layout.radius.sm,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    gap: 4,
  },
  rateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
