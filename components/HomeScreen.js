import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_CACHE_KEY = '@rapidrental_vehicles_cache';

export default function HomeScreen({ onSelectVehicle, onOpenAdmin, onOpenAuth }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking...'); // '🟢 Live' | '🔴 Offline'
  const [selectedType, setSelectedType] = useState('ALL');

  const fetchVehicles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setVehicles(data);
        setConnectionStatus('🟢 Live');
        setLoading(false);
        // Offline cache in AsyncStorage
        try {
          await AsyncStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(data));
        } catch (cacheErr) {
          console.warn('AsyncStorage caching warning:', cacheErr);
        }
      } else {
        await loadFromCache();
      }
    } catch (err) {
      console.warn('[Supabase Vehicles Fetch Error] Falling back to AsyncStorage cache:', err.message);
      await loadFromCache();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_CACHE_KEY);
      if (cached) {
        setVehicles(JSON.parse(cached));
        setConnectionStatus('🔴 Offline');
      } else {
        // Fallback default fleet data if first time offline
        const fallbackFleet = [
          { id: 1, name: 'Activa 3G', type: 'Scooty', deposit: 500, price_3hr: 120, price_6hr: 220, price_12hr: 350, price_24hr: 550, price_7days: 2100, overtime: '50/Hr', status: 'available' },
          { id: 2, name: 'Jupiter/J-2', type: 'Scooty', deposit: 1, price_3hr: 120, price_6hr: 220, price_12hr: 350, price_24hr: 550, price_7days: 2100, overtime: '50/Hr', status: 'available' },
          { id: 3, name: 'Maestro Edge', type: 'Scooty', deposit: 800, price_3hr: 150, price_6hr: 280, price_12hr: 450, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 4, name: 'Maestro', type: 'Scooty', deposit: 800, price_3hr: 150, price_6hr: 280, price_12hr: 440, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 5, name: 'Avaitor', type: 'Scooty', deposit: 800, price_3hr: 150, price_6hr: 280, price_12hr: 450, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 6, name: 'Activa 4G', type: 'Scooty', deposit: 800, price_3hr: 150, price_6hr: 270, price_12hr: 420, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 7, name: 'TVS Wego', type: 'Scooty', deposit: 800, price_3hr: 150, price_6hr: 280, price_12hr: 450, price_24hr: 620, price_7days: 3450, overtime: '60/Hr', status: 'available' },
          { id: 8, name: 'Glamour', type: 'Bike', deposit: 800, price_3hr: 150, price_6hr: 270, price_12hr: 450, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 9, name: 'Discover', type: 'Bike', deposit: 800, price_3hr: 150, price_6hr: 270, price_12hr: 450, price_24hr: 620, price_7days: 2450, overtime: '60/Hr', status: 'available' },
          { id: 10, name: 'Ns Pulsar', type: 'Bike', deposit: 1000, price_3hr: 200, price_6hr: 360, price_12hr: 550, price_24hr: 860, price_7days: 3450, overtime: '70/Hr', status: 'available' },
        ];
        setVehicles(fallbackFleet);
        setConnectionStatus('🔴 Offline');
      }
    } catch (cacheErr) {
      console.error('Error loading vehicles from cache:', cacheErr);
      setConnectionStatus('🔴 Offline');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchVehicles();

    // Supabase Real-time postgres_changes channel
    const channel = supabase
      .channel('vehicles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          fetchVehicles();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('🟢 Live');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('🔴 Offline');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVehicles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedType === 'ALL') return true;
    return (v.type || '').toLowerCase() === selectedType.toLowerCase();
  });

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.brandBadge}>
            <Ionicons name="bicycle" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>RapidRental</Text>
            <Text style={styles.brandLocation}>📍 Bengaluru, India</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Connection Status Banner */}
          <View
            style={[
              styles.statusPill,
              connectionStatus === '🟢 Live' ? styles.statusLive : styles.statusOffline,
            ]}
          >
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>

          {onOpenAuth && (
            <TouchableOpacity style={styles.iconBtn} onPress={onOpenAuth}>
              <Ionicons name="person-circle-outline" size={26} color="#334155" />
            </TouchableOpacity>
          )}

          {onOpenAdmin && (
            <TouchableOpacity style={styles.iconBtn} onPress={onOpenAdmin}>
              <Ionicons name="shield-outline" size={22} color="#E11D48" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E11D48']} />}
      >
        {/* Banner Promo */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTextCol}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>LIMITED OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>₹1 Security Deposit</Text>
            <Text style={styles.promoSub}>Rent TVS Jupiter with just ₹1 refundable deposit!</Text>
          </View>
          <Ionicons name="sparkles" size={32} color="#F59E0B" />
        </View>

        {/* Category Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, selectedType === 'ALL' && styles.filterPillActive]}
            onPress={() => setSelectedType('ALL')}
          >
            <Text style={[styles.filterText, selectedType === 'ALL' && styles.filterTextActive]}>
              All Vehicles ({vehicles.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedType === 'Scooty' && styles.filterPillActive]}
            onPress={() => setSelectedType('Scooty')}
          >
            <Text style={[styles.filterText, selectedType === 'Scooty' && styles.filterTextActive]}>
              🛵 Scooters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedType === 'Bike' && styles.filterPillActive]}
            onPress={() => setSelectedType('Bike')}
          >
            <Text style={[styles.filterText, selectedType === 'Bike' && styles.filterTextActive]}>
              🏍️ Bikes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Available Fleet in Bengaluru</Text>
          <Text style={styles.sectionSub}>Supabase PostgreSQL Real-time Catalog</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#E11D48" />
            <Text style={styles.loaderText}>Syncing vehicles from Supabase...</Text>
          </View>
        ) : (
          filteredVehicles.map((item) => {
            const isAvailable = item.status === 'available' || !item.status;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                  <View
                    style={[
                      styles.availBadge,
                      isAvailable ? styles.availGreen : styles.availRented,
                    ]}
                  >
                    <Text
                      style={[
                        styles.availText,
                        isAvailable ? styles.availGreenText : styles.availRentedText,
                      ]}
                    >
                      {item.status ? item.status.toUpperCase() : 'AVAILABLE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  <Text style={styles.depositLabel}>
                    Security Deposit:{' '}
                    <Text style={styles.depositVal}>₹{item.deposit}</Text>{' '}
                    {item.deposit === 1 ? '(Special Promo)' : '(Refundable)'}
                  </Text>

                  {/* Pricing Matrix */}
                  <View style={styles.pricingGrid}>
                    <View style={styles.priceBox}>
                      <Text style={styles.pricePeriod}>3 Hours</Text>
                      <Text style={styles.priceRate}>₹{item.price_3hr || item.pricing?.['3Hr']}</Text>
                    </View>
                    <View style={styles.priceBox}>
                      <Text style={styles.pricePeriod}>6 Hours</Text>
                      <Text style={styles.priceRate}>₹{item.price_6hr || item.pricing?.['6Hr']}</Text>
                    </View>
                    <View style={styles.priceBox}>
                      <Text style={styles.pricePeriod}>12 Hours</Text>
                      <Text style={styles.priceRate}>₹{item.price_12hr || item.pricing?.['12Hr']}</Text>
                    </View>
                    <View style={[styles.priceBox, styles.priceBoxHighlight]}>
                      <Text style={styles.pricePeriodHighlight}>24 Hours</Text>
                      <Text style={styles.priceRateHighlight}>₹{item.price_24hr || item.pricing?.['24Hr']}</Text>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.overtimeText}>Overtime: {item.overtime}</Text>
                    <TouchableOpacity
                      style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
                      disabled={!isAvailable}
                      onPress={() => onSelectVehicle && onSelectVehicle(item)}
                    >
                      <Text style={styles.bookBtnText}>
                        {isAvailable ? 'Book Now →' : 'Unavailable'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandLocation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusLive: {
    backgroundColor: '#DCFCE7',
  },
  statusOffline: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  iconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  promoTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  promoTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  promoSub: {
    fontSize: 12,
    color: '#B45309',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeadingRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availGreen: {
    backgroundColor: '#DCFCE7',
  },
  availRented: {
    backgroundColor: '#FEE2E2',
  },
  availText: {
    fontSize: 11,
    fontWeight: '800',
  },
  availGreenText: {
    color: '#166534',
  },
  availRentedText: {
    color: '#991B1B',
  },
  cardBody: {
    gap: 6,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  depositLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  depositVal: {
    fontWeight: '800',
    color: '#10B981',
  },
  pricingGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceBoxHighlight: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
  },
  pricePeriod: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  pricePeriodHighlight: {
    fontSize: 10,
    color: '#E11D48',
    fontWeight: '700',
    marginBottom: 2,
  },
  priceRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceRateHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E11D48',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  overtimeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  bookBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  bookBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
