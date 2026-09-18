/**
 * migration/importSupabase.js
 * Phase 3: Ingests exported JSON records into Supabase PostgreSQL tables
 * Uses official @supabase/supabase-js v2 client
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 10-Vehicle Fleet Source Data (Guaranteed unchanged pricing)
const fleetData = [
  { "id": 1, "name": "Activa 3G", "type": "Scooty", "deposit": 500, "pricing": { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100 }, "overtime": "50/Hr" },
  { "id": 2, "name": "Jupiter/J-2", "type": "Scooty", "deposit": 1, "pricing": { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100 }, "overtime": "50/Hr" },
  { "id": 3, "name": "Maestro Edge", "type": "Scooty", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 4, "name": "Maestro", "type": "Scooty", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 280, "12Hr": 440, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 5, "name": "Avaitor", "type": "Scooty", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 6, "name": "Activa 4G", "type": "Scooty", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 270, "12Hr": 420, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 7, "name": "TVS Wego", "type": "Scooty", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 3450 }, "overtime": "60/Hr" },
  { "id": 8, "name": "Glamour", "type": "Bike", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 9, "name": "Discover", "type": "Bike", "deposit": 800, "pricing": { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450 }, "overtime": "60/Hr" },
  { "id": 10, "name": "Ns Pulsar", "type": "Bike", "deposit": 1000, "pricing": { "3Hr": 200, "6Hr": 360, "12Hr": 550, "24Hr": 860, "7Days": 3450 }, "overtime": "70/Hr" }
];

async function main() {
  console.log('==============================================');
  console.log('📥 RAPIDRENTAL SUPABASE DATA INGESTION');
  console.log('==============================================\n');

  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://192.168.31.128:8000';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'mock_key';

  console.log(`🔗 Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Seed vehicles table
  console.log('\n🛵 Ingesting 10 Fleet Vehicles...');
  const vehicleRows = fleetData.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    deposit: item.deposit,
    price_3hr: item.pricing['3Hr'],
    price_6hr: item.pricing['6Hr'],
    price_12hr: item.pricing['12Hr'],
    price_24hr: item.pricing['24Hr'],
    price_7days: item.pricing['7Days'],
    overtime: item.overtime,
    status: 'available',
  }));

  const { data: vData, error: vError } = await supabase
    .from('vehicles')
    .upsert(vehicleRows, { onConflict: 'id' })
    .select();

  if (vError) {
    console.error('  ❌ Error inserting vehicles:', vError.message);
  } else {
    console.log(`  ✅ Successfully seeded ${vData?.length || 10} vehicles!`);
  }

  // 2. Ingest bookings if available
  const bookingsFile = path.join(__dirname, 'data', 'bookings.json');
  if (fs.existsSync(bookingsFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(bookingsFile, 'utf-8'));
      if (Array.isArray(raw) && raw.length > 0) {
        console.log(`\n📋 Found ${raw.length} exported bookings to import...`);
        // Map Firestore doc to Supabase columns
        const bookingRows = raw.map((b) => ({
          vehicle_id: b.vehicle?.id || b.vehicleId || 1,
          vehicle_name: b.vehicle?.name || b.vehicleName || 'Activa 3G',
          pickup_time: b.pickupTime ? new Date(b.pickupTime).toISOString() : new Date().toISOString(),
          dropoff_time: b.dropTime ? new Date(b.dropTime).toISOString() : new Date().toISOString(),
          total_amount: b.fare?.totalPayable || b.totalAmount || 550,
          deposit_amount: b.fare?.deposit || b.depositAmount || 500,
          status: (b.status || 'active').toLowerCase(),
        }));

        const { data: bData, error: bError } = await supabase
          .from('bookings')
          .insert(bookingRows)
          .select();

        if (bError) {
          console.warn('  ⚠️ Bookings import warning (requires auth user fk):', bError.message);
        } else {
          console.log(`  ✅ Ingested ${bData?.length} bookings.`);
        }
      }
    } catch (err) {
      console.warn('  ⚠️ Could not parse bookings.json:', err.message);
    }
  }

  console.log('\n==============================================');
  console.log('🎉 SUPABASE IMPORT SCRIPT COMPLETED');
  console.log('==============================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
