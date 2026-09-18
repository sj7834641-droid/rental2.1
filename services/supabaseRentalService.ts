/**
 * services/supabaseRentalService.ts
 * Supabase Backend Service for RapidRental
 * Official @supabase/supabase-js v2 client integration
 * Replaces Firebase Firestore + Storage + Auth service layer
 */

import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FLEET_DATA, Vehicle } from '@/data/fleet';
import { BANGALORE_HUBS, RentalHub } from '@/data/hubs';
import { BookingRecord, UserProfile } from '@/context/RentalContext';

export const STORAGE_VEHICLES_CACHE_KEY = '@rapidrental_vehicles_cache';

export interface SupabaseBooking {
  id: string;
  user_id?: string | null;
  vehicle_id: number;
  vehicle_name: string;
  pickup_time: string;
  dropoff_time: string;
  total_amount: number;
  deposit_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface SupabaseProfile {
  id: string;
  full_name?: string;
  phone?: string;
  license_url?: string;
  role?: 'user' | 'admin';
  created_at?: string;
}

/**
 * Ensure Supabase session exists or get current user ID
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user.id;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error: any) {
    console.warn('[Supabase Auth] Session notice:', error.message);
    return null;
  }
}

/**
 * Fetch all vehicles from Supabase PostgreSQL
 */
export async function fetchVehiclesFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Merge or hydrate with local static data (such as local images) if applicable
    if (data && data.length > 0) {
      return data.map((v) => {
        const local = FLEET_DATA.find((item) => item.id === v.id);
        return {
          ...v,
          image: local?.image || null,
          pricing: {
            '3Hr': v.price_3hr || local?.pricing['3Hr'],
            '6Hr': v.price_6hr || local?.pricing['6Hr'],
            '12Hr': v.price_12hr || local?.pricing['12Hr'],
            '24Hr': v.price_24hr || local?.pricing['24Hr'],
            '7Days': v.price_7days || local?.pricing['7Days'],
          },
        };
      });
    }
    return [];
  } catch (error: any) {
    console.warn('[Supabase Service] Error fetching vehicles:', error.message);
    return [];
  }
}

/**
 * Real-time subscription to vehicles table with offline cache fallback
 */
export function subscribeToVehicles(
  onUpdate: (vehicles: any[], isLive: boolean) => void
) {
  // First attempt initial fetch
  fetchVehiclesFromSupabase().then(async (vehicles) => {
    if (vehicles && vehicles.length > 0) {
      onUpdate(vehicles, true);
      await AsyncStorage.setItem(STORAGE_VEHICLES_CACHE_KEY, JSON.stringify(vehicles)).catch(() => {});
    } else {
      const cached = await AsyncStorage.getItem(STORAGE_VEHICLES_CACHE_KEY).catch(() => null);
      if (cached) {
        onUpdate(JSON.parse(cached), false);
      }
    }
  });

  const channel = supabase
    .channel('vehicles-catalog-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vehicles' },
      async () => {
        const vehicles = await fetchVehiclesFromSupabase();
        if (vehicles && vehicles.length > 0) {
          onUpdate(vehicles, true);
          await AsyncStorage.setItem(STORAGE_VEHICLES_CACHE_KEY, JSON.stringify(vehicles)).catch(() => {});
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Toggle vehicle status in Supabase (Admin operation)
 */
export async function toggleVehicleStatus(
  vehicleId: number | string,
  newStatus: 'available' | 'rented' | 'maintenance'
): Promise<boolean> {
  try {
    const id = typeof vehicleId === 'string' ? parseInt(vehicleId, 10) : vehicleId;
    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('[Supabase Service] Error updating vehicle status:', error.message);
    return false;
  }
}

/**
 * Seed or synchronize verified fleet to Supabase 'vehicles' table
 */
export async function syncFleetToSupabase(): Promise<boolean> {
  try {
    const rows = FLEET_DATA.map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      deposit: v.deposit,
      price_3hr: v.pricing['3Hr'],
      price_6hr: v.pricing['6Hr'],
      price_12hr: v.pricing['12Hr'],
      price_24hr: v.pricing['24Hr'],
      price_7days: v.pricing['7Days'],
      overtime: v.overtime,
      status: 'available',
    }));

    const { error } = await supabase
      .from('vehicles')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    console.log('[Supabase] Fleet synchronized to PostgreSQL successfully');
    return true;
  } catch (error: any) {
    console.error('[Supabase] Failed to sync fleet to Supabase:', error.message);
    return false;
  }
}

/**
 * Save a newly confirmed booking in Supabase
 */
export async function saveBookingToSupabase(booking: BookingRecord | any): Promise<boolean> {
  try {
    const userId = await ensureSupabaseSession();
    const row = {
      id: booking.id,
      user_id: userId,
      vehicle_id: booking.vehicle?.id || 1,
      vehicle_name: booking.vehicle?.name || 'RapidRental Vehicle',
      pickup_time: booking.pickupTime ? new Date().toISOString() : new Date().toISOString(),
      dropoff_time: booking.dropTime ? new Date(Date.now() + (booking.hours || 24) * 3600000).toISOString() : new Date().toISOString(),
      total_amount: booking.fare?.totalPayable || 550,
      deposit_amount: booking.fare?.deposit ?? booking.vehicle?.deposit ?? 500,
      status: (booking.status || 'ACTIVE').toLowerCase(),
    };

    const { error } = await supabase.from('bookings').upsert([row], { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Warning saving booking:', error.message);
      return false;
    }
    console.log(`[Supabase] Booking ${booking.id} saved successfully.`);
    return true;
  } catch (err: any) {
    console.error(`[Supabase] Failed to save booking:`, err.message);
    return false;
  }
}

/**
 * Update an existing booking (e.g. extension, cancellation, completion)
 */
export async function updateBookingInSupabase(
  bookingId: string,
  updates: Partial<BookingRecord> | any
): Promise<boolean> {
  try {
    const mappedUpdates: Record<string, any> = {};
    if (updates.status) {
      mappedUpdates.status = updates.status.toLowerCase();
    }
    if (updates.fare?.totalPayable) {
      mappedUpdates.total_amount = updates.fare.totalPayable;
    }

    const { error } = await supabase
      .from('bookings')
      .update(mappedUpdates)
      .eq('id', bookingId);

    if (error) throw error;
    console.log(`[Supabase] Booking ${bookingId} updated successfully`);
    return true;
  } catch (error: any) {
    console.error(`[Supabase] Failed to update booking ${bookingId}:`, error.message);
    return false;
  }
}

/**
 * Subscribe to real-time updates of active booking
 */
export function subscribeToActiveBooking(
  bookingId: string,
  onUpdate: (booking: any) => void
) {
  const channel = supabase
    .channel(`active-booking-${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch user bookings from Supabase
 */
export async function fetchUserBookingsFromSupabase(
  userId?: string
): Promise<{ active: any | null; history: any[] }> {
  try {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;

    let active: any = null;
    const history: any[] = [];
    (data || []).forEach((item) => {
      if (item.status === 'active') {
        active = item;
      } else {
        history.push(item);
      }
    });

    return { active, history };
  } catch (error: any) {
    console.error('[Supabase] Failed to fetch user bookings:', error.message);
    return { active: null, history: [] };
  }
}

/**
 * Save user profile to Supabase profiles table
 */
export async function saveProfileToSupabase(profile: SupabaseProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('[Supabase Service] Error saving profile:', error.message);
    return false;
  }
}

/**
 * Sync user profile to Supabase
 */
export async function syncUserProfileToSupabase(
  userId: string,
  profile: UserProfile
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profile.name,
        phone: profile.phone,
      }, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('[Supabase] Failed to sync user profile:', error.message);
    return false;
  }
}

/**
 * Upload Driving License to Supabase Storage ('licenses' bucket)
 */
export async function uploadLicenseToSupabaseStorage(
  userId: string,
  fileBlob: Blob | ArrayBuffer | Uint8Array,
  fileExt: string = 'jpg'
): Promise<string | null> {
  try {
    const filePath = `user_${userId}/license_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('licenses')
      .upload(filePath, fileBlob, { upsert: true, contentType: `image/${fileExt}` });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('licenses').getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (error: any) {
    console.warn('[Supabase Storage] License upload notice:', error.message);
    return null;
  }
}
