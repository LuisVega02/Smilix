'use client';

import styles from '../dashboard.module.css';

interface ContextBarProps {
  checking: boolean;
  onCheckStatus: () => void;
}

export default function ContextBar({
  checking,
  onCheckStatus,
}: ContextBarProps) {
  return (
    <div className={styles.contextBar}>
      <div className={styles.contextLeft}>
        <span className={styles.led} aria-hidden="true" />
        <span>
          Entorno Cloud Activo:{' '}
          <strong className={styles.contextStrong}>
            Smilix Dental Multi-Sede.
          </strong>
        </span>
        <button
          type="button"
          className={styles.contextLink}
          onClick={onCheckStatus}
          disabled={checking}
        >
          {checking ? 'Comprobando estado...' : 'Comprobar estado del servidor'}
        </button>
      </div>

      <span className={styles.license}>Licencia: Enterprise v4.2</span>
    </div>
  );
}
