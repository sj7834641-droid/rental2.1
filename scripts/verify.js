const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('🏍️  RAPIDRENTAL MOBILE APP VERIFICATION SUITE');
console.log('==============================================\n');

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

// 1. Verify fleet.ts content and structure
const fleetPath = path.join(__dirname, '../data/fleet.ts');
const fleetContent = fs.readFileSync(fleetPath, 'utf-8');

// Parse FLEET_DATA by evaluating without require of images
const fleetDataRaw = fleetContent
  .replace(/require\(['"].*?['"]\)/g, '1')
  .replace(/export const /g, 'const ')
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/: Vehicle\[\]/g, '')
  .replace(/: number/g, '');

const sandbox = {};
const fn = new Function('sandbox', fleetDataRaw + '\nsandbox.FLEET_DATA = FLEET_DATA;\nsandbox.TOTAL_VEHICLE_COUNT = TOTAL_VEHICLE_COUNT;\nsandbox.SCOOTY_COUNT = SCOOTY_COUNT;\nsandbox.BIKE_COUNT = BIKE_COUNT;\nsandbox.TOTAL_DEPOSIT_VALUE = TOTAL_DEPOSIT_VALUE;');
fn(sandbox);

const FLEET_DATA = sandbox.FLEET_DATA;

// Test 1: Exactly 10 vehicles
assert(FLEET_DATA.length === 10, 'Total fleet has exactly 10 vehicles', `Found ${FLEET_DATA.length}`);
assert(sandbox.TOTAL_VEHICLE_COUNT === 10, 'TOTAL_VEHICLE_COUNT constant equals 10');

// Test 2: Exactly 7 Scooties and 3 Bikes
const scooties = FLEET_DATA.filter(v => v.type === 'Scooty');
const bikes = FLEET_DATA.filter(v => v.type === 'Bike');
assert(scooties.length === 7, 'Fleet has exactly 7 Scooties', `Found ${scooties.length}`);
assert(sandbox.SCOOTY_COUNT === 7, 'SCOOTY_COUNT constant equals 7');
assert(bikes.length === 3, 'Fleet has exactly 3 Bikes', `Found ${bikes.length}`);
assert(sandbox.BIKE_COUNT === 3, 'BIKE_COUNT constant equals 3');

// Test 3: Exact Total Deposit Sum = 7101
const depositSum = FLEET_DATA.reduce((acc, v) => acc + v.deposit, 0);
assert(depositSum === 7101, 'Sum of all deposits is exactly ₹7,101', `Got ${depositSum}`);
assert(sandbox.TOTAL_DEPOSIT_VALUE === 7101, 'TOTAL_DEPOSIT_VALUE constant is 7101');

// Test 4: Jupiter ₹1 Promo Deposit
const jupiter = FLEET_DATA.find(v => v.name.includes('Jupiter'));
assert(jupiter && jupiter.deposit === 1, 'Jupiter J-2 has exact ₹1 deposit');

// Test 5: NS Pulsar ₹1000 Deposit
const pulsar = FLEET_DATA.find(v => v.name.includes('Pulsar'));
assert(pulsar && pulsar.deposit === 1000, 'NS Pulsar has exact ₹1000 deposit');

// Test 6: Verify exact tariffs for all 10 vehicles
const expectedTariffs = {
  "Activa 3G": { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100, deposit: 500, overtime: "50/Hr" },
  "Jupiter/J-2": { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100, deposit: 1, overtime: "50/Hr" },
  "Maestro Edge": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "Maestro": { "3Hr": 150, "6Hr": 280, "12Hr": 440, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "Avaitor": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "Activa 4G": { "3Hr": 150, "6Hr": 270, "12Hr": 420, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "TVS Wego": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 3450, deposit: 800, overtime: "60/Hr" },
  "Glamour": { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "Discover": { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450, deposit: 800, overtime: "60/Hr" },
  "Ns Pulsar": { "3Hr": 200, "6Hr": 360, "12Hr": 550, "24Hr": 860, "7Days": 3450, deposit: 1000, overtime: "70/Hr" },
};

Object.entries(expectedTariffs).forEach(([name, exp]) => {
  const v = FLEET_DATA.find(x => x.name === name);
  assert(v !== undefined, `Vehicle "${name}" exists in fleet dataset`);
  assert(v.deposit === exp.deposit, `${name} deposit equals ${exp.deposit}`);
  assert(v.overtime === exp.overtime, `${name} overtime equals ${exp.overtime}`);
  assert(v.pricing["3Hr"] === exp["3Hr"], `${name} 3Hr tariff equals ${exp["3Hr"]}`);
  assert(v.pricing["6Hr"] === exp["6Hr"], `${name} 6Hr tariff equals ${exp["6Hr"]}`);
  assert(v.pricing["12Hr"] === exp["12Hr"], `${name} 12Hr tariff equals ${exp["12Hr"]}`);
  assert(v.pricing["24Hr"] === exp["24Hr"], `${name} 24Hr tariff equals ${exp["24Hr"]}`);
  assert(v.pricing["7Days"] === exp["7Days"], `${name} 7Days tariff equals ${exp["7Days"]}`);
});

// Test 7: Verify all 10 vehicle images exist on disk and are non-empty
const assetsDir = path.join(__dirname, '../assets/vehicles');
const expectedImages = [
  'activa_3g.jpg',
  'jupiter_j2.jpg',
  'maestro_edge.jpg',
  'maestro.jpg',
  'aviator.jpg',
  'activa_4g.jpg',
  'tvs_wego.jpg',
  'glamour.jpg',
  'discover.jpg',
  'ns_pulsar.jpg',
];

expectedImages.forEach((img) => {
  const p = path.join(assetsDir, img);
  assert(fs.existsSync(p), `Image asset exists: assets/vehicles/${img}`);
  const stat = fs.statSync(p);
  assert(stat.size > 50000, `Image asset ${img} has valid file size: ${Math.round(stat.size / 1024)} KB`);
});

// Test 8: Verify all required app screens exist
const requiredScreens = [
  'app/_layout.tsx',
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/explore.tsx',
  'app/(tabs)/rides.tsx',
  'app/(tabs)/profile.tsx',
  'app/vehicle/[id].tsx',
  'app/booking/checkout.tsx',
  'app/booking/success.tsx',
  'app/modal.tsx',
];

requiredScreens.forEach((scr) => {
  const p = path.join(__dirname, '..', scr);
  assert(fs.existsSync(p), `Screen exists: ${scr}`);
});

// Test 9: Verify Hubs and Coupons
const hubsContent = fs.readFileSync(path.join(__dirname, '../data/hubs.ts'), 'utf-8');
assert(hubsContent.includes('Koramangala 5th Block Hub'), 'Koramangala Hub defined');
assert(hubsContent.includes('Indiranagar 100ft Hub'), 'Indiranagar Hub defined');
assert(hubsContent.includes('HSR Layout Sector 1 Hub'), 'HSR Layout Hub defined');

const couponsContent = fs.readFileSync(path.join(__dirname, '../data/coupons.ts'), 'utf-8');
assert(couponsContent.includes('RAPID100'), 'RAPID100 promo code defined');
assert(couponsContent.includes('RENTELO20'), 'RENTELO20 promo code defined');

console.log(`\n==============================================`);
console.log(`🏆 ALL ${passedTests}/${totalTests} VERIFICATION TESTS PASSED!`);
console.log(`==============================================\n`);
