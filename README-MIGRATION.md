# RapidRental Backend Migration Guide: Firebase to Supabase

This document provides complete instructions for the migration of the RapidRental React Native (Expo) mobile app from **Firebase** (Firestore + Auth + Storage) to **Supabase** (PostgreSQL + Auth + Storage).

---

## 1. Architecture & Summary of Changes

| Layer | Firebase Implementation | Supabase Implementation |
|---|---|---|
| **Database** | Google Cloud Firestore (NoSQL) | PostgreSQL with schema in `migration/schema.sql` |
| **Authentication** | Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`) | Supabase Auth (`supabase.auth.signInWithPassword`, `signUp`, `onAuthStateChange`) |
| **Storage** | Firebase Storage | Supabase Storage (`licenses` bucket) |
| **Realtime** | Firestore `onSnapshot()` | Supabase Realtime Channels (`postgres_changes`) |
| **Access Control** | Firestore Security Rules (`firestore.rules`) | PostgreSQL Row Level Security (RLS) Policies |
| **Client** | `firebase` modular v9+ SDK | `@supabase/supabase-js` v2 + `react-native-url-polyfill` |

---

## 2. Directory Structure of Migration Artifacts

```
├── migration/
│   ├── exportFirebase.js       # Node.js script to extract data from Firestore
│   ├── importSupabase.js       # Node.js script to ingest data into Supabase
│   ├── schema.sql              # Complete PostgreSQL DDL, RLS, and seed data
│   └── data/
│       ├── vehicles.json       # 10 exported fleet vehicles
│       ├── bookings.json       # Exported bookings records
│       └── profiles.json       # Exported user profiles
├── lib/
│   └── supabase.js             # Initialized Supabase client with AsyncStorage
├── services/
│   └── supabaseRentalService.ts# Full application service layer for Supabase
├── legacy-firebase/            # Complete rollback backup of previous Firebase code
│   ├── firebaseConfig.js
│   ├── firebase.js
│   ├── firebase.ts
│   ├── firebaseRentalService.ts
│   ├── firestore.rules
│   └── firebase.json
├── .env.example                # Sample environment variables
└── scripts/
    ├── verify.js               # Core app fleet pricing & screen verification
    └── verify-supabase.js      # Supabase migration assertions & validation suite
```

---

## 3. How to Set Up Supabase

### Option A: Supabase Cloud (Recommended for Production)
1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, paste and execute the entire contents of [`migration/schema.sql`](file:///Users/princejha/Documents/rental2.1/migration/schema.sql).
3. In **Storage**, create a new bucket named `licenses` (set public read if desired or configure private access).
4. Copy your **Project URL** and **anon public key** from Project Settings > API.
5. Create `.env` in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Option B: Self-Hosted Supabase via Docker (Local Development)
> **Note for Mobile**: When testing on physical devices or Android/iOS emulators, do **not** use `http://localhost:8000`. Use your machine's LAN IP (e.g. `http://192.168.31.128:8000`).

1. Run the Supabase Docker stack or launch the Supabase CLI:
   ```bash
   supabase init
   supabase start
   ```
2. Apply the schema:
   ```bash
   psql -h 192.168.31.128 -p 5432 -U postgres -d postgres -f migration/schema.sql
   ```
3. Update `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://192.168.31.128:8000
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-jwt-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-jwt-service-role-key
   ```

---

## 4. How to Run the Migration Scripts

### Step 1: Export from Firebase (Completed)
The export script connects to Firebase and dumps all collections to `migration/data/*.json`:
```bash
node migration/exportFirebase.js
```
*Output: `migration/data/vehicles.json` (10 items), `bookings.json`, `profiles.json`.*

### Step 2: Seed & Import into Supabase
Execute the ingestion script to upsert all 10 vehicles and any existing bookings into PostgreSQL:
```bash
node migration/importSupabase.js
```

---

## 5. Row Level Security (RLS) Configuration

RLS is enabled on all tables in `migration/schema.sql`:

1. **`vehicles` Table**:
   - **Public Read**: Anyone (authenticated or guest riders) can view the fleet catalog:
     ```sql
     CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (true);
     ```
   - **Admin Write**: Only users with `role = 'admin'` in `profiles` can update vehicle status or add vehicles:
     ```sql
     CREATE POLICY "vehicles_admin_write" ON vehicles FOR ALL USING (
       EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
     );
     ```

2. **`bookings` Table**:
   - **User Isolation**: Riders can only read, insert, and update their own booking records:
     ```sql
     CREATE POLICY "bookings_user_own" ON bookings FOR ALL USING (auth.uid() = user_id);
     ```

3. **`profiles` Table**:
   - **Profile Privacy**: Riders can only read and update their own personal profile data:
     ```sql
     CREATE POLICY "profiles_user_own" ON profiles FOR ALL USING (auth.uid() = id);
     ```

4. **Real-time Publication**:
   - Replication is enabled for live updates:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
     ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
     ```

---

## 6. Testing & Verification

Run the verification test suites to validate database schemas, pricing integrity, and zero Firebase imports:

```bash
# 1. Run Mobile App Fleet & Asset Verification
node scripts/verify.js

# 2. Run Supabase Migration Assertion Suite (54 checks)
node scripts/verify-supabase.js

# 3. TypeScript Type-Checking
npx tsc --noEmit
```

---

## 7. Rollback Procedure (If Needed)

If you ever need to roll back to Firebase:
1. Reinstall the Firebase package:
   ```bash
   npm install firebase@^11.4.0
   ```
2. Restore the backed-up files from `legacy-firebase/`:
   ```bash
   cp legacy-firebase/firebaseRentalService.ts services/
   cp legacy-firebase/firebase.ts config/
   cp legacy-firebase/firebaseConfig.js ./
   ```
3. Update `RentalContext.tsx`, `HomeScreen.js`, `AuthScreen.js`, `MyBookingsScreen.js`, and `AdminPanelScreen.js` to point back to the restored Firebase services.
4. Remove `legacy-firebase` from the `exclude` list in `tsconfig.json`.
