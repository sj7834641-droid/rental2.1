import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPanelScreen({ onNavigateBack }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Check admin role
  const verifyAdminRole = useCallback(async () => {
    setCheckingRole(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        } else {
          // If no admin profile exists, allow toggle to promote for developer convenience
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.warn('Role verification error:', err.message);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('id', { ascending: true }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      ]);

      if (vRes.data) setVehicles(vRes.data);
      if (bRes.data) setBookings(bRes.data);
    } catch (err) {
      console.warn('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAdminRole();
    fetchData();

    // Realtime channel subscriptions
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [verifyAdminRole, fetchData]);

  const handleToggleVehicleStatus = async (vehicle) => {
    const nextStatus =
      vehicle.status === 'available' || !vehicle.status
        ? 'rented'
        : vehicle.status === 'rented'
        ? 'maintenance'
        : 'available';

    setUpdatingId(vehicle.id);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: nextStatus })
        .eq('id', vehicle.id);

      if (error) throw error;

      Alert.alert('Status Updated', `${vehicle.name} marked as "${nextStatus.toUpperCase()}".`);
      fetchData();
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClaimAdmin = async () => {
    if (!currentUser) {
      Alert.alert('Not Signed In', 'Please sign in first via the Auth screen.');
      return;
    }

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        role: 'admin',
        full_name: currentUser.email?.split('@')[0] || 'Admin',
      });

      if (error) throw error;
      Alert.alert('Admin Granted', 'Your profile is now registered with role: admin.');
      setIsAdmin(true);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const activeBookingsCount = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'active'
  ).length;

  const totalRevenue = bookings.reduce(
    (acc, b) => acc + (b.total_amount || b.totalAmount || 0),
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onNavigateBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onNavigateBack}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Admin Fleet Control</Text>
          <Text style={styles.subtitle}>Supabase PostgreSQL Dashboard</Text>
        </View>
        <View style={styles.badgeAdmin}>
          <Text style={styles.badgeAdminText}>ADMIN</Text>
        </View>
      </View>

      {checkingRole ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loaderText}>Checking admin permissions...</Text>
        </View>
      ) : !isAdmin ? (
        <View style={styles.centerBox}>
          <Ionicons name="shield-outline" size={56} color="#E11D48" />
          <Text style={styles.gateTitle}>Admin Authorization Required</Text>
          <Text style={styles.gateText}>
            {currentUser
              ? `Signed in as ${currentUser.email}. To access fleet controls, your profile must have role = 'admin'.`
              : 'Please sign in with an administrator account to access fleet controls.'}
          </Text>

          {currentUser ? (
            <TouchableOpacity style={styles.grantBtn} onPress={handleClaimAdmin}>
              <Ionicons name="key-outline" size={18} color="#FFFFFF" />
              <Text style={styles.grantBtnText}>Grant My Account Admin Role</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.grantBtn} onPress={onNavigateBack}>
              <Text style={styles.grantBtnText}>Go to Auth Screen</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* KPI Metrics */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{vehicles.length}</Text>
              <Text style={styles.kpiLabel}>Total Fleet</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: '#10B981' }]}>
                {vehicles.filter((v) => v.status === 'available' || !v.status).length}
              </Text>
              <Text style={styles.kpiLabel}>Available</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: '#E11D48' }]}>{activeBookingsCount}</Text>
              <Text style={styles.kpiLabel}>Active Rentals</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiVal, { color: '#0284C7' }]}>₹{totalRevenue}</Text>
              <Text style={styles.kpiLabel}>Total Volume</Text>
            </View>
          </View>

          {/* Section: Vehicle Status Toggling */}
          <Text style={styles.sectionTitle}>Fleet Availability & Status Control</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any status button to toggle (Available ⇄ Rented ⇄ Maintenance)
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#E11D48" style={{ marginTop: 24 }} />
          ) : (
            vehicles.map((item) => {
              const status = item.status || 'available';
              const isUpdating = updatingId === item.id;
              return (
                <View key={item.id} style={styles.vehicleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vName}>{item.name}</Text>
                    <Text style={styles.vSub}>
                      {item.type} • Deposit: ₹{item.deposit} • ₹{item.price_24hr}/day
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      status === 'available'
                        ? styles.btnAvailable
                        : status === 'rented'
                        ? styles.btnRented
                        : styles.btnMaintenance,
                      isUpdating && { opacity: 0.5 },
                    ]}
                    disabled={isUpdating}
                    onPress={() => handleToggleVehicleStatus(item)}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.statusToggleText}>{status.toUpperCase()}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {/* All Bookings Monitor */}
          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
            All Customer Bookings ({bookings.length})
          </Text>
          {bookings.length === 0 ? (
            <Text style={styles.emptyText}>No bookings recorded in Supabase yet.</Text>
          ) : (
            bookings.map((b) => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.bRow}>
                  <Text style={styles.bName}>{b.vehicle_name || 'Vehicle'}</Text>
                  <Text style={styles.bStatus}>{(b.status || 'ACTIVE').toUpperCase()}</Text>
                </View>
                <Text style={styles.bSub}>
                  Fare: ₹{b.total_amount || 0} • Deposit: ₹{b.deposit_amount || 0}
                </Text>
                <Text style={styles.bId}>ID: {b.id}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  badgeAdmin: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAdminText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  gateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  gateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E11D48',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  vSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  btnAvailable: {
    backgroundColor: '#10B981',
  },
  btnRented: {
    backgroundColor: '#EF4444',
  },
  btnMaintenance: {
    backgroundColor: '#F59E0B',
  },
  statusToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  bStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  bSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  bId: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});
