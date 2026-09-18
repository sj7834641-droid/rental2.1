import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Vehicle } from '@/data/fleet';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPressCard: (vehicle: Vehicle) => void;
  onPressRates: (vehicle: Vehicle) => void;
  onPressBook: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPressCard,
  onPressRates,
  onPressBook,
}) => {
  const isScooty = vehicle.type === 'Scooty';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => onPressCard(vehicle)}>
      {/* Top Banner Tags */}
      <View style={styles.badgeContainer}>
        <View style={[styles.typeBadge, isScooty ? styles.scootyBadge : styles.bikeBadge]}>
          <Text style={styles.typeBadgeText}>{vehicle.type.toUpperCase()}</Text>
        </View>

        {vehicle.tag && (
          <View
            style={[
              styles.highlightBadge,
              vehicle.deposit === 1 && { backgroundColor: '#DC2626' },
            ]}>
            <Text style={styles.highlightBadgeText}>{vehicle.tag}</Text>
          </View>
        )}
      </View>

      {/* Vehicle Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={vehicle.image}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
        {/* Rating overlay pill */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{vehicle.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({vehicle.tripCount})</Text>
        </View>
      </View>

      {/* Vehicle Details */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <View style={styles.transmissionPill}>
            <Text style={styles.transmissionText}>{vehicle.transmission}</Text>
          </View>
        </View>

        {/* Specs Pills Row */}
        <View style={styles.specsRow}>
          <View style={styles.specChip}>
            <Ionicons name="speedometer-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.engineCc}</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="flash-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.mileage}</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="shield-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.specText}>1 Helmet Free</Text>
          </View>
        </View>

        {/* Deposit & Pricing Strip */}
        <View style={styles.pricingStrip}>
          <View>
            <Text style={styles.priceMeta}>24-HOUR RENTAL</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.priceValue}>{vehicle.pricing['24Hr']}</Text>
              <Text style={styles.priceDuration}>/day</Text>
            </View>
            <Text style={styles.hourlyStartText}>
              or ₹{vehicle.pricing['3Hr']} for 3 hrs
            </Text>
          </View>

          <View style={styles.depositBox}>
            <Text style={styles.depositLabel}>SECURITY DEPOSIT</Text>
            <View
              style={[
                styles.depositBadge,
                vehicle.deposit === 1 && styles.depositBadgePromo,
              ]}>
              <Text
                style={[
                  styles.depositBadgeText,
                  vehicle.deposit === 1 && styles.depositBadgeTextPromo,
                ]}>
                ₹{vehicle.deposit}
              </Text>
              <Text
                style={[
                  styles.depositSub,
                  vehicle.deposit === 1 && { color: '#FEE2E2' },
                ]}>
                Refundable
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.ratesButton}
            activeOpacity={0.8}
            onPress={() => onPressRates(vehicle)}>
            <Ionicons name="pricetags-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.ratesButtonText}>Tariff Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.85}
            onPress={() => onPressBook(vehicle)}>
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.card,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scootyBadge: {
    backgroundColor: '#7C3AED',
  },
  bikeBadge: {
    backgroundColor: '#EA580C',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highlightBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  highlightBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Layout.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingCount: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  content: {
    padding: Layout.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  transmissionPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transmissionText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Layout.spacing.md,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  specText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pricingStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
  },
  priceMeta: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  priceDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  hourlyStartText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  depositBox: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  depositBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  depositBadgePromo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  depositBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  depositBadgeTextPromo: {
    color: '#FFFFFF',
  },
  depositSub: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  ratesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  ratesButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bookButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.primary,
    gap: 6,
    ...Layout.shadow.subtle,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
