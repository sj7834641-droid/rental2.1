import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FLEET_DATA, Vehicle } from '@/data/fleet';
import { BANGALORE_HUBS, RentalHub } from '@/data/hubs';
import { AVAILABLE_COUPONS, Coupon } from '@/data/coupons';
import {
  ensureSupabaseSession,
  fetchVehiclesFromSupabase,
  syncFleetToSupabase,
  saveBookingToSupabase,
  updateBookingInSupabase,
  subscribeToActiveBooking,
  syncUserProfileToSupabase,
} from '@/services/supabaseRentalService';

export interface BookingAddons {
  extraHelmet: boolean; // +₹50
  mobileMount: boolean; // +₹30
  damageProtection: boolean; // +₹49
}

export interface FareCalculation {
  baseFare: number;
  packageTier: string;
  overtimeHours: number;
  overtimeCost: number;
  addonsCost: number;
  discount: number;
  taxGst: number;
  deposit: number;
  totalPayable: number;
  effectiveHours: number;
}

export interface BookingRecord {
  id: string; // e.g. "RR-BLR-84291"
  vehicle: Vehicle;
  pickupHub: RentalHub;
  dropHub: RentalHub;
  pickupTime: string;
  dropTime: string;
  hours: number;
  addons: BookingAddons;
  appliedCoupon?: string;
  fare: FareCalculation;
  pickupOtp: string; // e.g. "4819"
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  odometerStart?: number;
  riderName: string;
  riderPhone: string;
  dlNumber: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  dlNumber: string;
  isKycVerified: boolean;
}

interface RentalContextType {
  pickupHub: RentalHub;
  setPickupHub: (hub: RentalHub) => void;
  dropHub: RentalHub;
  setDropHub: (hub: RentalHub) => void;
  pickupDate: Date;
  setPickupDate: (date: Date) => void;
  dropDate: Date;
  setDropDate: (date: Date) => void;
  durationHours: number;
  setRentalDuration: (pickup: Date, drop: Date) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  activeBooking: BookingRecord | null;
  bookingHistory: BookingRecord[];
  calculateFare: (vehicle: Vehicle, hours: number, addons: BookingAddons, couponCode?: string) => FareCalculation;
  confirmBooking: (
    vehicle: Vehicle,
    addons: BookingAddons,
    couponCode: string | undefined,
    riderInfo: { name: string; phone: string; dlNumber: string }
  ) => BookingRecord;
  extendRide: (bookingId: string, additionalHours: number) => void;
  endRide: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  hubs: RentalHub[];
  coupons: Coupon[];
  isSupabaseConnected: boolean;
  supabaseUserId: string | null;
  // Aliases for backwards compatibility with any remaining legacy UI components
  isFirebaseConnected: boolean;
  firebaseUserId: string | null;
}

const STORAGE_ACTIVE_BOOKING_KEY = '@rapidrental_active_booking';
const STORAGE_BOOKING_HISTORY_KEY = '@rapidrental_booking_history';
const STORAGE_USER_KEY = '@rapidrental_user_profile';

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const RentalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hubs = BANGALORE_HUBS;
  const coupons = AVAILABLE_COUPONS;

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  const [pickupHub, setPickupHub] = useState<RentalHub>(BANGALORE_HUBS[0]);
  const [dropHub, setDropHub] = useState<RentalHub>(BANGALORE_HUBS[0]);

  // Default times: Start in 1 hour, duration 24 hours
  const now = new Date();
  const defaultPickup = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const defaultDrop = new Date(defaultPickup.getTime() + 24 * 60 * 60 * 1000);

  const [pickupDate, setPickupDate] = useState<Date>(defaultPickup);
  const [dropDate, setDropDate] = useState<Date>(defaultDrop);
  const [durationHours, setDurationHours] = useState<number>(24);

  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingRecord[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    dlNumber: 'KA01 20210048912',
    isKycVerified: true,
  });

  // Load persisted bookings from AsyncStorage and initialize Supabase backend
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedActive = await AsyncStorage.getItem(STORAGE_ACTIVE_BOOKING_KEY);
        if (storedActive) {
          setActiveBooking(JSON.parse(storedActive));
        }
        const storedHistory = await AsyncStorage.getItem(STORAGE_BOOKING_HISTORY_KEY);
        if (storedHistory) {
          setBookingHistory(JSON.parse(storedHistory));
        }
        const storedUser = await AsyncStorage.getItem(STORAGE_USER_KEY);
        if (storedUser) {
          setUserProfile(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load stored rental data', err);
      }
    }
    loadStoredData();

    // Connect to Supabase backend
    async function initSupabase() {
      try {
        const uid = await ensureSupabaseSession();
        if (uid) {
          setIsSupabaseConnected(true);
          setSupabaseUserId(uid);
        }
        // Verify live cloud connection by querying vehicles catalog
        const vehicles = await fetchVehiclesFromSupabase();
        if (vehicles && vehicles.length > 0) {
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        console.warn('[Supabase] Backend initialization notice:', err);
      }
    }
    initSupabase();
  }, []);

  // Real-time synchronization of active booking from Supabase
  useEffect(() => {
    if (!activeBooking?.id) return;
    const unsubscribe = subscribeToActiveBooking(activeBooking.id, (remoteBooking) => {
      if (remoteBooking && (remoteBooking.status === 'active' || remoteBooking.status === 'ACTIVE')) {
        setActiveBooking((prev) => {
          if (!prev || prev.id !== remoteBooking.id) return prev;
          return {
            ...prev,
            status: remoteBooking.status.toUpperCase() as any,
          };
        });
      }
    });
    return () => unsubscribe();
  }, [activeBooking?.id]);

  const setRentalDuration = (pickup: Date, drop: Date) => {
    setPickupDate(pickup);
    setDropDate(drop);
    const diffMs = drop.getTime() - pickup.getTime();
    const hrs = Math.max(3, Math.round(diffMs / (1000 * 60 * 60)));
    setDurationHours(hrs);
  };

  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profileUpdate };
      AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated)).catch(console.error);
      if (supabaseUserId) {
        syncUserProfileToSupabase(supabaseUserId, updated).catch((e) =>
          console.warn('[Supabase] Profile sync notice:', e)
        );
      }
      return updated;
    });
  };

  // Rentelo calculation engine using EXACT dataset pricing
  const calculateFare = (
    vehicle: Vehicle,
    hours: number,
    addons: BookingAddons,
    couponCode?: string
  ): FareCalculation => {
    const effectiveHours = Math.max(3, hours);
    let baseFare = 0;
    let packageTier = '3Hr';
    let overtimeHours = 0;
    let overtimeCost = 0;

    // Overtime hourly rate extracted from e.g. "50/Hr" -> 50
    const otRate = parseInt(vehicle.overtime.replace(/[^0-9]/g, ''), 10) || 50;

    if (effectiveHours >= 168) {
      // 7 Days or multiples
      const weeks = Math.floor(effectiveHours / 168);
      const remHours = effectiveHours % 168;
      baseFare = weeks * vehicle.pricing["7Days"];
      if (remHours > 0) {
        const remDays = Math.ceil(remHours / 24);
        baseFare += remDays * vehicle.pricing["24Hr"];
      }
      packageTier = `${weeks * 7} Days Package`;
    } else if (effectiveHours >= 24) {
      // Daily packages + remainder overtime
      const days = Math.floor(effectiveHours / 24);
      const remHours = effectiveHours % 24;
      baseFare = days * vehicle.pricing["24Hr"];
      if (remHours > 0) {
        if (remHours <= 3) {
          baseFare += vehicle.pricing["3Hr"];
        } else if (remHours <= 6) {
          baseFare += vehicle.pricing["6Hr"];
        } else if (remHours <= 12) {
          baseFare += vehicle.pricing["12Hr"];
        } else {
          baseFare += vehicle.pricing["24Hr"];
        }
      }
      packageTier = days === 1 && remHours === 0 ? '24 Hours (1 Day)' : `${effectiveHours} Hours Custom`;
    } else if (effectiveHours >= 12) {
      baseFare = vehicle.pricing["12Hr"];
      overtimeHours = effectiveHours - 12;
      overtimeCost = overtimeHours * otRate;
      packageTier = '12 Hours';
    } else if (effectiveHours >= 6) {
      baseFare = vehicle.pricing["6Hr"];
      overtimeHours = effectiveHours - 6;
      overtimeCost = overtimeHours * otRate;
      packageTier = '6 Hours';
    } else {
      baseFare = vehicle.pricing["3Hr"];
      overtimeHours = effectiveHours - 3;
      overtimeCost = overtimeHours * otRate;
      packageTier = '3 Hours';
    }

    // Addons cost
    let addonsCost = 0;
    if (addons.extraHelmet) addonsCost += 50;
    if (addons.mobileMount) addonsCost += 30;
    if (addons.damageProtection) addonsCost += 49;

    const rentalSubtotal = baseFare + overtimeCost + addonsCost;

    // Coupon discount logic
    let discount = 0;
    if (couponCode) {
      const match = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
      if (match && rentalSubtotal >= match.minOrderValue) {
        if (match.discountType === 'flat') {
          discount = match.discountValue;
        } else if (match.discountType === 'percentage') {
          const calc = Math.round((rentalSubtotal * match.discountValue) / 100);
          discount = match.maxDiscount ? Math.min(calc, match.maxDiscount) : calc;
        }
      }
    }

    const discountedSubtotal = Math.max(0, rentalSubtotal - discount);
    const taxGst = Math.round(discountedSubtotal * 0.18); // 18% standard GST
    const deposit = vehicle.deposit;
    const totalPayable = discountedSubtotal + taxGst + deposit;

    return {
      baseFare,
      packageTier,
      overtimeHours,
      overtimeCost,
      addonsCost,
      discount,
      taxGst,
      deposit,
      totalPayable,
      effectiveHours,
    };
  };

  const confirmBooking = (
    vehicle: Vehicle,
    addons: BookingAddons,
    couponCode: string | undefined,
    riderInfo: { name: string; phone: string; dlNumber: string }
  ): BookingRecord => {
    const fare = calculateFare(vehicle, durationHours, addons, couponCode);
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    const newBooking: BookingRecord = {
      id: `RR-BLR-${randomSuffix}`,
      vehicle,
      pickupHub,
      dropHub,
      pickupTime: pickupDate.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      dropTime: dropDate.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      hours: durationHours,
      addons,
      appliedCoupon: couponCode,
      fare,
      pickupOtp: otp,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      odometerStart: 12450 + Math.floor(Math.random() * 2000),
      riderName: riderInfo.name,
      riderPhone: riderInfo.phone,
      dlNumber: riderInfo.dlNumber,
    };

    setActiveBooking(newBooking);
    AsyncStorage.setItem(STORAGE_ACTIVE_BOOKING_KEY, JSON.stringify(newBooking)).catch(console.error);

    // Persist to Supabase
    saveBookingToSupabase(newBooking).catch((err) => {
      console.warn('[Supabase] Background booking save notice:', err);
    });

    return newBooking;
  };

  const extendRide = (bookingId: string, additionalHours: number) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;
    const newHours = activeBooking.hours + additionalHours;
    const updatedFare = calculateFare(
      activeBooking.vehicle,
      newHours,
      activeBooking.addons,
      activeBooking.appliedCoupon
    );
    const updatedBooking: BookingRecord = {
      ...activeBooking,
      hours: newHours,
      fare: updatedFare,
    };
    setActiveBooking(updatedBooking);
    AsyncStorage.setItem(STORAGE_ACTIVE_BOOKING_KEY, JSON.stringify(updatedBooking)).catch(console.error);

    // Sync ride extension to Supabase
    updateBookingInSupabase(bookingId, {
      hours: newHours,
      fare: updatedFare,
    }).catch((err) => console.warn('[Supabase] Background extend notice:', err));
  };

  const endRide = (bookingId: string) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;
    const completedBooking: BookingRecord = {
      ...activeBooking,
      status: 'COMPLETED',
    };
    const updatedHistory = [completedBooking, ...bookingHistory];
    setActiveBooking(null);
    setBookingHistory(updatedHistory);
    AsyncStorage.removeItem(STORAGE_ACTIVE_BOOKING_KEY).catch(console.error);
    AsyncStorage.setItem(STORAGE_BOOKING_HISTORY_KEY, JSON.stringify(updatedHistory)).catch(console.error);

    // Sync ride completion to Supabase
    updateBookingInSupabase(bookingId, {
      status: 'COMPLETED',
    }).catch((err) => console.warn('[Supabase] Background endRide notice:', err));
  };

  const cancelBooking = (bookingId: string) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;
    const cancelledBooking: BookingRecord = {
      ...activeBooking,
      status: 'CANCELLED',
    };
    const updatedHistory = [cancelledBooking, ...bookingHistory];
    setActiveBooking(null);
    setBookingHistory(updatedHistory);
    AsyncStorage.removeItem(STORAGE_ACTIVE_BOOKING_KEY).catch(console.error);
    AsyncStorage.setItem(STORAGE_BOOKING_HISTORY_KEY, JSON.stringify(updatedHistory)).catch(console.error);

    // Sync cancellation to Supabase
    updateBookingInSupabase(bookingId, {
      status: 'CANCELLED',
    }).catch((err) => console.warn('[Supabase] Background cancel notice:', err));
  };

  return (
    <RentalContext.Provider
      value={{
        pickupHub,
        setPickupHub,
        dropHub,
        setDropHub,
        pickupDate,
        setPickupDate,
        dropDate,
        setDropDate,
        durationHours,
        setRentalDuration,
        userProfile,
        updateUserProfile,
        activeBooking,
        bookingHistory,
        calculateFare,
        confirmBooking,
        extendRide,
        endRide,
        cancelBooking,
        hubs,
        coupons,
        isSupabaseConnected,
        supabaseUserId,
        isFirebaseConnected: isSupabaseConnected,
        firebaseUserId: supabaseUserId,
      }}>
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};
