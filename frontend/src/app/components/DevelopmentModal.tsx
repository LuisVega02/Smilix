'use client';

import styles from './DevelopmentModal.module.css';

interface DevelopmentModalProps {
  isOpen: boolean;
  moduleName: string;
  onClose: () => void;
}

export default function DevelopmentModal({
  isOpen,
  moduleName,
  onClose,
}: DevelopmentModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={`${styles.modal} glass-panel`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="development-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.badge}>Modulo no disponible</span>
        <h2 id="development-modal-title" className={styles.title}>
          En desarrollo
        </h2>
        <p className={styles.description}>
          {moduleName} aun no ha sido implementado. La interfaz ya lo contempla en el
          menu principal para mantener la navegacion completa y consistente.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onClose} type="button">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}