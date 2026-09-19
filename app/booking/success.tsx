import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useRental } from '@/context/RentalContext';

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeBooking, pickupHub } = useRental();

  const bookingId = (params.bookingId as string) || activeBooking?.id || 'RR-BLR-84291';
  const otp = (params.otp as string) || activeBooking?.pickupOtp || '4819';
  const vehicleName = (params.vehicleName as string) || activeBooking?.vehicle?.name || 'RapidRental Ride';

  const handleGoToRides = () => {
    router.replace('/(tabs)/rides' as any);
  };

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.congratsTitle}>Ride Confirmed!</Text>
        <Text style={styles.congratsSubtitle}>
          Your {vehicleName} is reserved and waiting for handover.
        </Text>

        {/* OTP Highlight Box */}
        <View style={styles.otpCard}>
          <Text style={styles.otpCardLabel}>YOUR VEHICLE PICKUP OTP</Text>
          <View style={styles.otpDigitsRow}>
            {otp.split('').map((digit, idx) => (
              <View key={idx} style={styles.digitBox}>
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.otpInstruction}>
            Quote this 4-digit code to the hub supervisor to claim your keys and helmet.
          </Text>
        </View>

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValueBold}>{bookingId}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle:</Text>
            <Text style={styles.detailValue}>{vehicleName}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Hub:</Text>
            <Text style={styles.detailValue}>{pickupHub.name}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Station Address:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {pickupHub.address}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hub Support Phone:</Text>
            <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: '700' }]}>
              {pickupHub.phone}
            </Text>
          </View>
        </View>

        {/* Deposit Refund Reminder */}
        <View style={styles.depositReminder}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.successDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderHead}>Refundable Security Deposit Safe</Text>
            <Text style={styles.reminderDesc}>
              Your security deposit is locked safely and will be refunded to your UPI/card upon digital handover check at drop-off.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsWrapper}>
          <TouchableOpacity
            style={styles.ridesBtn}
            activeOpacity={0.85}
            onPress={handleGoToRides}>
            <Ionicons name="speedometer" size={18} color="#FFFFFF" />
            <Text style={styles.ridesBtnText}>View in My Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            activeOpacity={0.8}
            onPress={handleGoHome}>
            <Text style={styles.homeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.elevated,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  congratsSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Layout.spacing.lg,
  },
  otpCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.card,
  },
  otpCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  otpDigitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  digitBox: {
    width: 50,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
  },
  otpInstruction: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.subtle,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    flex: 1.6,
    textAlign: 'right',
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  depositReminder: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.successLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    gap: 10,
    marginBottom: Layout.spacing.lg,
  },
  reminderHead: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.successDark,
  },
  reminderDesc: {
    fontSize: 11,
    color: Colors.successDark,
    marginTop: 2,
    lineHeight: 16,
  },
  actionsWrapper: {
    width: '100%',
    gap: 10,
  },
  ridesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Layout.radius.md,
    gap: 8,
    ...Layout.shadow.elevated,
  },
  ridesBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  homeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
