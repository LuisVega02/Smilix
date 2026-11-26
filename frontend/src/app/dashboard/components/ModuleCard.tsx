'use client';

import type { ReactNode } from 'react';
import { ArrowRightIcon } from './icons';
import {
  MODULE_STATUS_LABELS,
  type ModuleAccent,
  type ModuleStatus,
} from './types';
import styles from '../dashboard.module.css';

interface ModuleCardProps {
  title: string;
  description: string;
  status: ModuleStatus;
  accent: ModuleAccent;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  ctaLabel: string;
  adminOnly?: boolean;
}

const ACCENT_CLASS: Record<ModuleAccent, string> = {
  teal: styles.iconTeal,
  orange: styles.iconOrange,
  blue: styles.iconBlue,
  purple: styles.iconPurple,
  green: styles.iconGreen,
  indigo: styles.iconIndigo,
  red: styles.iconRed,
  gray: styles.iconGray,
};

const STATUS_CLASS: Record<ModuleStatus, string> = {
  ready: styles.statusReady,
  development: styles.statusDevelopment,
  admin: styles.statusAdmin,
  pos: styles.statusPos,
};

export default function ModuleCard({
  title,
  description,
  status,
  accent,
  href,
  onClick,
  icon,
  ctaLabel,
  adminOnly = false,
}: ModuleCardProps) {
  const content = (
    <>
      <span className={styles.moduleTop}>
        <span
          className={`${styles.moduleIcon} ${ACCENT_CLASS[accent]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className={`${styles.statusBadge} ${STATUS_CLASS[status]}`}>
          {MODULE_STATUS_LABELS[status]}
        </span>
      </span>
      <span className={styles.moduleTitle}>{title}</span>
      <span className={styles.moduleDescription}>{description}</span>
      <span className={styles.moduleCta}>
        {ctaLabel}
        <ArrowRightIcon size={14} />
      </span>
    </>
  );

  const accessibilityLabel = `${title}. ${ctaLabel}`;
  const dataAttributes = {
    'data-admin-only': adminOnly ? 'true' : undefined,
    'data-status': status,
  };

  if (href) {
    return (
      <a
        className={styles.moduleCard}
        href={href}
        onClick={(event) => {
          if (!onClick) return;
          event.preventDefault();
          onClick();
        }}
        aria-label={accessibilityLabel}
        {...dataAttributes}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={styles.moduleCard}
      type="button"
      onClick={onClick}
      aria-label={accessibilityLabel}
      {...dataAttributes}
    >
      {content}
    </button>
  );
}
