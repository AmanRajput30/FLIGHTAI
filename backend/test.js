const FlightSelectionService = require('./services/FlightSelectionService');
const FlightDataService = require('./services/FlightDataService');
require('dotenv').config();

// Override searchFlight for isolated testing
const originalSearch = FlightDataService.searchFlight.bind(FlightDataService);
FlightDataService.searchFlight = (id) => {
  if (id === 'TESTVALID' || id === 'testvalid') {
    return {
      id: 'a4b087',
      flightNumber: 'BAW123',
      lat: 51.47,
      lng: -0.45,
      alt: 35000,
      speed: 450,
      heading: 90
    };
  }
  return null;
};

async function runTests() {
  console.log('========================================');
  console.log('  FLIGHT SELECTION SERVICE TEST SUITE');
  console.log('========================================\n');

  // TEST 1: Valid flight — all providers resolve
  console.log('--- TEST 1: Valid flight (all providers) ---');
  try {
    const details = await FlightSelectionService.getDetails('testvalid');
    console.log('  Status: ✅ OK');
    console.log('  flight:', details.flight ? '✅' : '❌');
    console.log('  route:', details.route ? `✅ (${details.provenance.route})` : `⚠️ null (${details.provenance.route})`);
    console.log('  weather:', details.weather ? `✅ (${details.provenance.weather})` : `⚠️ null (${details.provenance.weather})`);
    console.log('  aircraft:', details.aircraft ? `✅ (${details.provenance.aircraft})` : `⚠️ null (${details.provenance.aircraft})`);
    console.log('  photo:', details.photo ? `✅ (${details.provenance.photo})` : `⚠️ null (${details.provenance.photo})`);
    console.log('  fetchedAt:', details.fetchedAt);
    console.log();
  } catch (err) {
    console.log('  Status: ❌ FAILED:', err.message);
  }

  // TEST 2: Nonexistent flight — should throw, not 500
  console.log('--- TEST 2: Nonexistent flight ---');
  try {
    await FlightSelectionService.getDetails('ffffff');
    console.log('  Status: ❌ SHOULD HAVE THROWN');
  } catch (err) {
    if (err.message.includes('not found')) {
      console.log('  Status: ✅ Correctly threw "not found"');
    } else {
      console.log('  Status: ❌ Wrong error:', err.message);
    }
  }

  // TEST 3: Empty / null ID — should throw
  console.log('\n--- TEST 3: Empty ID ---');
  try {
    await FlightSelectionService.getDetails('');
    console.log('  Status: ❌ SHOULD HAVE THROWN');
  } catch (err) {
    console.log('  Status: ✅ Correctly threw:', err.message);
  }

  // TEST 4: Repeated identical requests (cache test)
  console.log('\n--- TEST 4: Repeated request (cache hit) ---');
  try {
    const t1 = Date.now();
    const d1 = await FlightSelectionService.getDetails('testvalid');
    const elapsed1 = Date.now() - t1;
    
    const t2 = Date.now();
    const d2 = await FlightSelectionService.getDetails('testvalid');
    const elapsed2 = Date.now() - t2;
    
    console.log(`  First call: ${elapsed1}ms (${d1.provenance.route})`);
    console.log(`  Second call: ${elapsed2}ms (${d2.provenance.route})`);
    if (elapsed2 < elapsed1 || d2.provenance.route.includes('cache')) {
      console.log('  Status: ✅ Cache is working');
    } else {
      console.log('  Status: ⚠️ Cache may not be hitting');
    }
  } catch (err) {
    console.log('  Status: ❌ FAILED:', err.message);
  }

  // TEST 5: Concurrent identical requests 
  console.log('\n--- TEST 5: Concurrent identical requests ---');
  try {
    const [r1, r2, r3] = await Promise.all([
      FlightSelectionService.getDetails('testvalid'),
      FlightSelectionService.getDetails('testvalid'),
      FlightSelectionService.getDetails('testvalid')
    ]);
    console.log('  All 3 resolved: ✅');
    console.log(`  Provenance: ${r1.provenance.route}, ${r2.provenance.route}, ${r3.provenance.route}`);
  } catch (err) {
    console.log('  Status: ❌ FAILED:', err.message);
  }

  // TEST 6: Partial failure verification
  console.log('\n--- TEST 6: Partial failure (photo null, rest OK) ---');
  const details = await FlightSelectionService.getDetails('testvalid');
  const hasPartial = (details.route !== null || details.weather !== null) && details.photo === null;
  console.log(`  route: ${details.route ? '✅' : '❌'}  weather: ${details.weather ? '✅' : '❌'}  photo: ${details.photo ? '⚠️ (unexpected)' : '✅ null (expected for mock hex)'}`);
  console.log(`  Partial response works: ${hasPartial ? '✅' : '⚠️ check manually'}`);

  console.log('\n========================================');
  console.log('  TEST SUITE COMPLETE');
  console.log('========================================');
}

runTests();
