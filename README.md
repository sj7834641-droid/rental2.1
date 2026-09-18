# RapidRental — Bike & Scooty Rental Mobile App (Expo + Firebase)

RapidRental is a cross-platform (iOS, Android, Web) bike and scooty rental mobile application built with React Native (Expo) and powered by **Firebase v9+ Modular SDK** (Cloud Firestore, Firebase Authentication, and Firebase Storage).

---

## 🚀 Key Operational Commands

### 1. Deploy Firestore Security Rules
To deploy the security rules to the connected Firebase project (`trying-app-4e070`):
```bash
firebase deploy --only firestore:rules
```

### 2. Run Firestore Vehicles Seed Script
To populate or refresh the 10-vehicle fleet into the `vehicles` collection:
```bash
node scripts/seedVehicles.js
```

### 3. Start Expo Dev Server
To run the Expo development server locally:
```bash
npx expo start
```
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Press `w` for Web browser

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React Native 0.86.3 with Expo ~57 (Expo Router)
- **Backend & Database**: Firebase v9+ Modular SDK (`firebase/app`, `firebase/firestore`, `firebase/auth`, `firebase/storage`)
- **Offline Storage**: `@react-native-async-storage/async-storage` (resilient offline fallback for vehicles fleet)
- **Styling**: Native StyleSheet with modern, polished mobile UI/UX

---

## 📁 Key Deliverables & File Structure

| Deliverable | Path | Description |
|---|---|---|
| **Firebase Modular Init** | [`lib/firebase.js`](lib/firebase.js) | Initializes `app`, `db` (`getFirestore`), `auth` (`getAuth`), `storage` (`getStorage`) |
| **Fleet Seeder** | [`scripts/seedVehicles.js`](scripts/seedVehicles.js) | Seeds exactly 10 fleet vehicles with exact pricing and ₹7,101 total deposit |
| **Security Rules** | [`firestore.rules`](firestore.rules) | Production security rules for `vehicles`, `bookings`, and `profiles` |
| **Home Screen** | [`HomeScreen.js`](HomeScreen.js) & [`components/HomeScreen.js`](components/HomeScreen.js) | Real-time fleet fetch (`onSnapshot`), AsyncStorage caching, "🟢 Live" / "🔴 Offline" banner |
| **My Bookings Screen** | [`MyBookingsScreen.js`](MyBookingsScreen.js) & [`components/MyBookingsScreen.js`](components/MyBookingsScreen.js) | Scoped bookings query (`where('userId', '==', user.uid)`), cancellation flow |
| **Admin Panel Screen** | [`AdminPanelScreen.js`](AdminPanelScreen.js) & [`components/AdminPanelScreen.js`](components/AdminPanelScreen.js) | Vehicle status toggle (`available` <-> `rented` <-> `maintenance`), fleet KPIs, all bookings |
| **Auth Screen** | [`AuthScreen.js`](AuthScreen.js) & [`components/AuthScreen.js`](components/AuthScreen.js) | Sign-up, Sign-in, Sign-out, and session state persistence via `onAuthStateChanged` |
| **Configuration** | [`firebaseConfig.js`](firebaseConfig.js) | Centralized Firebase configuration for project `trying-app-4e070` |

---

## 📦 Firestore Schema

### `vehicles` Collection
- **Document ID**: `vehicle_1`, `vehicle_2`, ... `vehicle_10`
- **Fields**:
  - `id`: number (1 to 10)
  - `name`: string (e.g., "Activa 3G", "Jupiter/J-2")
  - `type`: `'Scooty'` | `'Bike'`
  - `deposit`: number (e.g., 500, 1 promo for Jupiter, 1000 for NS Pulsar)
  - `price_3hr`: number
  - `price_6hr`: number
  - `price_12hr`: number
  - `price_24hr`: number
  - `price_7days`: number
  - `overtime`: string (e.g., "50/Hr", "60/Hr", "70/Hr")
  - `status`: `'available'` | `'rented'` | `'maintenance'`
  - `createdAt`: serverTimestamp

### `bookings` Collection
- **Document ID**: Auto-generated string
- **Fields**:
  - `userId`: string (Firebase Auth UID)
  - `vehicleId`: number (e.g., 1)
  - `vehicleName`: string (e.g., "Activa 3G")
  - `pickupTime`: timestamp
  - `dropoffTime`: timestamp
  - `totalAmount`: number
  - `depositAmount`: number
  - `status`: `'active'` | `'completed'` | `'cancelled'`
  - `createdAt`: serverTimestamp

### `profiles` Collection
- **Document ID**: Firebase Auth UID (1:1 mapping)
- **Fields**:
  - `fullName`: string
  - `phone`: string
  - `licenseUrl`: string
  - `createdAt`: serverTimestamp

---

## 🔒 Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Vehicles: public read, only authenticated admin write
    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Bookings: users can only read/write their own
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && (request.resource.data.userId == request.auth.uid || request.auth.uid != null);
      allow update, delete: if request.auth != null;
    }
    // Profiles: users can only access their own
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 Testing and Verification Suites

Run the complete verification test suites with:

```bash
# 1. Base verification suite (125 tests)
node scripts/verify.js

# 2. Firebase modular backend verification suite (11 tests)
node scripts/test-firebase-upgrade.js

# 3. TypeScript type check
npx tsc --noEmit
```

All 136 tests pass with 100% success rate.
