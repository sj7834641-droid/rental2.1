import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useRental } from '@/context/RentalContext';

interface HeaderBarProps {
  onOpenHubPicker?: () => void;
  onOpenHelp?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenHubPicker, onOpenHelp }) => {
  const { pickupHub, isSupabaseConnected } = useRental();

  return (
    <View style={styles.container}>
      {/* Brand & City */}
      <View style={styles.brandRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="bicycle" size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Rapid</Text>
              <Text style={styles.brandSubtitle}>Rental</Text>
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>INDIA</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.citySelector}
              activeOpacity={0.7}
              onPress={onOpenHubPicker}>
              <Ionicons name="location-sharp" size={13} color={Colors.primary} />
              <Text style={styles.cityText}>Bengaluru</Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action icons */}
        <View style={styles.actionsRow}>
          <View
            style={[
              styles.cloudBadge,
              isSupabaseConnected ? styles.cloudBadgeLive : styles.cloudBadgeOffline,
            ]}>
            <Text style={[styles.cloudText, isSupabaseConnected && styles.cloudTextLive]}>
              {isSupabaseConnected ? '🟢 Live' : '🔴 Offline'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.8}
            onPress={onOpenHelp}>
            <Ionicons name="call" size={14} color="#FFFFFF" />
            <Text style={styles.sosText}>24/7 SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Station Banner */}
      <TouchableOpacity
        style={styles.hubBanner}
        activeOpacity={0.85}
        onPress={onOpenHubPicker}>
        <View style={styles.hubIconBg}>
          <Ionicons name="storefront-outline" size={15} color={Colors.primary} />
        </View>
        <View style={styles.hubTextContainer}>
          <Text style={styles.hubSubhead}>PICKUP HUB</Text>
          <Text style={styles.hubTitle} numberOfLines={1}>
            {pickupHub.name} • <Text style={styles.hubDistance}>{pickupHub.distance}</Text>
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadow.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  proPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  proPillText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Layout.radius.full,
    gap: 4,
    borderWidth: 1,
  },
  cloudBadgeLive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cloudBadgeOffline: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  cloudDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  cloudDotLive: {
    backgroundColor: Colors.success,
  },
  cloudText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  cloudTextLive: {
    color: '#15803D',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.radius.full,
    gap: 4,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  hubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: Layout.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Layout.spacing.sm,
  },
  hubIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTextContainer: {
    flex: 1,
  },
  hubSubhead: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  hubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  hubDistance: {
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
