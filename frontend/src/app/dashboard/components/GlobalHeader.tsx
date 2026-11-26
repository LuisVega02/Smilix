'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
} from './icons';
import type { DashboardUser } from './types';
import styles from '../dashboard.module.css';

interface GlobalHeaderProps {
  user: DashboardUser | null;
  notificationCount: number;
  onOpenPalette: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onNotifications: () => void;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDate(date: Date) {
  const weekday = capitalize(
    new Intl.DateTimeFormat('es-PE', { weekday: 'long' }).format(date),
  );
  const day = new Intl.DateTimeFormat('es-PE', { day: 'numeric' }).format(date);
  const month = capitalize(
    new Intl.DateTimeFormat('es-PE', { month: 'short' })
      .format(date)
      .replace('.', ''),
  );
  return `${weekday}, ${day} ${month} ${date.getFullYear()}`;
}

function getInitials(user: DashboardUser | null) {
  const source = user?.fullName?.trim() || user?.email?.trim() || '';
  if (!source) return 'U';

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export default function GlobalHeader({
  user,
  notificationCount,
  onOpenPalette,
  onLogout,
  onSettings,
  onNotifications,
}: GlobalHeaderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const displayName =
    user?.role === 'admin' ? 'Administrador' : user?.fullName || 'Usuario';
  const displayEmail = user?.email || 'usuario@smilix.com';

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            S
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Smilix</span>
            <span className={styles.brandTag}>Dental OS</span>
          </span>
        </div>

        <div className={styles.searchWrap}>
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={onOpenPalette}
            aria-label="Buscar módulo, paciente o acción rápida (Ctrl+K)"
          >
            <SearchIcon size={17} />
            <span className={styles.searchLabel}>
              Buscar módulo, paciente o acción rápida...
            </span>
            <kbd className={styles.searchKbd}>Ctrl+K</kbd>
          </button>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.clock}>
            <time
              className={styles.clockTime}
              dateTime={now ? now.toISOString() : undefined}
            >
              {now ? formatTime(now) : '--:--:--'}
            </time>
            <span className={styles.clockDate}>
              {now ? formatDate(now) : 'Cargando fecha...'}
            </span>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onNotifications}
            aria-label={`Notificaciones: ${notificationCount} sin leer`}
          >
            <BellIcon size={19} />
            {notificationCount > 0 ? (
              <span className={styles.notificationBadge} aria-hidden="true">
                {notificationCount}
              </span>
            ) : null}
          </button>

          <div className={styles.userMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="dashboard-user-menu"
              aria-label={`Menú de usuario de ${displayName}`}
            >
              <span className={styles.avatar} aria-hidden="true">
                {getInitials(user)}
              </span>
              <span className={styles.userMeta}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{displayEmail}</span>
              </span>
              <ChevronDownIcon
                size={16}
                className={`${styles.userChevron} ${
                  isMenuOpen ? styles.userChevronOpen : ''
                }`}
              />
            </button>

            {isMenuOpen ? (
              <div
                className={styles.dropdown}
                id="dashboard-user-menu"
                role="menu"
                aria-label="Acciones de cuenta"
              >
                <button
                  type="button"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSettings();
                  }}
                >
                  <SettingsIcon size={16} />
                  Ajustes de cuenta
                </button>
                <div className={styles.dropdownDivider} role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOutIcon size={16} />
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
