import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { BANGALORE_HUBS } from '@/data/hubs';

export default function ModalScreen() {
  const handleCallSOS = () => {
    Alert.alert(
      'Emergency SOS Triggered',
      'Connecting to RapidRental Bangalore Emergency Dispatch: 1800-419-7274. A patrol mechanic will be routed to your GPS location.'
    );
  };

  const handleCallHub = (name: string, phone: string) => {
    Alert.alert(`Call ${name}`, `Dialing station phone: ${phone}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Emergency SOS Action */}
        <View style={styles.sosCard}>
          <View style={styles.sosIconCircle}>
            <Ionicons name="call" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.sosTitle}>24/7 Roadside Emergency SOS</Text>
          <Text style={styles.sosDesc}>
            Immediate assistance for battery failure, flat tyres, mechanical issues, or accidents in Bengaluru.
          </Text>

          <TouchableOpacity
            style={styles.sosBtn}
            activeOpacity={0.85}
            onPress={handleCallSOS}>
            <Ionicons name="warning" size={18} color="#FFFFFF" />
            <Text style={styles.sosBtnText}>CALL 1800-419-7274 (TOLL-FREE)</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown Protocol */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What to do in case of a breakdown:</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Park the vehicle safely on the left curb and turn on hazard flashers.
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Press the SOS button above or call the station nearest to your location.
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Share your live WhatsApp or Google Maps pin with the patrol dispatcher.
            </Text>
          </View>
        </View>

        {/* Station Direct Lines */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Station Contact Directory</Text>
          {BANGALORE_HUBS.map((hub) => (
            <TouchableOpacity
              key={hub.id}
              style={styles.hubContactRow}
              activeOpacity={0.7}
              onPress={() => handleCallHub(hub.name, hub.phone)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hubContactName}>{hub.name}</Text>
                <Text style={styles.hubContactHours}>🕒 {hub.operatingHours}</Text>
              </View>
              <View style={styles.hubCallBtn}>
                <Ionicons name="call-outline" size={14} color={Colors.primary} />
                <Text style={styles.hubCallText}>{hub.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Speed and Helmet Reminder */}
        <View style={styles.safetyCard}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.successDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>Bengaluru Traffic Police Advisory</Text>
            <Text style={styles.safetyDesc}>
              - Wearing an ISI helmet with chinstrap fastened is mandatory.{'\n'}
              - Max city speed is 70 km/h.{'\n'}
              - Carrying a pillion without a helmet incurs a fine under the Motor Vehicles Act.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: 40,
    gap: Layout.spacing.md,
  },
  sosCard: {
    backgroundColor: '#DC2626',
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    ...Layout.shadow.elevated,
  },
  sosIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sosDesc: {
    fontSize: 12,
    color: '#FEE2E2',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: Layout.spacing.md,
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991B1B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Layout.radius.md,
    gap: 8,
  },
  sosBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    ...Layout.shadow.subtle,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  stepText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  hubContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hubContactName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  hubContactHours: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hubCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  hubCallText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  safetyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.successLight,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    gap: 10,
    alignItems: 'flex-start',
  },
  safetyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.successDark,
  },
  safetyDesc: {
    fontSize: 11,
    color: Colors.successDark,
    marginTop: 4,
    lineHeight: 18,
  },
});
