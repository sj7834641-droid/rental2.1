-- RapidRental Supabase PostgreSQL Schema
-- Migration from Firebase (Firestore) to Supabase

-- 1. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Scooty', 'Bike')),
  deposit INT NOT NULL,
  price_3hr INT NOT NULL,
  price_6hr INT NOT NULL,
  price_12hr INT NOT NULL,
  price_24hr INT NOT NULL,
  price_7days INT NOT NULL,
  overtime TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT ('RR-BLR-' || floor(random() * 90000 + 10000)::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id INT REFERENCES vehicles(id),
  vehicle_name TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  dropoff_time TIMESTAMPTZ NOT NULL,
  total_amount INT NOT NULL,
  deposit_amount INT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  license_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_public_read" ON vehicles;
DROP POLICY IF EXISTS "vehicles_admin_write" ON vehicles;
DROP POLICY IF EXISTS "bookings_user_own" ON bookings;
DROP POLICY IF EXISTS "profiles_user_own" ON profiles;

-- Vehicles: public read, admin write
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_admin_write" ON vehicles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Bookings: users see only their own
CREATE POLICY "bookings_user_own" ON bookings FOR ALL USING (auth.uid() = user_id);

-- Profiles: users see/update only their own
CREATE POLICY "profiles_user_own" ON profiles FOR ALL USING (auth.uid() = id);

-- 5. REAL-TIME REPLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. FLEET DATA SEED (Exact 10 vehicles, total deposit ₹7,101)
INSERT INTO vehicles (id, name, type, deposit, price_3hr, price_6hr, price_12hr, price_24hr, price_7days, overtime, status)
VALUES
(1, 'Activa 3G', 'Scooty', 500, 120, 220, 350, 550, 2100, '50/Hr', 'available'),
(2, 'Jupiter/J-2', 'Scooty', 1, 120, 220, 350, 550, 2100, '50/Hr', 'available'),
(3, 'Maestro Edge', 'Scooty', 800, 150, 280, 450, 620, 2450, '60/Hr', 'available'),
(4, 'Maestro', 'Scooty', 800, 150, 280, 440, 620, 2450, '60/Hr', 'available'),
(5, 'Avaitor', 'Scooty', 800, 150, 280, 450, 620, 2450, '60/Hr', 'available'),
(6, 'Activa 4G', 'Scooty', 800, 150, 270, 420, 620, 2450, '60/Hr', 'available'),
(7, 'TVS Wego', 'Scooty', 800, 150, 280, 450, 620, 3450, '60/Hr', 'available'),
(8, 'Glamour', 'Bike', 800, 150, 270, 450, 620, 2450, '60/Hr', 'available'),
(9, 'Discover', 'Bike', 800, 150, 270, 450, 620, 2450, '60/Hr', 'available'),
(10, 'Ns Pulsar', 'Bike', 1000, 200, 360, 550, 860, 3450, '70/Hr', 'available')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  deposit = EXCLUDED.deposit,
  price_3hr = EXCLUDED.price_3hr,
  price_6hr = EXCLUDED.price_6hr,
  price_12hr = EXCLUDED.price_12hr,
  price_24hr = EXCLUDED.price_24hr,
  price_7days = EXCLUDED.price_7days,
  overtime = EXCLUDED.overtime,
  status = EXCLUDED.status;

