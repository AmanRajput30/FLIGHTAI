"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { BarChart2, Activity, TrendingUp, Plane, Download } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('visualization');
  const { flights, setFlights } = useFlightStore();
  
  // Real KPI Calculations
  const avgAltitude = flights.length > 0 ? Math.round(flights.reduce((acc, f) => acc + (f.altitude || 0), 0) / flights.length) : 0;
  const activeCount = flights.filter(f => f.status === 'active').length;

  // Real Altitude Distribution (Histogram)
  const altitudeBuckets = new Array(16).fill(0); // 16 buckets of 2500ft (up to 40,000ft)
  let maxBucketCount = 0;
  flights.forEach(f => {
     if (f.altitude && f.altitude > 0) {
        const index = Math.min(15, Math.floor(f.altitude / 2500));
        altitudeBuckets[index]++;
        if (altitudeBuckets[index] > maxBucketCount) {
           maxBucketCount = altitudeBuckets[index];
        }
     }
  });

  // Real Top Origin Countries
  const countryCounts = flights.reduce((acc, f) => {
    if (f.originCountry && f.originCountry !== 'Unknown') {
      acc[f.originCountry] = (acc[f.originCountry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalKnownCountries = Object.values(countryCounts).reduce((a, b) => a + b, 0);

  // Real Reports Data
  const reportsData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => {
      const countryFlights = flights.filter(f => f.originCountry === country);
      const active = countryFlights.filter(f => f.status === 'active').length;
      const avgAlt = Math.round(countryFlights.reduce((acc, f) => acc + (f.altitude || 0), 0) / count);
      const avgSpd = Math.round(countryFlights.reduce((acc, f) => acc + (f.speed || 0), 0) / count);
      return { country, count, active, avgAlt, avgSpd };
    });

  const handleDownloadPDF = async () => {
    // Dynamically import to prevent SSR errors and reduce initial bundle size
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF('landscape');
    const timestamp = new Date().toISOString();
    
    // Document Title
    doc.setFontSize(22);
    doc.setTextColor(21, 94, 239); // aervyn-primary
    doc.text("AERVYN Global Telemetry Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${timestamp} | Live Snapshot Data`, 14, 30);
    
    // KPI Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Executive Summary", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Tracked Flights', 'Active Airborne', 'Average Altitude', 'Grounded Flights']],
      body: [[flights.length.toString(), activeCount.toString(), `${avgAltitude} ft`, (flights.length - activeCount).toString()]],
      theme: 'grid',
      headStyles: { fillColor: [21, 94, 239] }
    });

    // Top Countries Summary
    doc.setFontSize(14);
    doc.text("Fleet Operations by Country", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Country of Origin', 'Total Fleet', 'Active Airborne', 'Average Altitude', 'Average Speed']],
      body: reportsData.map(r => [r.country, r.count, r.active, `${r.avgAlt} ft`, `${r.avgSpd} kts`]),
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] }
    });

    // Deep Telemetry Raw Data Table
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Deep Telemetry Raw Data (ADS-B Stream)", 14, 20);
    
    const tableData = flights.map(f => [
      f.callsign || 'UNK',
      f.originCountry || 'Unknown',
      f.altitude ? `${f.altitude} ft` : 'Ground',
      f.speed ? `${f.speed} kts` : '0 kts',
      f.squawk || '----',
      f.geoAltitude ? `${f.geoAltitude} ft` : 'N/A',
      f.onGround ? 'TRUE' : 'FALSE',
      f.positionSource === 0 ? 'ADS-B' : f.positionSource === 1 ? 'ASTERIX' : f.positionSource === 2 ? 'MLAT' : 'Unknown'
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Callsign', 'Country', 'Baro Altitude', 'Speed', 'Squawk', 'Geo Altitude', 'On Ground', 'Sensor']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 94, 239] },
      margin: { bottom: 20 }
    });

    doc.save(`AERVYN_Telemetry_Report_${timestamp.split('T')[0]}.pdf`);
  };

  // Poll live data if not fetched yet, same as FleetPage
  React.useEffect(() => {
    if (flights.length > 0) return;
    const fetchLiveFlights = async () => {
      try {
        const res = await fetch('/api/flights');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.states) {
          const newFlights = data.states
            .filter((p: any) => p[5] != null && p[6] != null)
            .map((p: any) => ({
              id: p[0],
              icao24: p[0],
              callsign: p[1]?.trim() || p[0],
              originCountry: p[2],
              lat: p[6],
              lng: p[5],
              heading: p[10] || 0,
              speed: p[9] ? Math.round(p[9] * 1.94384) : 0, 
              altitude: p[7] ? Math.round(p[7] * 3.28084) : 0, 
              verticalRate: p[11] ? Math.round(p[11] * 196.85) : 0,
              squawk: p[14],
              onGround: p[8],
              category: 'Commercial',
              status: p[8] ? 'grounded' : 'active'
            }));
          setFlights(newFlights);
        }
      } catch (err) {}
    };
    fetchLiveFlights();
  }, [flights.length, setFlights]);

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative flex">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-[72px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={M_PRESETS.panel}
            className="max-w-7xl mx-auto"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
                <p className="text-sm text-aervyn-text-dark-secondary">Global insights and fleet performance metrics.</p>
              </div>
              <div className="flex items-center gap-3">
                    <div className="bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-lg p-1 flex">
                  <button 
                    onClick={() => setActiveTab('visualization')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'visualization' ? 'bg-aervyn-surface-dark-active text-white shadow-sm' : 'text-aervyn-text-dark-secondary hover:text-white'}`}
                  >
                    Data Visualization
                  </button>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-aervyn-surface-dark-active text-white shadow-sm' : 'text-aervyn-text-dark-secondary hover:text-white'}`}
                  >
                    Reports
                  </button>
                </div>
                <button onClick={handleDownloadPDF} className="bg-aervyn-primary hover:bg-aervyn-primary-light text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center shadow-lg hover:shadow-aervyn-primary/20">
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-aervyn-text-dark-secondary">Tracked Flights</span>
                  <div className="p-2 bg-aervyn-primary/10 rounded-lg text-aervyn-primary">
                    <Plane size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{flights.length}</span>
                  <span className="text-xs font-medium text-aervyn-status-success flex items-center">
                    <TrendingUp size={12} className="mr-1" /> Live
                  </span>
                </div>
              </div>

              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-aervyn-text-dark-secondary">Active Aircraft</span>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{activeCount}</span>
                  <span className="text-xs font-medium text-aervyn-status-success flex items-center">
                    <TrendingUp size={12} className="mr-1" /> Live
                  </span>
                </div>
              </div>

              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-aervyn-text-dark-secondary">Average Altitude</span>
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <BarChart2 size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{avgAltitude}<span className="text-base text-aervyn-text-dark-muted ml-1">ft</span></span>
                  <span className="text-xs font-medium text-aervyn-text-dark-muted flex items-center">
                    Fleet Average
                  </span>
                </div>
              </div>

              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-aervyn-text-dark-secondary">Total Grounded</span>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{flights.length - activeCount}</span>
                  <span className="text-xs font-medium text-aervyn-text-dark-muted flex items-center">
                    Currently Grounded
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {activeTab === 'visualization' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6 flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Live Altitude Distribution</h3>
                    <div className="flex items-center gap-2 text-sm text-aervyn-text-dark-secondary">
                      <Activity size={14} />
                      <span>0ft - 40,000ft (2.5k buckets)</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg flex flex-col p-4 px-6 gap-2 relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-6 px-6 pointer-events-none z-0">
                      <div className="w-full border-t border-aervyn-border-dark/30"></div>
                      <div className="w-full border-t border-aervyn-border-dark/30"></div>
                      <div className="w-full border-t border-aervyn-border-dark/30"></div>
                      <div className="w-full border-t border-aervyn-border-dark/30"></div>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 relative z-10 w-full pt-10">
                      {altitudeBuckets.map((count, i) => {
                        const heightPercent = maxBucketCount > 0 ? Math.max(2, (count / maxBucketCount) * 100) : 2;
                        const minAlt = (i * 2.5).toFixed(1).replace('.0', '');
                        const maxAlt = ((i + 1) * 2.5).toFixed(1).replace('.0', '');
                        return (
                          <div key={i} className="flex-1 bg-aervyn-primary/30 hover:bg-aervyn-primary/70 rounded-t-sm transition-all duration-300 relative group" style={{ height: `${heightPercent}%` }}>
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-aervyn-surface-dark-elevated border border-aervyn-border-dark text-white text-[10px] whitespace-nowrap font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20 flex flex-col items-center">
                              <span className="text-aervyn-text-dark-secondary font-medium mb-0.5">{minAlt}k - {maxAlt}k ft</span>
                              <span>{count} aircraft</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* X Axis Labels */}
                    <div className="flex justify-between w-full text-[9px] uppercase tracking-wider text-aervyn-text-dark-muted font-bold mt-2 pt-3 border-t border-aervyn-border-dark">
                      <span>Gnd</span>
                      <span>10k ft</span>
                      <span>20k ft</span>
                      <span>30k ft</span>
                      <span>40k+ ft</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Chart */}
                <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6 flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Top Origin Countries</h3>
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col justify-center gap-6">
                    {topCountries.length === 0 && <span className="text-aervyn-text-dark-muted text-sm">Gathering country data...</span>}
                    
                    {topCountries.map((country, index) => {
                      const percentage = totalKnownCountries > 0 ? Math.round((country[1] / totalKnownCountries) * 100) : 0;
                      const colorClass = index === 0 ? 'bg-aervyn-primary' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-purple-500' : 'bg-aervyn-status-warning';
                      
                      return (
                        <div key={country[0]} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white truncate pr-4">{country[0]}</span>
                            <span className="text-aervyn-text-dark-secondary">{percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-aervyn-bg-dark rounded-full overflow-hidden">
                            <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Fleet Operations Report</h3>
                  <div className="flex items-center gap-2 text-sm text-aervyn-text-dark-secondary">
                    <Activity size={14} />
                    <span>Grouped by Origin Country</span>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-aervyn-border-dark text-aervyn-text-dark-muted text-xs uppercase tracking-wider">
                        <th className="pb-4 font-bold">Country of Origin</th>
                        <th className="pb-4 font-bold text-right">Total Fleet</th>
                        <th className="pb-4 font-bold text-right">Active Airborne</th>
                        <th className="pb-4 font-bold text-right">Avg Altitude</th>
                        <th className="pb-4 font-bold text-right">Avg Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.map((row) => (
                        <tr key={row.country} className="border-b border-aervyn-border-dark/50 hover:bg-aervyn-surface-dark-active/50 transition-colors">
                          <td className="py-4 font-medium text-white">{row.country}</td>
                          <td className="py-4 text-right text-aervyn-text-dark-secondary">{row.count}</td>
                          <td className="py-4 text-right text-aervyn-status-success font-medium">{row.active}</td>
                          <td className="py-4 text-right text-aervyn-text-dark-secondary">{row.avgAlt.toLocaleString()} ft</td>
                          <td className="py-4 text-right text-aervyn-text-dark-secondary">{row.avgSpd} kts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
}
