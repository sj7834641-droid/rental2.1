import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { BookingRecord, useRental } from '@/context/RentalContext';

interface ActiveRideCardProps {
  booking: BookingRecord;
  onNavigateToRide?: () => void;
}

export const ActiveRideCard: React.FC<ActiveRideCardProps> = ({
  booking,
  onNavigateToRide,
}) => {
  const { extendRide, endRide, cancelBooking } = useRental();

  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedExtendHours, setSelectedExtendHours] = useState(3);

  const handleConfirmExtend = () => {
    extendRide(booking.id, selectedExtendHours);
    setExtendModalVisible(false);
    Alert.alert(
      'Rental Extended! ⏱️',
      `Your booking for ${booking.vehicle.name} has been extended by ${selectedExtendHours} hours.`
    );
  };

  const handleConfirmReturn = () => {
    endRide(booking.id);
    setReturnModalVisible(false);
    Alert.alert(
      'Vehicle Returned Successfully! 🎉',
      `Deposit of ₹${booking.fare.deposit} initiated for instant refund to your account.`
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel? 100% of your payment and deposit will be refunded.',
      [
        { text: 'Keep Ride', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelBooking(booking.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Top Status Bar */}
      <View style={styles.topBar}>
        <View style={styles.statusPill}>
          <View style={styles.livePulseDot} />
          <Text style={styles.statusText}>ACTIVE RENTAL</Text>
        </View>
        <Text style={styles.bookingId}>{booking.id}</Text>
      </View>

      {/* Main Info Row */}
      <View style={styles.mainRow}>
        <Image
          source={booking.vehicle.image}
          style={styles.vehicleThumbnail}
          resizeMode="cover"
        />

        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleName}>{booking.vehicle.name}</Text>
          <Text style={styles.regNumber}>KA 01 EK {Math.floor(1000 + Math.random() * 9000)}</Text>

          {/* Handover OTP Badge */}
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>PICKUP OTP:</Text>
            <View style={styles.otpPill}>
              <Text style={styles.otpValue}>{booking.pickupOtp}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Hub & Timeline Strip */}
      <View style={styles.timelineStrip}>
        <View style={styles.timelineItem}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.timelineMeta}>PICKUP HUB</Text>
            <Text style={styles.timelineText} numberOfLines={1}>
              {booking.pickupHub.name}
            </Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.timelineMeta}>RETURN BY</Text>
            <Text style={styles.timelineText} numberOfLines={1}>
              {booking.dropTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Deposit Status Pill */}
      <View style={styles.depositNotice}>
        <Ionicons name="shield-checkmark" size={15} color={Colors.successDark} />
        <Text style={styles.depositNoticeText}>
          Refundable Deposit: <Text style={{ fontWeight: '800' }}>₹{booking.fare.deposit}</Text> (Refunded upon drop-off)
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.extendBtn}
          activeOpacity={0.8}
          onPress={() => setExtendModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.extendBtnText}>Extend Time</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.returnBtn}
          activeOpacity={0.85}
          onPress={() => setReturnModalVisible(true)}>
          <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
          <Text style={styles.returnBtnText}>End Trip & Return</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.8}
          onPress={handleCancel}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Extend Modal */}
      <Modal
        visible={extendModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExtendModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Extend Rental Duration</Text>
                <Text style={styles.modalSub}>
                  Add more hours to keep riding {booking.vehicle.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setExtendModalVisible(false)}
                style={styles.closeModalBtn}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.extendOptionsRow}>
              {[1, 3, 6, 12, 24].map((hrs) => {
                const isSel = selectedExtendHours === hrs;
                return (
                  <TouchableOpacity
                    key={hrs}
                    style={[styles.extendHourChip, isSel && styles.extendHourChipActive]}
                    onPress={() => setSelectedExtendHours(hrs)}>
                    <Text style={[styles.extendHourText, isSel && styles.extendHourTextActive]}>
                      +{hrs}h
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.extendSummaryCard}>
              <Text style={styles.extendSummaryLabel}>Additional Cost:</Text>
              <Text style={styles.extendSummaryValue}>
                ₹{parseInt(booking.vehicle.overtime.replace(/[^0-9]/g, ''), 10) * selectedExtendHours}
              </Text>
              <Text style={styles.extendRateHint}>
                (Standard overtime rate: ₹{booking.vehicle.overtime})
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmExtendBtn}
              activeOpacity={0.85}
              onPress={handleConfirmExtend}>
              <Text style={styles.confirmExtendBtnText}>
                Confirm Extension (+{selectedExtendHours}h)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Return Modal */}
      <Modal
        visible={returnModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReturnModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Return Vehicle Checklist</Text>
                <Text style={styles.modalSub}>
                  Drop-off station: {booking.dropHub.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReturnModalVisible(false)}
                style={styles.closeModalBtn}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.checkText}>Helmet returned to hub supervisor</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.checkText}>Fuel level matches pickup check (Same level)</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.checkText}>Zero new physical damages</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.checkText}>Key handed over to station personnel</Text>
              </View>
            </View>

            <View style={styles.refundBox}>
              <Ionicons name="wallet-outline" size={24} color={Colors.successDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.refundTitle}>Instant Deposit Refund</Text>
                <Text style={styles.refundAmount}>₹{booking.fare.deposit}</Text>
                <Text style={styles.refundNote}>
                  Will be credited to your original UPI/Bank method within 2-24 hours.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeReturnBtn}
              activeOpacity={0.85}
              onPress={handleConfirmReturn}>
              <Text style={styles.completeReturnBtnText}>
                Complete Handover & Refund Deposit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.elevated,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Layout.radius.full,
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  statusText: {
    color: Colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  vehicleThumbnail: {
    width: 75,
    height: 60,
    borderRadius: Layout.radius.sm,
    backgroundColor: Colors.background,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  regNumber: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  otpPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  otpValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timelineStrip: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineMeta: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  timelineText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  depositNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.radius.sm,
    gap: 6,
    marginBottom: Layout.spacing.md,
  },
  depositNoticeText: {
    fontSize: 11,
    color: Colors.successDark,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  extendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.primaryLight,
    gap: 6,
  },
  extendBtnText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  returnBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.primary,
    gap: 6,
    ...Layout.shadow.subtle,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    padding: Layout.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 4,
  },
  extendOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: Layout.spacing.md,
  },
  extendHourChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  extendHourChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  extendHourText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  extendHourTextActive: {
    color: '#FFFFFF',
  },
  extendSummaryCard: {
    backgroundColor: Colors.background,
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  extendSummaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  extendSummaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginVertical: 2,
  },
  extendRateHint: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  confirmExtendBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    ...Layout.shadow.elevated,
  },
  confirmExtendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checklist: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    gap: 10,
    marginBottom: Layout.spacing.md,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  refundBox: {
    flexDirection: 'row',
    backgroundColor: Colors.successLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    gap: 12,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  refundTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.successDark,
  },
  refundAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.successDark,
  },
  refundNote: {
    fontSize: 10,
    color: Colors.successDark,
    marginTop: 2,
  },
  completeReturnBtn: {
    backgroundColor: Colors.successDark,
    paddingVertical: 14,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
  },
  completeReturnBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
