import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Vehicle } from '@/data/fleet';

interface PriceBreakdownModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSelectBooking?: (vehicle: Vehicle) => void;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  visible,
  vehicle,
  onClose,
  onSelectBooking,
}) => {
  if (!vehicle) return null;

  const pricingRows = [
    { duration: '3 Hours', price: vehicle.pricing['3Hr'], km: '15 km free' },
    { duration: '6 Hours', price: vehicle.pricing['6Hr'], km: '30 km free' },
    { duration: '12 Hours', price: vehicle.pricing['12Hr'], km: '60 km free' },
    { duration: '24 Hours (1 Day)', price: vehicle.pricing['24Hr'], km: '150 km free', popular: true },
    { duration: '7 Days (Weekly)', price: vehicle.pricing['7Days'], km: '1050 km free', bestValue: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, vehicle.type === 'Bike' ? styles.bikeBadge : styles.scootyBadge]}>
                  <Text style={styles.typeBadgeText}>{vehicle.type.toUpperCase()}</Text>
                </View>
                {vehicle.deposit === 1 && (
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>₹1 DEPOSIT PROMO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{vehicle.name} Full Rate Card</Text>
              <Text style={styles.subtitle}>Transparent tariffs • Zero hidden charges</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Rates Table */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thDuration}>PACKAGE</Text>
                <Text style={styles.thKm}>FREE KMS</Text>
                <Text style={styles.thPrice}>RENTAL FARE</Text>
              </View>

              {pricingRows.map((row, idx) => (
                <View
                  key={row.duration}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 && styles.tableRowAlt,
                    row.popular && styles.tableRowPopular,
                  ]}>
                  <View style={{ flex: 1.2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.tdDuration, row.popular && styles.textBold]}>
                        {row.duration}
                      </Text>
                      {row.popular && (
                        <View style={styles.miniTag}>
                          <Text style={styles.miniTagText}>POPULAR</Text>
                        </View>
                      )}
                      {row.bestValue && (
                        <View style={[styles.miniTag, { backgroundColor: '#10B981' }]}>
                          <Text style={styles.miniTagText}>BEST VALUE</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.tdKm}>{row.km}</Text>
                  <Text style={[styles.tdPrice, row.popular && { color: Colors.primary }]}>
                    ₹{row.price}
                  </Text>
                </View>
              ))}
            </View>

            {/* Overtime & Deposit Strip */}
            <View style={styles.stripRow}>
              <View style={styles.stripCard}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <View>
                  <Text style={styles.stripLabel}>OVERTIME RATE</Text>
                  <Text style={styles.stripValue}>₹{vehicle.overtime}</Text>
                </View>
              </View>

              <View style={styles.stripCard}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
                <View>
                  <Text style={styles.stripLabel}>REFUNDABLE DEPOSIT</Text>
                  <Text style={[styles.stripValue, { color: Colors.successDark }]}>
                    ₹{vehicle.deposit}
                  </Text>
                </View>
              </View>
            </View>

            {/* Key Policies */}
            <View style={styles.policiesCard}>
              <Text style={styles.policyHeader}>Rental Inclusions & Rules</Text>
              <View style={styles.policyItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.policyText}>1 Sanitized ISI helmet included free with ride</Text>
              </View>
              <View style={styles.policyItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.policyText}>Excess kilometer rate: ₹4/km after free quota</Text>
              </View>
              <View style={styles.policyItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.policyText}>Fuel: Return at the same level as collected</Text>
              </View>
              <View style={styles.policyItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.policyText}>Instant digital deposit refund upon vehicle check-in</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          {onSelectBooking && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.bookBtn}
                activeOpacity={0.85}
                onPress={() => {
                  onClose();
                  onSelectBooking(vehicle);
                }}>
                <Text style={styles.bookBtnText}>Select & Configure Booking</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    paddingTop: Layout.spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scootyBadge: {
    backgroundColor: '#8B5CF6',
  },
  bikeBadge: {
    backgroundColor: '#F97316',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.background,
  },
  scrollBody: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  tableCard: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Layout.spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 10,
  },
  thDuration: {
    flex: 1.2,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  thKm: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  thPrice: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowAlt: {
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
  },
  tableRowPopular: {
    backgroundColor: Colors.primaryMuted,
  },
  tdDuration: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  textBold: {
    fontWeight: '800',
    color: Colors.text,
  },
  tdKm: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tdPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'right',
  },
  miniTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  miniTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  stripRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  stripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  stripLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  stripValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 1,
  },
  policiesCard: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
  },
  policyHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  policyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Layout.radius.md,
    gap: 8,
    ...Layout.shadow.elevated,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
