import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { BookingAddons } from '@/context/RentalContext';

interface AddonSelectorProps {
  addons: BookingAddons;
  onChange: (updated: BookingAddons) => void;
}

export const AddonSelector: React.FC<AddonSelectorProps> = ({ addons, onChange }) => {
  const toggleAddon = (key: keyof BookingAddons) => {
    onChange({
      ...addons,
      [key]: !addons[key],
    });
  };

  const addonItems: {
    key: keyof BookingAddons;
    title: string;
    subtitle: string;
    price: number;
    icon: any;
    recommended?: boolean;
  }[] = [
    {
      key: 'extraHelmet',
      title: 'Extra Pillion Helmet',
      subtitle: 'Sanitized ISI certified helmet for pillion rider',
      price: 50,
      icon: 'shield-checkmark-outline',
    },
    {
      key: 'mobileMount',
      title: 'Mobile Phone Mount & Charger',
      subtitle: 'Heavy-duty 360° clamp with fast USB cable',
      price: 30,
      icon: 'phone-portrait-outline',
    },
    {
      key: 'damageProtection',
      title: 'Damage Waiver Cover',
      subtitle: 'Zero liability for accidental scratches up to ₹5,000',
      price: 49,
      icon: 'umbrella-outline',
      recommended: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add-ons & Extras</Text>
      <Text style={styles.sectionSubtitle}>Select optional items for a comfortable ride</Text>

      <View style={styles.itemsList}>
        {addonItems.map((item) => {
          const isSelected = addons[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.addonCard, isSelected && styles.addonCardSelected]}
              activeOpacity={0.8}
              onPress={() => toggleAddon(item.key)}>
              <View style={styles.addonLeft}>
                <View
                  style={[
                    styles.iconBox,
                    isSelected && { backgroundColor: Colors.primaryLight },
                  ]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.addonTitle}>{item.title}</Text>
                    {item.recommended && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addonSubtitle}>{item.subtitle}</Text>
                </View>
              </View>

              <View style={styles.addonRight}>
                <Text style={styles.addonPrice}>+₹{item.price}</Text>
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isSelected ? Colors.primary : Colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Layout.spacing.sm,
  },
  itemsList: {
    gap: 8,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow.subtle,
  },
  addonCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  recBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  addonSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addonRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 8,
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});
