import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FLEET_DATA } from '@/data/fleet';
import { useRental, BookingAddons } from '@/context/RentalContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    pickupHub,
    dropHub,
    pickupDate,
    dropDate,
    durationHours,
    calculateFare,
    confirmBooking,
    userProfile,
    coupons,
  } = useRental();

  const vehicleId = Number(params.vehicleId);
  const vehicle = FLEET_DATA.find((v) => v.id === vehicleId);

  const [addons, setAddons] = useState<BookingAddons>({
    extraHelmet: params.extraHelmet === '1',
    mobileMount: params.mobileMount === '1',
    damageProtection: params.damageProtection === '1',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>('RAPID100'); // Default welcome promo

  const [riderName, setRiderName] = useState(userProfile.name);
  const [riderPhone, setRiderPhone] = useState(userProfile.phone);
  const [dlNumber, setDlNumber] = useState(userProfile.dlNumber);
  const [dlUploaded, setDlUploaded] = useState(true); // Pre-verified

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'hub'>('upi');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>No vehicle selected for booking.</Text>
      </SafeAreaView>
    );
  }

  // Calculate fare with active coupons and add-ons
  const fare = calculateFare(vehicle, durationHours, addons, appliedCoupon);

  const handleApplyCoupon = (code: string) => {
    const match = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (match) {
      setAppliedCoupon(match.code);
      setCouponInput('');
      Alert.alert('Coupon Applied! 🎉', `Promo ${match.code} applied successfully.`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid promo code like RAPID100 or RENTELO20');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
  };

  const handleSimulateDlUpload = () => {
    setDlUploaded(true);
    Alert.alert('Document Attached', 'Driving License front and back verified.');
  };

  const handleConfirmAndPay = () => {
    if (!agreedToTerms) {
      Alert.alert('Accept Terms', 'Please accept the rental terms & conditions to proceed.');
      return;
    }

    if (!riderName.trim() || !riderPhone.trim() || !dlNumber.trim()) {
      Alert.alert('Missing Details', 'Please complete your name, phone number, and DL number.');
      return;
    }

    // Create booking in RentalContext
    const newBooking = confirmBooking(vehicle, addons, appliedCoupon, {
      name: riderName,
      phone: riderPhone,
      dlNumber: dlNumber,
    });

    // Navigate to success screen
    router.replace({
      pathname: '/booking/success',
      params: {
        bookingId: newBooking.id,
        otp: newBooking.pickupOtp,
        vehicleName: vehicle.name,
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Booking Summary',
          headerBackTitle: 'Details',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Summary Card */}
        <View style={styles.vehicleSummaryCard}>
          <Image source={vehicle.image} style={styles.vehicleImg} resizeMode="cover" />
          <View style={styles.vehicleSummaryInfo}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.vehicleNameText}>{vehicle.name}</Text>
              <View style={styles.scootyBadge}>
                <Text style={styles.scootyBadgeText}>{vehicle.type.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.specsSubText}>
              {vehicle.engineCc} • {vehicle.transmission} • {vehicle.mileage}
            </Text>
            <View style={styles.tagStrip}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.successDark} />
              <Text style={styles.tagStripText}>1 Free Helmet Included</Text>
            </View>
          </View>
        </View>

        {/* Stations & Duration Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineRow}>
            <View style={styles.iconCol}>
              <View style={[styles.timeDot, { backgroundColor: Colors.primary }]} />
              <View style={styles.timeLine} />
              <View style={[styles.timeDot, { backgroundColor: Colors.success }]} />
            </View>

            <View style={styles.stationsCol}>
              <View style={styles.stationBlock}>
                <Text style={styles.stationMeta}>PICKUP HUB & TIME</Text>
                <Text style={styles.stationName}>{pickupHub.name}</Text>
                <Text style={styles.stationTime}>
                  {pickupDate.toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>

              <View style={[styles.stationBlock, { marginTop: 14 }]}>
                <Text style={styles.stationMeta}>DROP-OFF HUB & TIME</Text>
                <Text style={styles.stationName}>{dropHub.name}</Text>
                <Text style={styles.stationTime}>
                  {dropDate.toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.durationFooter}>
            <Ionicons name="hourglass-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.durationFooterText}>
              Total Rental Time: <Text style={{ fontWeight: '800', color: Colors.text }}>{durationHours} Hours</Text> ({fare.packageTier})
            </Text>
          </View>
        </View>

        {/* Promo Code Engine */}
        <View style={styles.couponCard}>
          <Text style={styles.sectionHeading}>Apply Promo Coupon</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.couponAppliedLeft}>
                <Ionicons name="pricetag" size={16} color={Colors.successDark} />
                <Text style={styles.appliedCouponCode}>{appliedCoupon}</Text>
                <Text style={styles.appliedCouponSaving}>Saved ₹{fare.discount}!</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon (e.g. RAPID100)"
                placeholderTextColor={Colors.textMuted}
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                activeOpacity={0.8}
                onPress={() => handleApplyCoupon(couponInput)}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Coupons Suggestions */}
          {!appliedCoupon && (
            <View style={styles.couponSuggestions}>
              {coupons.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.couponChip}
                  onPress={() => handleApplyCoupon(c.code)}>
                  <Text style={styles.couponChipText}>{c.code}</Text>
                  <Text style={styles.couponChipDesc}>({c.title})</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Transparent Price Breakdown (Rentelo Itemized Bill) */}
        <View style={styles.billCard}>
          <Text style={styles.sectionHeading}>Itemized Fare Breakdown</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Base Rental ({fare.packageTier})</Text>
            <Text style={styles.billValue}>₹{fare.baseFare}</Text>
          </View>

          {fare.overtimeCost > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Overtime Charges ({fare.overtimeHours}h)</Text>
              <Text style={styles.billValue}>₹{fare.overtimeCost}</Text>
            </View>
          )}

          {fare.addonsCost > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Selected Add-ons</Text>
              <Text style={styles.billValue}>+₹{fare.addonsCost}</Text>
            </View>
          )}

          {fare.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: Colors.successDark }]}>
                Coupon Discount ({appliedCoupon})
              </Text>
              <Text style={[styles.billValue, { color: Colors.successDark, fontWeight: '800' }]}>
                -₹{fare.discount}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Applicable GST (18%)</Text>
            <Text style={styles.billValue}>₹{fare.taxGst}</Text>
          </View>

          <View style={styles.billDivider} />

          {/* Security Deposit (Clearly highlighted as refundable) */}
          <View style={[styles.billRow, styles.depositRow]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.successDark} />
                <Text style={styles.depositBillLabel}>Refundable Security Deposit</Text>
              </View>
              <Text style={styles.depositBillSub}>
                100% refunded to your source account upon return
              </Text>
            </View>
            <Text style={styles.depositBillValue}>₹{fare.deposit}</Text>
          </View>

          <View style={styles.billDivider} />

          {/* Total Payable Now */}
          <View style={[styles.billRow, styles.totalRow]}>
            <View>
              <Text style={styles.totalLabel}>Total Payable Now</Text>
              <Text style={styles.totalSub}>(Fare + GST + Refundable Deposit)</Text>
            </View>
            <Text style={styles.totalAmount}>₹{fare.totalPayable}</Text>
          </View>
        </View>

        {/* Rider Details & Digital KYC */}
        <View style={styles.kycCard}>
          <View style={styles.kycHeaderRow}>
            <Text style={styles.sectionHeading}>Rider Information & KYC</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedTagText}>KYC VERIFIED</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rider Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={riderName}
              onChangeText={setRiderName}
              placeholder="Full name as on DL"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={riderPhone}
              onChangeText={setRiderPhone}
              keyboardType="phone-pad"
              placeholder="+91..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Driving License Number</Text>
            <TextInput
              style={styles.textInput}
              value={dlNumber}
              onChangeText={setDlNumber}
              placeholder="e.g. KA01 20210048912"
            />
          </View>

          {/* DL Document Upload Simulation */}
          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={handleSimulateDlUpload}>
            <Ionicons
              name={dlUploaded ? 'checkmark-circle' : 'camera-outline'}
              size={24}
              color={dlUploaded ? Colors.successDark : Colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>
                {dlUploaded ? 'Driving License Front & Back Attached' : 'Upload Driving License Photo'}
              </Text>
              <Text style={styles.uploadSub}>
                {dlUploaded ? 'Tap to replace photo' : 'Clear photo of physical DL or DigiLocker card'}
              </Text>
            </View>
            <Ionicons name="cloud-upload-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionHeading}>Select Payment Option</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('upi')}>
            <Ionicons
              name={paymentMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'upi' ? Colors.primary : Colors.textMuted}
            />
            <View style={styles.paymentIconBg}>
              <Ionicons name="flash" size={16} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>UPI Instant Payment</Text>
              <Text style={styles.paymentSub}>Google Pay, PhonePe, Paytm, BHIM</Text>
            </View>
            <View style={styles.fastPill}>
              <Text style={styles.fastPillText}>FASTEST</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('card')}>
            <Ionicons
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'card' ? Colors.primary : Colors.textMuted}
            />
            <View style={styles.paymentIconBg}>
              <Ionicons name="card" size={16} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Credit / Debit Card</Text>
              <Text style={styles.paymentSub}>Visa, Mastercard, RuPay</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'hub' && styles.paymentOptionActive]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('hub')}>
            <Ionicons
              name={paymentMethod === 'hub' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'hub' ? Colors.primary : Colors.textMuted}
            />
            <View style={styles.paymentIconBg}>
              <Ionicons name="storefront" size={16} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Pay at Hub Station</Text>
              <Text style={styles.paymentSub}>Cash or Card swipe at handover</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms Agreement Checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.8}
          onPress={() => setAgreedToTerms(!agreedToTerms)}>
          <Ionicons
            name={agreedToTerms ? 'checkbox' : 'square-outline'}
            size={20}
            color={agreedToTerms ? Colors.primary : Colors.textMuted}
          />
          <Text style={styles.termsText}>
            I accept the <Text style={{ color: Colors.primary, fontWeight: '700' }}>RapidRental Terms</Text> & declare that I possess a valid original driving license.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Checkout Bar */}
      <View style={styles.stickyFooter}>
        <View>
          <Text style={styles.footerPayableLabel}>TOTAL PAYABLE</Text>
          <View style={styles.footerPriceRow}>
            <Text style={styles.footerCurrency}>₹</Text>
            <Text style={styles.footerAmount}>{fare.totalPayable}</Text>
          </View>
          <Text style={styles.footerRefundHint}>
            (Includes ₹{fare.deposit} refundable deposit)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmPayBtn}
          activeOpacity={0.85}
          onPress={handleConfirmAndPay}>
          <Text style={styles.confirmPayText}>Confirm & Pay</Text>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
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
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: 110,
    gap: Layout.spacing.md,
  },
  vehicleSummaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    alignItems: 'center',
    ...Layout.shadow.subtle,
  },
  vehicleImg: {
    width: 80,
    height: 64,
    borderRadius: Layout.radius.sm,
    backgroundColor: Colors.background,
  },
  vehicleSummaryInfo: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  scootyBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scootyBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  specsSubText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tagStripText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.successDark,
  },
  timelineCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCol: {
    alignItems: 'center',
    width: 14,
    paddingTop: 4,
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  stationsCol: {
    flex: 1,
  },
  stationBlock: {},
  stationMeta: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  stationName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  stationTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  durationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    padding: 8,
    marginTop: Layout.spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationFooterText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  couponCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.successLight,
    padding: 10,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  couponAppliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedCouponCode: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.successDark,
  },
  appliedCouponSaving: {
    fontSize: 11,
    color: Colors.successDark,
    fontWeight: '600',
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  couponSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  couponChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  couponChipDesc: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  billCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  depositRow: {
    backgroundColor: Colors.successLight,
    padding: 8,
    borderRadius: Layout.radius.sm,
    marginVertical: 4,
  },
  depositBillLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.successDark,
  },
  depositBillSub: {
    fontSize: 10,
    color: Colors.successDark,
    marginTop: 1,
  },
  depositBillValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.successDark,
  },
  totalRow: {
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  totalSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  kycCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: Layout.spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 9,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Layout.spacing.md,
    gap: 10,
    marginTop: 4,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  uploadSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Layout.shadow.subtle,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  paymentIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  fastPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fastPillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  stickyFooter: {
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
  footerPayableLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerCurrency: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  footerAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  footerRefundHint: {
    fontSize: 9,
    color: Colors.successDark,
    fontWeight: '700',
  },
  confirmPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: Layout.radius.md,
    gap: 8,
    ...Layout.shadow.subtle,
  },
  confirmPayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
