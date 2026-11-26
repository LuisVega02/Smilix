import type { ReactNode } from 'react';

export type ModuleStatus = 'ready' | 'development' | 'admin' | 'pos';

export type ModuleAccent =
  | 'teal'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'green'
  | 'indigo'
  | 'red'
  | 'gray';

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  accent: ModuleAccent;
  ctaLabel: string;
  href?: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

export interface PaletteItem {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  accent: ModuleAccent;
  icon: ReactNode;
  keywords?: string;
  onSelect: () => void;
}

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  ready: 'Listo',
  development: 'Desarrollo',
  admin: 'Admin',
  pos: 'Odoo POS',
};
