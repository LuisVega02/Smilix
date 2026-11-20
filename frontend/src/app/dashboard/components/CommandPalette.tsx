'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SearchIcon } from './icons';
import type { ModuleAccent, PaletteItem } from './types';
import styles from '../dashboard.module.css';

interface CommandPaletteProps {
  open: boolean;
  items: PaletteItem[];
  onClose: () => void;
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

const DEBOUNCE_MS = 300;

export default function CommandPalette({
  open,
  items,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) return;
    setQuery('');
    setDebouncedQuery('');
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const results = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      `${item.title} ${item.description} ${item.keywords ?? ''}`
        .toLowerCase()
        .includes(term),
    );
  }, [debouncedQuery, items]);

  if (!open) return null;

  const safeIndex =
    results.length === 0 ? -1 : Math.min(activeIndex, results.length - 1);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(results.length ? (safeIndex + 1) % results.length : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(
        results.length
          ? (safeIndex - 1 + results.length) % results.length
          : 0,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[safeIndex] ?? results[0];
      if (target) {
        onClose();
        target.onSelect();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={styles.paletteOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.paletteInputRow}>
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            className={styles.paletteInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar módulo, paciente o acción rápida..."
            aria-label="Buscar módulo, paciente o acción rápida"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-autocomplete="list"
            aria-activedescendant={
              safeIndex >= 0 ? `palette-item-${results[safeIndex].id}` : undefined
            }
          />
          <kbd className={styles.searchKbd}>Esc</kbd>
        </div>

        {results.length === 0 ? (
          <p className={styles.paletteEmpty}>
            No encontramos resultados para “{debouncedQuery}”.
          </p>
        ) : (
          <ul
            className={styles.paletteResults}
            id="command-palette-results"
            role="listbox"
            aria-label="Resultados"
          >
            {results.map((item, index) => (
              <li
                key={item.id}
                id={`palette-item-${item.id}`}
                role="option"
                aria-selected={index === safeIndex}
                className={`${styles.paletteItem} ${
                  index === safeIndex ? styles.paletteItemActive : ''
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onClose();
                  item.onSelect();
                }}
              >
                <span
                  className={`${styles.paletteItemIcon} ${
                    ACCENT_CLASS[item.accent]
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className={styles.paletteItemText}>
                  <span className={styles.paletteItemTitle}>{item.title}</span>
                  <span className={styles.paletteItemDescription}>
                    {item.description}
                  </span>
                </span>
                <span className={styles.paletteItemStatus}>
                  {item.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.paletteHint}>
          <span>
            <kbd className={styles.paletteKey}>↑</kbd>
            <kbd className={styles.paletteKey}>↓</kbd> navegar
          </span>
          <span>
            <kbd className={styles.paletteKey}>Enter</kbd> abrir
          </span>
          <span>
            <kbd className={styles.paletteKey}>Esc</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
