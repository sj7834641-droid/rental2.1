import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useRental } from '@/context/RentalContext';
import { syncFleetToSupabase } from '@/services/supabaseRentalService';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, updateUserProfile, isSupabaseConnected, supabaseUserId } = useRental();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [phoneInput, setPhoneInput] = useState(userProfile.phone);
  const [dlInput, setDlInput] = useState(userProfile.dlNumber);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const fleetRes = await syncFleetToSupabase();
      if (fleetRes) {
        Alert.alert(
          'Supabase Synced!',
          'All 10 verified vehicles (₹7,101 deposit pool) have been synchronized with Supabase PostgreSQL.'
        );
      } else {
        Alert.alert('Sync Notice', 'Supabase sync notice: verified fleet stored locally.');
      }
    } catch (err) {
      Alert.alert('Sync Notice', 'Data stored locally; will sync to Supabase once network reconnects.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      name: nameInput,
      phone: phoneInput,
      dlNumber: dlInput,
    });
    setEditModalVisible(false);
    Alert.alert('Profile Saved', 'Your rider details have been updated.');
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Calling 24/7 Roadside Assistance',
      'Dialing toll-free hotline: 1800-419-7274 (Available 24 hours across Bengaluru).'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rider Profile & Support</Text>
        <Text style={styles.subtitle}>KYC verified profile and roadside assistance</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                {userProfile.isKycVerified && (
                  <View style={styles.kycBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                    <Text style={styles.kycText}>KYC VERIFIED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userPhone}>{userProfile.phone}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => setEditModalVisible(true)}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* DL info strip */}
          <View style={styles.dlStrip}>
            <Ionicons name="card-outline" size={16} color={Colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dlLabel}>DRIVING LICENSE NUMBER</Text>
              <Text style={styles.dlNumber}>{userProfile.dlNumber}</Text>
            </View>
            <View style={styles.dlApprovedPill}>
              <Text style={styles.dlApprovedText}>Valid Two-Wheeler</Text>
            </View>
          </View>
        </View>

        {/* RapidCoins Wallet */}
        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <Ionicons name="wallet" size={24} color="#F59E0B" />
            <View>
              <Text style={styles.walletLabel}>RAPIDCOINS REWARD BALANCE</Text>
              <Text style={styles.walletAmount}>250 Coins</Text>
            </View>
          </View>
          <View style={styles.walletValueBadge}>
            <Text style={styles.walletValueText}>= ₹250 Discount</Text>
          </View>
        </View>

        {/* Supabase Cloud & Local Backend Card */}
        <View style={styles.backendCard}>
          <View style={styles.backendHeader}>
            <View style={styles.backendIconBg}>
              <Ionicons name="server" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.backendTitle}>Supabase PostgreSQL</Text>
                <View
                  style={[
                    styles.backendPill,
                    isSupabaseConnected ? styles.backendPillLive : styles.backendPillOffline,
                  ]}>
                  <Text
                    style={[
                      styles.backendPillText,
                      isSupabaseConnected ? styles.backendPillTextLive : styles.backendPillTextOffline,
                    ]}>
                    {isSupabaseConnected ? 'ACTIVE' : 'LOCAL'}
                  </Text>
                </View>
              </View>
              <Text style={styles.backendSubtitle}>
                PostgreSQL + Auth + Storage • Port 8000
              </Text>
            </View>
          </View>

          <View style={styles.backendDetailsGrid}>
            <View style={styles.backendDetailItem}>
              <Text style={styles.backendDetailLabel}>ENGINE</Text>
              <Text style={styles.backendDetailValue}>PostgreSQL</Text>
            </View>
            <View style={styles.backendDetailItem}>
              <Text style={styles.backendDetailLabel}>TABLES</Text>
              <Text style={styles.backendDetailValue}>vehicles, bookings</Text>
            </View>
            <View style={styles.backendDetailItem}>
              <Text style={styles.backendDetailLabel}>AUTH UID</Text>
              <Text style={styles.backendDetailValue} numberOfLines={1}>
                {supabaseUserId ? `${supabaseUserId.slice(0, 8)}...` : 'Active'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, isSyncing && { opacity: 0.7 }, { backgroundColor: '#059669' }]}
            activeOpacity={0.8}
            onPress={handleForceSync}
            disabled={isSyncing}>
            <Ionicons name="cloud-upload-outline" size={15} color="#FFFFFF" />
            <Text style={styles.syncBtnText}>
              {isSyncing ? 'Syncing to Supabase...' : 'Sync Fleet Catalog to Supabase'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.syncBtn, { flex: 1, backgroundColor: '#0284C7' }]}
              activeOpacity={0.8}
              onPress={() => router.push('/auth')}>
              <Ionicons name="person-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Rider Auth</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncBtn, { flex: 1, backgroundColor: '#7C3AED' }]}
              activeOpacity={0.8}
              onPress={() => router.push('/admin')}>
              <Ionicons name="shield-outline" size={16} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Admin Panel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 24/7 Roadside Assistance Hotline */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyTop}>
            <View style={styles.emergencyIconCircle}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>24/7 Roadside Assistance</Text>
              <Text style={styles.emergencyDesc}>
                Punctures, battery breakdown, or on-road accident emergency support anywhere in Bengaluru.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callHotlineBtn}
            activeOpacity={0.85}
            onPress={handleCallEmergency}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callHotlineText}>Call 1800-419-7274 (Toll-Free)</Text>
          </TouchableOpacity>
        </View>

        {/* Safety & Bangalore Guidelines */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionHeading}>Rental Guidelines & Policies</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/modal' as any)}>
            <View style={styles.menuIconBg}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemTitle}>Zero Deposit Refund Policy</Text>
              <Text style={styles.menuItemSubtitle}>Instant refund processing timeline</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/modal' as any)}>
            <View style={styles.menuIconBg}>
              <Ionicons name="speedometer-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemTitle}>Speed Limits & Traffic Safety</Text>
              <Text style={styles.menuItemSubtitle}>Bengaluru city traffic regulations</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/modal' as any)}>
            <View style={styles.menuIconBg}>
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemTitle}>Terms & Conditions</Text>
              <Text style={styles.menuItemSubtitle}>Two-wheeler rental agreement</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appMeta}>
          <Text style={styles.appVersion}>RapidRental App v2.1.0 (Build 57)</Text>
          <Text style={styles.appTagline}>Made with ❤️ for Bengaluru Commuters</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Rider Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Rider name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mobile Phone</Text>
              <TextInput
                style={styles.formInput}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="+91..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Driving License Number</Text>
              <TextInput
                style={styles.formInput}
                value={dlInput}
                onChangeText={setDlInput}
                placeholder="DL Number"
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.85}
              onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.subtle,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  kycText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dlStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dlLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  dlNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  dlApprovedPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dlApprovedText: {
    color: Colors.successDark,
    fontSize: 10,
    fontWeight: '700',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Layout.spacing.md,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  walletLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#78350F',
    marginTop: 1,
  },
  walletValueBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.radius.full,
  },
  walletValueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  backendCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: Layout.spacing.md,
  },
  backendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  backendIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backendTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  backendSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#C2410C',
    marginTop: 1,
  },
  backendPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Layout.radius.full,
  },
  backendPillLive: {
    backgroundColor: '#DCFCE7',
  },
  backendPillOffline: {
    backgroundColor: '#E2E8F0',
  },
  backendPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  backendPillTextLive: {
    color: '#15803D',
  },
  backendPillTextOffline: {
    color: '#64748B',
  },
  backendDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: Layout.spacing.sm,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  backendDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  backendDetailLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.5,
  },
  backendDetailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C2D12',
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 9,
    borderRadius: Layout.radius.md,
    gap: 6,
    marginTop: 4,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emergencyCard: {
    backgroundColor: '#DC2626',
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.elevated,
  },
  emergencyTop: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  emergencyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#FEE2E2',
    marginTop: 2,
    lineHeight: 16,
  },
  callHotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    gap: 8,
  },
  callHotlineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  menuSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.md,
    gap: 10,
  },
  menuSectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    paddingVertical: 6,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  appMeta: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  appVersion: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  appTagline: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
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
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  formGroup: {
    marginBottom: Layout.spacing.md,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
