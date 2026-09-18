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
import { FLEET_DATA } from '@/data/fleet';

interface FullPriceSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVehicle?: (vehicleId: number) => void;
}

export const FullPriceSheetModal: React.FC<FullPriceSheetModalProps> = ({
  visible,
  onClose,
  onSelectVehicle,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="receipt" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.modalTitle}>Official Rental Price List</Text>
                <Text style={styles.modalSub}>Verified tariffs across all 10 vehicles</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Sheet Banner (Matching Image) */}
            <View style={styles.sheetBanner}>
              <Text style={styles.sheetBannerText}>Monday to Friday (Day Price List)</Text>
            </View>

            {/* Horizontally Scrollable Data Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.thText, styles.colName]}>Vehicle Name</Text>
                  <Text style={[styles.thText, styles.colDeposit]}>Deposit Amt.</Text>
                  <Text style={[styles.thText, styles.colNum]}>3Hr</Text>
                  <Text style={[styles.thText, styles.colNum]}>6Hr</Text>
                  <Text style={[styles.thText, styles.colNum]}>12Hr</Text>
                  <Text style={[styles.thText, styles.colNum]}>24Hr</Text>
                  <Text style={[styles.thText, styles.colWeek]}>7 Days</Text>
                  <Text style={[styles.thText, styles.colOt]}>Overtime</Text>
                </View>

                {/* Table Rows */}
                {FLEET_DATA.map((v, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.tableRow, isEven ? styles.rowEven : styles.rowOdd]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (onSelectVehicle) {
                          onClose();
                          onSelectVehicle(v.id);
                        }
                      }}>
                      <View style={[styles.tdCell, styles.colName]}>
                        <Text style={styles.tdNameText}>{v.name}</Text>
                        <View style={[styles.typeBadge, v.type === 'Bike' ? styles.bikeBadge : styles.scootyBadge]}>
                          <Text style={styles.typeBadgeText}>{v.type}</Text>
                        </View>
                      </View>

                      <View style={[styles.tdCell, styles.colDeposit]}>
                        <Text style={[styles.tdText, v.deposit === 1 && styles.promoText]}>
                          {v.deposit === 1000 ? '1,000' : v.deposit}
                        </Text>
                      </View>

                      <View style={[styles.tdCell, styles.colNum]}>
                        <Text style={styles.tdText}>{v.pricing['3Hr']}</Text>
                      </View>

                      <View style={[styles.tdCell, styles.colNum]}>
                        <Text style={styles.tdText}>{v.pricing['6Hr']}</Text>
                      </View>

                      <View style={[styles.tdCell, styles.colNum]}>
                        <Text style={styles.tdText}>{v.pricing['12Hr']}</Text>
                      </View>

                      <View style={[styles.tdCell, styles.colNum]}>
                        <Text style={[styles.tdText, styles.boldText]}>{v.pricing['24Hr']}</Text>
                      </View>

                      <View style={[styles.tdCell, styles.colWeek]}>
                        <Text style={[styles.tdText, styles.boldText]}>
                          {v.pricing['7Days'].toLocaleString('en-IN')}.0
                        </Text>
                      </View>

                      <View style={[styles.tdCell, styles.colOt]}>
                        <Text style={styles.tdOtText}>{v.overtime}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Table Footer: Deposit Sum */}
                <View style={styles.tableFooterRow}>
                  <View style={[styles.tdCell, styles.colName]}>
                    <Text style={styles.footerBoldText}>TOTAL DEPOSIT SUM</Text>
                  </View>
                  <View style={[styles.tdCell, styles.colDeposit]}>
                    <Text style={styles.footerSumText}>₹7,101</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </View>
            </ScrollView>

            {/* Explanatory Notes */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Notes & Tariff Policy:</Text>
              <Text style={styles.notesItem}>• All tariffs are in INR (₹). Rates apply Monday to Friday.</Text>
              <Text style={styles.notesItem}>• TVS Jupiter/J-2 features special promotional deposit of only ₹1.</Text>
              <Text style={styles.notesItem}>• 100% of the deposit is refundable immediately upon vehicle return.</Text>
              <Text style={styles.notesItem}>• Overtime rate applies per hour beyond the booked package duration.</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    paddingTop: Layout.spacing.lg,
    maxHeight: '92%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.background,
  },
  scrollBody: {
    padding: Layout.spacing.lg,
    paddingBottom: 30,
  },
  sheetBanner: {
    backgroundColor: '#FDE68A',
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: Layout.radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  sheetBannerText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.5,
  },
  tableScroll: {
    borderRadius: Layout.radius.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  table: {
    minWidth: 700,
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0E4B68',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
  },
  thText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowEven: {
    backgroundColor: '#FFFBEB',
  },
  rowOdd: {
    backgroundColor: '#FEF3C7',
  },
  tdCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  colName: {
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  colDeposit: {
    width: 100,
    alignItems: 'center',
  },
  colNum: {
    width: 70,
    alignItems: 'center',
  },
  colWeek: {
    width: 90,
    alignItems: 'center',
  },
  colOt: {
    width: 90,
    alignItems: 'center',
  },
  tdNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  scootyBadge: {
    backgroundColor: '#8B5CF6',
  },
  bikeBadge: {
    backgroundColor: '#F97316',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  tdText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '900',
  },
  promoText: {
    fontWeight: '900',
    color: '#DC2626',
  },
  tdOtText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  tableFooterRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
  },
  footerBoldText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  footerSumText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  notesItem: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
