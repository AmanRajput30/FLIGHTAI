const axios = require('axios');
const flightDataService = require('./services/FlightDataService');
const { NormalizedAircraft } = require('./services/FlightDataProvider');

async function runTests() {
  console.log('--- Phase 6.2 Regression Tests ---');
  
  // 1. Test FlightDataService Search
  console.log('\n[1] Testing FlightDataService Local Search Indexing');
  flightDataService.cache.set('bucket:test', [
    new NormalizedAircraft({
      provider: 'TEST',
      providerAircraftId: 'A4B087',
      icao24: 'A4B087',
      callsign: 'UAL123',
      registration: 'N12345',
      aircraftType: 'B738',
      latitude: 40,
      longitude: -70
    })
  ]);
  
  const hexSearch = flightDataService.searchFlight('A4B087');
  console.log('Hex Search (A4B087):', hexSearch ? '✅ PASS' : '❌ FAIL');
  
  const callsignSearch = flightDataService.searchFlight('UAL123');
  console.log('Callsign Search (UAL123):', callsignSearch ? '✅ PASS' : '❌ FAIL');
  
  const regSearch = flightDataService.searchFlight('N12345');
  console.log('Registration Search (N12345):', regSearch ? '✅ PASS' : '❌ FAIL');

  // 2. Test Provider Outage Propagation
  console.log('\n[2] Testing Provider Outage Propagation');
  // Mock ADSB.lol to throw immediately
  const adsbProvider = require('./services/ADSBLOLProvider');
  const originalGet = axios.get;
  
  try {
    adsbProvider.circuitOpen = false;
    adsbProvider.failures = 0;
    adsbProvider.circuitBreakerThreshold = 1; // Trip immediately
    
    axios.get = async () => { throw Object.assign(new Error('Network Error'), { response: { status: 504 }}); };
    
    try {
      await adsbProvider.getAircraftInViewport(0,0,1,1);
      console.log('Provider Error Propagation:', '❌ FAIL (Did not throw)');
    } catch (e) {
      if (e.message === 'Circuit_Tripped' || e.message === 'Network Error') {
         console.log('Provider Error Propagation:', '✅ PASS (Threw expected error:', e.message + ')');
      } else {
         console.log('Provider Error Propagation:', '❌ FAIL (Threw wrong error:', e.message + ')');
      }
    }
  } finally {
    axios.get = originalGet; // Restore
  }

  // 3. Test IPv4 / IPv6 Rate Limit key generator logic
  console.log('\n[3] Testing Rate Limiter Key Generation');
  const { ipKeyGenerator } = require('express-rate-limit');
  const reqIPv4 = { ip: '192.168.1.1' };
  const reqIPv6 = { ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' };
  
  try {
    const key4 = ipKeyGenerator(reqIPv4.ip);
    console.log('IPv4 Key Generation:', key4 === '192.168.1.1' ? '✅ PASS' : '❌ FAIL');
    
    const key6 = ipKeyGenerator(reqIPv6.ip);
    console.log('IPv6 Key Generation:', typeof key6 === 'string' ? '✅ PASS (' + key6 + ')' : '❌ FAIL');
  } catch (err) {
    console.log('Rate Limit Test:', '❌ FAIL', err.message);
  }

  console.log('\n--- Tests Complete ---');
  process.exit(0);
}

runTests();
