"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { AlertCircle, AlertTriangle, ShieldAlert, CloudLightning, Activity, Filter, CheckCircle2, Navigation } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);

  const { flights, setSelectedFlight, setFocusedFlightId, setTargetPos, setAirportData } = useFlightStore();

  // Generate dynamic alerts based on live flight data
  const dynamicAlerts = React.useMemo(() => {
    const generated = [];
    
    // Check for rapid descent
    const rapidDescents = flights.filter(f => (f.verticalRate || 0) < -2500);
    rapidDescents.slice(0, 2).forEach(f => {
      generated.push({ id: `rd-${f.id}`, type: 'maintenance', title: 'Rapid Descent Detected', description: `Aircraft is descending at ${f.verticalRate} fpm.`, time: 'Just now', severity: 'medium', flight: f.callsign || f.icao24 });
    });

    // Check for high altitude
    const highAlts = flights.filter(f => (f.altitude || 0) > 42000);
    highAlts.slice(0, 1).forEach(f => {
      generated.push({ id: `ha-${f.id}`, type: 'airspace', title: 'High Altitude Operation', description: `Aircraft operating above FL420 (${f.altitude} ft).`, time: '2 mins ago', severity: 'low', flight: f.callsign || f.icao24 });
    });

    // Check for grounded with high speed (anomaly)
    const anomalies = flights.filter(f => f.status === 'grounded' && (f.speed || 0) > 100);
    anomalies.slice(0, 1).forEach(f => {
      generated.push({ id: `an-${f.id}`, type: 'security', title: 'Telemetry Anomaly', description: 'Grounded status reported with high ground speed > 100kts.', time: '5 mins ago', severity: 'high', flight: f.callsign || f.icao24 });
    });

    // Fallback default alerts if none generated
    if (generated.length === 0) {
      generated.push(
        { id: '1', type: 'system', title: 'Telemetry Feed Stable', description: 'Primary ADS-B receiver feed operating normally.', time: 'Just now', severity: 'low', flight: 'System' },
        { id: '2', type: 'weather', title: 'Clear Air Turbulence Forecast', description: 'Light turbulence expected in European sector.', time: '14 mins ago', severity: 'medium', flight: 'Global' }
      );
    }
    
    return generated;
  }, [flights]);

  const alerts = dynamicAlerts.filter(a => !readAlertIds.includes(a.id));

  const handleMarkAllRead = () => {
    const currentViewIds = alerts.filter(alert => activeCategory === 'all' || alert.type === activeCategory).map(a => a.id);
    setReadAlertIds(prev => [...prev, ...currentViewIds]);
  };

  const handleAlertClick = (alert: any) => {
    // If it's a real flight alert, fly to it
    const flight = flights.find(f => f.callsign === alert.flight || f.icao24 === alert.flight || f.id === alert.id.replace(/^[a-z]{2}-/, ''));
    if (flight) {
      setSelectedFlight(flight);
      setFocusedFlightId(flight.id);
      setAirportData(null);
      if (flight.lat && flight.lng) {
        setTargetPos([flight.lat, flight.lng]);
      }
      router.push('/dashboard');
    }
  };

  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'security': return <ShieldAlert size={20} className={severity === 'critical' ? 'text-aervyn-status-red' : 'text-aervyn-status-warning'} />;
      case 'weather': return <CloudLightning size={20} className="text-amber-400" />;
      case 'maintenance': return <Activity size={20} className="text-aervyn-status-warning" />;
      case 'airspace': return <Navigation size={20} className="text-aervyn-primary" />;
      case 'system': return <AlertTriangle size={20} className="text-aervyn-status-red" />;
      default: return <AlertCircle size={20} className="text-aervyn-text-dark-secondary" />;
    }
  };

  const getBorderColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-l-4 border-l-aervyn-status-red';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'medium': return 'border-l-4 border-l-aervyn-status-warning';
      default: return 'border-l-4 border-l-aervyn-primary';
    }
  };

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
            className="max-w-6xl mx-auto"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <AlertCircle size={24} className="text-aervyn-status-red" />
                  Alerts & Notifications
                </h1>
                <p className="text-sm text-aervyn-text-dark-secondary">Monitor critical anomalies, weather, and system alerts.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleMarkAllRead} className="bg-aervyn-surface-dark-elevated hover:bg-aervyn-surface-dark-active border border-aervyn-border-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Mark all read
                </button>
                <button className="bg-aervyn-surface-dark-elevated hover:bg-aervyn-surface-dark-active border border-aervyn-border-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Categories */}
              <div className="w-full lg:w-64 shrink-0 space-y-1">
                {['All Alerts', 'Security', 'Weather', 'Airspace', 'Maintenance', 'System'].map((cat) => {
                  const id = cat.toLowerCase().replace(' ', '-');
                  const isActive = activeCategory === (id === 'all-alerts' ? 'all' : id);
                  const count = id === 'all-alerts' ? alerts.length : alerts.filter(a => a.type === id).length;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id === 'all-alerts' ? 'all' : id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                        isActive 
                          ? 'bg-aervyn-primary/10 text-aervyn-primary' 
                          : 'text-aervyn-text-dark-secondary hover:bg-aervyn-surface-dark-elevated hover:text-white'
                      }`}
                    >
                      {cat}
                      {count > 0 && (
                        <span className={`${id === 'all-alerts' || id === 'security' || id === 'system' ? 'bg-aervyn-status-red' : 'bg-aervyn-surface-dark border border-aervyn-border-dark text-aervyn-text-dark-secondary'} text-white text-[10px] px-2 py-0.5 rounded-full`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Alerts List */}
              <div className="flex-1 flex flex-col gap-4">
                {alerts
                  .filter(alert => activeCategory === 'all' || alert.type === activeCategory)
                  .map((alert) => (
                  <div 
                    key={alert.id} 
                    onClick={() => handleAlertClick(alert)}
                    className={`bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-5 hover:bg-aervyn-surface-dark-active transition-colors cursor-pointer flex gap-4 ${getBorderColor(alert.severity)}`}
                  >
                    <div className="pt-1 shrink-0">
                      {getIcon(alert.type, alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-bold text-white">{alert.title}</h3>
                        <span className="text-xs text-aervyn-text-dark-muted font-medium">{alert.time}</span>
                      </div>
                      <p className="text-sm text-aervyn-text-dark-secondary mb-3">{alert.description}</p>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-2 py-1 bg-aervyn-bg-dark rounded text-aervyn-text-primary border border-aervyn-border-dark">
                          {alert.flight}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          alert.severity === 'critical' ? 'text-aervyn-status-red' : 
                          alert.severity === 'high' ? 'text-orange-500' : 
                          alert.severity === 'medium' ? 'text-aervyn-status-warning' : 
                          'text-aervyn-primary'
                        }`}>
                          {alert.severity} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {alerts.filter(alert => activeCategory === 'all' || alert.type === activeCategory).length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-aervyn-border-dark rounded-xl text-aervyn-text-dark-muted">
                    <CheckCircle2 size={32} className="mb-4 opacity-50" />
                    <p>No active alerts in this category.</p>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
