"use client";

import React from 'react';
import { CommandPanel } from '../ui/CommandPanel';
import { PanelHeader } from '../ui/PanelHeader';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideLeft } from '@/lib/motion/presets';

export default function AlertsPanel() {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full"
    >
      <CommandPanel className="h-full">
        <PanelHeader 
          title="Global Event Subsystem" 
          subtitle="MONITORING"
          rightElement={
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-aervyn-status-green bg-aervyn-status-green/10">
              <span className="text-[8px] text-aervyn-status-green uppercase font-bold tracking-widest font-labels">SECURE</span>
            </div>
          }
        />
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-aervyn-text-tertiary">
          <ShieldAlert className="w-5 h-5 mb-2 opacity-50" />
          <span className="text-[10px] tracking-widest uppercase font-labels font-bold">No Active Alerts</span>
          <span className="text-[9px] tracking-widest uppercase font-labels mt-1 opacity-70">Awaiting Subsystem Initialization</span>
        </div>
      </CommandPanel>
    </motion.div>
  );
}
