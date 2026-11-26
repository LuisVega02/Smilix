'use client';

import type { ReactNode } from 'react';
import { CalendarIcon, ChatIcon, GridIcon, UsersIcon } from './icons';
import styles from '../dashboard.module.css';

interface KpiRowProps {
  appointments: number | null;
  patients: number | null;
}

type KpiTone = 'teal' | 'purple' | 'green' | 'blue';

interface KpiDefinition {
  id: string;
  label: string;
  value: string;
  loading: boolean;
  detail: ReactNode;
  icon: ReactNode;
  tone: KpiTone;
  hint: string;
}

const TONE_CLASS: Record<KpiTone, string> = {
  teal: styles.kpiIconTeal,
  purple: styles.kpiIconPurple,
  green: styles.kpiIconGreen,
  blue: styles.kpiIconBlue,
};

export function SkeletonCard() {
  return (
    <article
      className={styles.kpiCard}
      role="status"
      aria-label="Cargando indicador"
    >
      <div className={styles.kpiTop}>
        <span className={`${styles.skeleton} ${styles.skeletonLabel}`} />
        <span className={`${styles.skeleton} ${styles.skeletonIcon}`} />
      </div>
      <span className={`${styles.skeleton} ${styles.skeletonValue}`} />
      <span className={`${styles.skeleton} ${styles.skeletonDetail}`} />
    </article>
  );
}

export default function KpiRow({ appointments, patients }: KpiRowProps) {
  const items: KpiDefinition[] = [
    {
      id: 'appointments',
      label: 'Citas programadas hoy',
      value: appointments === null ? '' : String(appointments),
      loading: appointments === null,
      detail: (
        <>
          <span className={styles.trendUp}>+12%</span> vs ayer
        </>
      ),
      icon: <CalendarIcon size={19} />,
      tone: 'teal',
      hint: 'Citas registradas para la fecha de hoy',
    },
    {
      id: 'patients',
      label: 'Pacientes atendidos',
      value: patients === null ? '' : String(patients),
      loading: patients === null,
      detail: 'en espera',
      icon: <UsersIcon size={19} />,
      tone: 'blue',
      hint: 'Pacientes con historia clínica registrada',
    },
    {
      id: 'modules',
      label: 'Módulos en el launchpad',
      value: '9',
      loading: false,
      detail: '3 implementados',
      icon: <GridIcon size={19} />,
      tone: 'purple',
      hint: 'Total de módulos disponibles en el lanzador',
    },
    {
      id: 'reminders',
      label: 'Recordatorios WhatsApp',
      value: '94%',
      loading: false,
      detail: 'Confirmación alta',
      icon: <ChatIcon size={19} />,
      tone: 'green',
      hint: 'Tasa de confirmación de recordatorios',
    },
  ];

  return (
    <section className={styles.kpiSection} aria-label="Indicadores del día">
      <div className={styles.kpiGrid}>
        {items.map((item) =>
          item.loading ? (
            <SkeletonCard key={item.id} />
          ) : (
            <article key={item.id} className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{item.label}</span>
                <span
                  className={`${styles.kpiIcon} ${TONE_CLASS[item.tone]}`}
                  title={item.hint}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              </div>
              <strong className={styles.kpiValue}>{item.value}</strong>
              <p className={styles.kpiDetail}>{item.detail}</p>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
