'use client';

import styles from '../dashboard.module.css';

interface GlobalFooterProps {
  onSupport: () => void;
  onDocs: () => void;
}

export default function GlobalFooter({ onSupport, onDocs }: GlobalFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.footerStatus}>
          <span className={styles.led} aria-hidden="true" />
          Clínica Principal • Sede Central Miraflores • Doctor de Turno: Dra.
          Sofía Valdivia
        </p>

        <div className={styles.footerLinks}>
          <button type="button" className={styles.footerLink} onClick={onSupport}>
            Soporte Técnico
          </button>
          <button type="button" className={styles.footerLink} onClick={onDocs}>
            Documentación API
          </button>
          <span className={styles.footerVersion}>Smilix v2026.3.1</span>
        </div>
      </div>
    </footer>
  );
}
