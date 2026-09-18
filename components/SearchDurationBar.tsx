import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useRental } from '@/context/RentalContext';
import { RentalHub } from '@/data/hubs';

interface SearchDurationBarProps {
  onSearchPress?: () => void;
}

export const SearchDurationBar: React.FC<SearchDurationBarProps> = ({ onSearchPress }) => {
  const {
    pickupHub,
    setPickupHub,
    dropHub,
    setDropHub,
    pickupDate,
    dropDate,
    durationHours,
    setRentalDuration,
    hubs,
  } = useRental();

  const [hubModalVisible, setHubModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [selectingHubType, setSelectingHubType] = useState<'pickup' | 'drop'>('pickup');

  // Quick preset durations (Rentelo packages)
  const presets = [
    { label: '3 Hours', hours: 3 },
    { label: '6 Hours', hours: 6 },
    { label: '12 Hours', hours: 12 },
    { label: '24 Hours (1 Day)', hours: 24 },
    { label: '7 Days (Weekly)', hours: 168 },
  ];

  const applyPreset = (hours: number) => {
    const now = new Date();
    const newPickup = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const newDrop = new Date(newPickup.getTime() + hours * 60 * 60 * 1000);
    setRentalDuration(newPickup, newDrop);
    setDurationModalVisible(false);
  };

  const openHubPicker = (type: 'pickup' | 'drop') => {
    setSelectingHubType(type);
    setHubModalVisible(true);
  };

  const formatDateTime = (d: Date) => {
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.card}>
      {/* Station / Hub Selector */}
      <View style={styles.hubSection}>
        <TouchableOpacity
          style={styles.hubItem}
          activeOpacity={0.7}
          onPress={() => openHubPicker('pickup')}>
          <View style={[styles.dotIndicator, { backgroundColor: Colors.primary }]} />
          <View style={styles.hubInfo}>
            <Text style={styles.metaLabel}>PICKUP STATION</Text>
            <Text style={styles.hubValue} numberOfLines={1}>
              {pickupHub.name}
            </Text>
            <Text style={styles.hubSubText} numberOfLines={1}>
              {pickupHub.landmark}
            </Text>
          </View>
          <Ionicons name="swap-vertical" size={18} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.hubItem}
          activeOpacity={0.7}
          onPress={() => openHubPicker('drop')}>
          <View style={[styles.dotIndicator, { backgroundColor: Colors.success }]} />
          <View style={styles.hubInfo}>
            <Text style={styles.metaLabel}>DROP-OFF STATION</Text>
            <Text style={styles.hubValue} numberOfLines={1}>
              {dropHub.name}
            </Text>
            <Text style={styles.hubSubText} numberOfLines={1}>
              {dropHub.id === pickupHub.id ? 'Same as pickup hub' : dropHub.landmark}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Date & Time Duration Row */}
      <TouchableOpacity
        style={styles.durationBar}
        activeOpacity={0.8}
        onPress={() => setDurationModalVisible(true)}>
        <View style={styles.durationLeft}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <View>
            <Text style={styles.metaLabel}>RENTAL DURATION</Text>
            <Text style={styles.durationDates}>
              {formatDateTime(pickupDate)} → {formatDateTime(dropDate)}
            </Text>
          </View>
        </View>

        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>{durationHours}h</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Duration Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}>
        {presets.map((p) => {
          const isSelected = durationHours === p.hours;
          return (
            <TouchableOpacity
              key={p.hours}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
              activeOpacity={0.7}
              onPress={() => applyPreset(p.hours)}>
              <Text
                style={[
                  styles.presetChipText,
                  isSelected && styles.presetChipTextActive,
                ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Find Rides Button */}
      {onSearchPress && (
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.85}
          onPress={onSearchPress}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Find Available Rides</Text>
        </TouchableOpacity>
      )}

      {/* Hub Selection Modal */}
      <Modal
        visible={hubModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHubModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select {selectingHubType === 'pickup' ? 'Pickup' : 'Drop-off'} Hub
                </Text>
                <Text style={styles.modalSub}>
                  Bengaluru Central & Metro Station Network
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHubModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {hubs.map((hub) => {
                const isCurrent =
                  selectingHubType === 'pickup'
                    ? pickupHub.id === hub.id
                    : dropHub.id === hub.id;
                return (
                  <TouchableOpacity
                    key={hub.id}
                    style={[styles.hubOptionCard, isCurrent && styles.hubOptionCardActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (selectingHubType === 'pickup') {
                        setPickupHub(hub);
                      } else {
                        setDropHub(hub);
                      }
                      setHubModalVisible(false);
                    }}>
                    <View style={styles.hubOptionLeft}>
                      <View
                        style={[
                          styles.hubOptionIcon,
                          isCurrent && { backgroundColor: Colors.primary },
                        ]}>
                        <Ionicons
                          name="location"
                          size={18}
                          color={isCurrent ? '#FFFFFF' : Colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.hubOptionName}>{hub.name}</Text>
                        <Text style={styles.hubOptionLandmark}>{hub.landmark}</Text>
                        <Text style={styles.hubOptionAddress} numberOfLines={1}>
                          {hub.address}
                        </Text>
                        <View style={styles.hubTagRow}>
                          <View style={styles.availPill}>
                            <Text style={styles.availPillText}>
                              {hub.availableBikes} bikes ready
                            </Text>
                          </View>
                          <Text style={styles.hubDistanceText}>
                            ⏱ {hub.distance} • {hub.operatingHours}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isCurrent && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Duration Picker Modal */}
      <Modal
        visible={durationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDurationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Rental Duration</Text>
                <Text style={styles.modalSub}>
                  Exact tariff packages from 3 Hours up to 7 Days
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDurationModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.presetsList}>
              {presets.map((p) => {
                const isSelected = durationHours === p.hours;
                return (
                  <TouchableOpacity
                    key={p.hours}
                    style={[
                      styles.durationOptionCard,
                      isSelected && styles.durationOptionCardActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => applyPreset(p.hours)}>
                    <View style={styles.durationOptionLeft}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? Colors.primary : Colors.textMuted}
                      />
                      <View>
                        <Text style={styles.durationOptionTitle}>{p.label}</Text>
                        <Text style={styles.durationOptionDesc}>
                          {p.hours === 168
                            ? 'Max savings • Best for weekly explorers'
                            : p.hours === 24
                            ? 'Standard full-day commute package'
                            : `${p.hours} hours city hop package`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.freeKmPill}>
                      <Text style={styles.freeKmText}>
                        {p.hours >= 24 ? '150 km/day free' : '5 km/hr free'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.card,
  },
  hubSection: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  hubInfo: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  hubValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  hubSubText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
    marginLeft: 26,
  },
  durationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  durationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flex: 1,
  },
  durationDates: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  durationBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.radius.full,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  presetsRow: {
    gap: 8,
    marginTop: Layout.spacing.sm,
    paddingVertical: 2,
  },
  presetChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.md,
    paddingVertical: 13,
    marginTop: Layout.spacing.md,
    gap: 8,
    ...Layout.shadow.elevated,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '85%',
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
  closeBtn: {
    padding: 4,
  },
  hubOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  hubOptionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
    flex: 1,
  },
  hubOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  hubOptionLandmark: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  hubOptionAddress: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hubTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  availPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availPillText: {
    color: Colors.successDark,
    fontSize: 10,
    fontWeight: '700',
  },
  hubDistanceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  presetsList: {
    gap: 8,
    paddingBottom: Layout.spacing.lg,
  },
  durationOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  durationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    flex: 1,
  },
  durationOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  durationOptionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  freeKmPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freeKmText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
});
