'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from './icons';
import styles from '../dashboard.module.css';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const TOAST_TIMEOUT = 4200;
const MAX_TOASTS = 4;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback((message: string, tone: ToastTone = 'info') => {
    nextId.current += 1;
    const id = nextId.current;

    setToasts((current) => [
      ...current.slice(-(MAX_TOASTS - 1)),
      { id, message, tone },
    ]);

    const timer = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, TOAST_TIMEOUT);

    timers.current.set(id, timer);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const TOAST_ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircleIcon size={18} />,
  error: <AlertCircleIcon size={18} />,
  info: <InfoIcon size={18} />,
};

const TOAST_TONE_CLASS: Record<ToastTone, string> = {
  success: styles.toastSuccess,
  error: styles.toastError,
  info: styles.toastInfo,
};

const TOAST_ICON_TONE_CLASS: Record<ToastTone, string> = {
  success: styles.toastIconSuccess,
  error: styles.toastIconError,
  info: styles.toastIconInfo,
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.toastViewport}
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${TOAST_TONE_CLASS[toast.tone]}`}
        >
          <span
            className={`${styles.toastIcon} ${TOAST_ICON_TONE_CLASS[toast.tone]}`}
          >
            {TOAST_ICONS[toast.tone]}
          </span>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
