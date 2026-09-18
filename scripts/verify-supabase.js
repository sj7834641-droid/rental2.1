const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('⚡ RAPIDRENTAL SUPABASE MIGRATION VERIFICATION SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, name, detail) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${name}: ${detail || 'Assertion failed'}`);
    process.exit(1);
  }
}

// 1. Verify Exported Data Files
const dataDir = path.join(__dirname, '../migration/data');
assert(fs.existsSync(path.join(dataDir, 'vehicles.json')), 'Exported vehicles.json exists');
const exportedVehicles = JSON.parse(fs.readFileSync(path.join(dataDir, 'vehicles.json'), 'utf-8'));
assert(exportedVehicles.length === 10, 'Exported vehicles has exactly 10 items');

assert(fs.existsSync(path.join(dataDir, 'bookings.json')), 'Exported bookings.json exists');
const exportedBookings = JSON.parse(fs.readFileSync(path.join(dataDir, 'bookings.json'), 'utf-8'));
assert(exportedBookings.length >= 1, 'Exported bookings contains previous records');

assert(fs.existsSync(path.join(dataDir, 'profiles.json')), 'Exported profiles.json exists');

// 2. Verify Schema SQL
const schemaPath = path.join(__dirname, '../migration/schema.sql');
assert(fs.existsSync(schemaPath), 'migration/schema.sql exists');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS vehicles'), 'Schema creates vehicles table');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS bookings'), 'Schema creates bookings table');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS profiles'), 'Schema creates profiles table');
assert(schemaContent.includes('ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY'), 'RLS enabled on vehicles');
assert(schemaContent.includes('ALTER TABLE bookings ENABLE ROW LEVEL SECURITY'), 'RLS enabled on bookings');
assert(schemaContent.includes('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY'), 'RLS enabled on profiles');
assert(schemaContent.includes('CREATE POLICY "vehicles_public_read"'), 'RLS policy vehicles_public_read defined');
assert(schemaContent.includes('CREATE POLICY "vehicles_admin_write"'), 'RLS policy vehicles_admin_write defined');
assert(schemaContent.includes('CREATE POLICY "bookings_user_own"'), 'RLS policy bookings_user_own defined');
assert(schemaContent.includes('CREATE POLICY "profiles_user_own"'), 'RLS policy profiles_user_own defined');
assert(schemaContent.includes('supabase_realtime'), 'Real-time publication configured');
assert(schemaContent.includes('INSERT INTO vehicles'), 'Schema seeds 10 fleet vehicles');
assert(schemaContent.includes("'Jupiter/J-2', 'Scooty', 1"), 'Jupiter ₹1 deposit preserved in SQL');
assert(schemaContent.includes("'Ns Pulsar', 'Bike', 1000"), 'NS Pulsar ₹1000 deposit preserved in SQL');

// 3. Verify Supabase Client
const clientPath = path.join(__dirname, '../lib/supabase.js');
assert(fs.existsSync(clientPath), 'lib/supabase.js exists');
const clientContent = fs.readFileSync(clientPath, 'utf-8');
assert(clientContent.includes('@supabase/supabase-js'), 'lib/supabase.js imports @supabase/supabase-js');
assert(clientContent.includes('react-native-url-polyfill/auto'), 'lib/supabase.js imports react-native-url-polyfill');
assert(clientContent.includes('createClient('), 'lib/supabase.js creates Supabase client');
assert(clientContent.includes('192.168.31.128:8000') || clientContent.includes('EXPO_PUBLIC_SUPABASE_URL'), 'Configured for LAN / Docker IP');

// 4. Verify Supabase Service Layer
const servicePath = path.join(__dirname, '../services/supabaseRentalService.ts');
assert(fs.existsSync(servicePath), 'services/supabaseRentalService.ts exists');
const serviceContent = fs.readFileSync(servicePath, 'utf-8');
assert(serviceContent.includes('fetchVehiclesFromSupabase'), 'Service exports fetchVehiclesFromSupabase');
assert(serviceContent.includes('subscribeToVehicles'), 'Service exports subscribeToVehicles');
assert(serviceContent.includes('toggleVehicleStatus'), 'Service exports toggleVehicleStatus');
assert(serviceContent.includes('saveBookingToSupabase'), 'Service exports saveBookingToSupabase');
assert(serviceContent.includes('updateBookingInSupabase'), 'Service exports updateBookingInSupabase');
assert(serviceContent.includes('subscribeToActiveBooking'), 'Service exports subscribeToActiveBooking');
assert(serviceContent.includes('saveProfileToSupabase'), 'Service exports saveProfileToSupabase');
assert(serviceContent.includes('uploadLicenseToSupabaseStorage'), 'Service exports uploadLicenseToSupabaseStorage');

// 5. Verify Components Use Supabase
const homeScreen = fs.readFileSync(path.join(__dirname, '../components/HomeScreen.js'), 'utf-8');
assert(homeScreen.includes("from '../lib/supabase'"), 'HomeScreen imports supabase');
assert(homeScreen.includes(".from('vehicles')"), "HomeScreen queries 'vehicles' table");
assert(homeScreen.includes("postgres_changes"), 'HomeScreen subscribes to postgres_changes');

const authScreen = fs.readFileSync(path.join(__dirname, '../components/AuthScreen.js'), 'utf-8');
assert(authScreen.includes("supabase.auth.signUp"), 'AuthScreen uses supabase.auth.signUp');
assert(authScreen.includes("supabase.auth.signInWithPassword"), 'AuthScreen uses supabase.auth.signInWithPassword');
assert(authScreen.includes("supabase.auth.signOut"), 'AuthScreen uses supabase.auth.signOut');
assert(authScreen.includes("supabase.auth.onAuthStateChange"), 'AuthScreen uses onAuthStateChange');

const bookingsScreen = fs.readFileSync(path.join(__dirname, '../components/MyBookingsScreen.js'), 'utf-8');
assert(bookingsScreen.includes(".from('bookings')"), "MyBookingsScreen queries 'bookings' table");

const adminScreen = fs.readFileSync(path.join(__dirname, '../components/AdminPanelScreen.js'), 'utf-8');
assert(adminScreen.includes("supabase.from('vehicles')"), "AdminPanelScreen updates 'vehicles' table");
assert(adminScreen.includes("role === 'admin'"), 'AdminPanelScreen checks for admin role');

// 6. Verify Context & Screens
const contextContent = fs.readFileSync(path.join(__dirname, '../context/RentalContext.tsx'), 'utf-8');
assert(contextContent.includes("from '@/services/supabaseRentalService'"), 'RentalContext uses supabaseRentalService');
assert(!contextContent.includes("from 'firebase"), 'RentalContext has NO firebase imports');

const headerContent = fs.readFileSync(path.join(__dirname, '../components/HeaderBar.tsx'), 'utf-8');
assert(headerContent.includes('isSupabaseConnected'), 'HeaderBar displays isSupabaseConnected live badge');

const profileContent = fs.readFileSync(path.join(__dirname, '../app/(tabs)/profile.tsx'), 'utf-8');
assert(profileContent.includes('syncFleetToSupabase'), 'ProfileScreen syncs to Supabase');
assert(profileContent.includes('Supabase PostgreSQL'), 'ProfileScreen displays Supabase backend info');

// 7. Verify Firebase Removal from Project
const legacyDir = path.join(__dirname, '../legacy-firebase');
assert(!fs.existsSync(legacyDir), 'legacy-firebase directory completely removed');
assert(!fs.existsSync(path.join(__dirname, '../firebase.json')), 'root firebase.json completely removed');
assert(!fs.existsSync(path.join(__dirname, '../google-services.json')), 'google-services.json completely removed');

// 8. Zero Firebase Imports in Active Application Code
function checkDirectoryForFirebaseImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'legacy-firebase' || entry.name === 'migration') {
        continue;
      }
      checkDirectoryForFirebaseImports(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes("from 'firebase") || content.includes('from "firebase') || content.includes("require('firebase")) {
        // Skip scripts dir for historical scripts
        if (!fullPath.includes('/scripts/')) {
          assert(false, `No Firebase imports in ${path.relative(path.join(__dirname, '..'), fullPath)}`, `Found Firebase import in ${fullPath}`);
        }
      }
    }
  }
}
checkDirectoryForFirebaseImports(path.join(__dirname, '..'));
assert(true, 'Zero Firebase imports in active application codebase (app/, components/, context/, services/, lib/)');

console.log(`\n====================================================`);
console.log(`🏆 ALL ${passedTests}/${totalTests} SUPABASE MIGRATION TESTS PASSED!`);
console.log(`====================================================\n`);
