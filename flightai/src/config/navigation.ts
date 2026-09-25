import { Home, Plane, Crosshair, BarChart2, Bell, Settings, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const APP_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Live Tracking', icon: Crosshair, href: '/live-tracking' },
  { label: 'Fleet Management', icon: LayoutGrid, href: '/fleet' },
  { label: 'Aircraft', icon: Plane, href: '/aircraft' }, 
  { label: 'Analytics', icon: BarChart2, href: '/analytics' },
  { label: 'Alerts', icon: Bell, href: '/alerts' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export const WORKSPACE_NAVIGATION: NavItem[] = [
  { label: 'My Fleet', icon: Plane, href: '/fleet?view=my-fleet' },
  { label: 'Saved Views', icon: Crosshair, href: '/dashboard?view=saved' },
];

export const PUBLIC_NAVIGATION = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

export const LEGAL_NAVIGATION = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
