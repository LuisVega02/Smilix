'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import DevelopmentModal from '@/app/components/DevelopmentModal';
import styles from './dashboard.module.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AppModuleCard {
  title: string;
  description: string;
  tag: string;
  implemented: boolean;
  href?: string;
  accent: 'primary' | 'sand' | 'ink';
}

const modules: AppModuleCard[] = [
  {
    title: 'Historia clinica',
    description:
      'Gestiona anamnesis, antecedentes y adjuntos del paciente desde una sola vista.',
    tag: 'Implementado',
    implemented: true,
    href: '/dashboard/historia-clinica',
    accent: 'primary',
  },
  {
    title: 'Admision y registro',
    description: 'Alta de pacientes, busqueda rapida y gestion de datos personales.',
    tag: 'En desarrollo',
    implemented: false,
    accent: 'sand',
  },
  {
    title: 'Odontograma',
    description: 'Seguimiento visual por pieza dental y procedimientos realizados.',
    tag: 'En desarrollo',
    implemented: false,
    accent: 'ink',
  },
  {
    title: 'Plan de tratamiento',
    description: 'Presupuestos, aprobaciones y trazabilidad del tratamiento integral.',
    tag: 'En desarrollo',
    implemented: false,
    accent: 'sand',
  },
  {
    title: 'Sesion medica',
    description: 'Registro clinico del dia con doctor, diagnostico y prescripciones.',
    tag: 'Implementado',
    implemented: true,
    href: '/dashboard/sesiones-medicas',
    accent: 'ink',
  },
  {
    title: 'Mensajes WhatsApp',
    description: 'Recordatorios, confirmaciones y automatizaciones para el paciente.',
    tag: 'En desarrollo',
    implemented: false,
    accent: 'sand',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationLabel, setNavigationLabel] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [developmentModule, setDevelopmentModule] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    router.prefetch('/dashboard/historia-clinica');

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    setIsLoading(false);
  }, [router]);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Modulo activo',
        value: 'Historia clinica',
        detail: 'Listo para captura y seguimiento',
      },
      {
        label: 'Rol actual',
        value: user?.role === 'admin' ? 'Administrador' : 'Doctor',
        detail: user?.email || 'usuario@clinica.com',
      },
      {
        label: 'Cobertura visible',
        value: '6 modulos',
        detail: '1 operativo y 5 en roadmap',
      },
    ],
    [user],
  );

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setNavigationLabel('Cerrando sesion...');
    setIsNavigating(true);
    startTransition(() => {
      router.replace('/login');
    });
  };

  const navigateWithFeedback = (href: string, label: string) => {
    setNavigationLabel(label);
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  const handleModuleClick = (moduleCard: AppModuleCard) => {
    if (moduleCard.implemented && moduleCard.href) {
      navigateWithFeedback(moduleCard.href, `Abriendo ${moduleCard.title}...`);
      return;
    }

    setDevelopmentModule(moduleCard.title);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Cargando panel principal...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <div className={styles.hero}>
          <div className={`${styles.heroPanel} glass-panel`}>
            <div className={styles.heroHeader}>
              <div>
                <span className={styles.eyebrow}>Panel principal</span>
                <h1 className="page-title">Gestion dental clara, rapida y centrada en la consulta.</h1>
                <p className={`page-subtitle ${styles.heroCopy}`}>
                  Accede a los modulos del sistema desde un menu mas ordenado. Los
                  apartados pendientes permanecen visibles para conservar el mapa de
                  navegacion, pero indican claramente su estado.
                </p>
              </div>

              <div className={styles.profileCard}>
                <span className={styles.profileLabel}>Sesion actual</span>
                <strong className={styles.profileName}>{user?.fullName || 'Usuario'}</strong>
                <span className={styles.profileMeta}>{user?.email}</span>
                <span className={styles.profileRole}>
                  {user?.role === 'admin' ? 'Administrador' : 'Doctor'}
                </span>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                onClick={() => navigateWithFeedback('/dashboard/historia-clinica', 'Abriendo historia clinica...')}
                type="button"
                disabled={isNavigating}
              >
                Abrir historia clinica
              </button>
              <button className={styles.secondaryButton} onClick={handleLogout} type="button" disabled={isNavigating}>
                Cerrar sesion
              </button>
            </div>

            <div className={styles.summaryGrid}>
              {summaryCards.map((card) => (
                <article key={card.label} className={styles.summaryCard}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                </article>
              ))}
            </div>
          </div>
        </div>

        <section className={styles.moduleSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Modulos</span>
              <h2 className={styles.sectionTitle}>Navegacion principal del aplicativo</h2>
            </div>
            <p className={styles.sectionCopy}>
              El menu prioriza la accion mas importante y reduce ambiguedad: si un modulo
              no esta listo, el usuario lo sabe antes de intentar usarlo.
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {modules.map((moduleCard) => (
              <button
                key={moduleCard.title}
                className={`${styles.moduleCard} ${styles[moduleCard.accent]}`}
                onClick={() => handleModuleClick(moduleCard)}
                type="button"
                disabled={isNavigating}
              >
                <div className={styles.moduleHeader}>
                  <span className={styles.moduleTag}>{moduleCard.tag}</span>
                </div>
                <h3>{moduleCard.title}</h3>
                <p>{moduleCard.description}</p>
                <span className={styles.moduleAction}>
                  {moduleCard.implemented ? 'Ingresar al modulo' : 'Ver estado'}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <DevelopmentModal
        isOpen={Boolean(developmentModule)}
        moduleName={developmentModule || ''}
        onClose={() => setDevelopmentModule(null)}
      />

      {isNavigating ? (
        <div className={styles.routeOverlay}>
          <div className={styles.routeOverlayCard}>
            <span className={styles.routeSpinner} />
            <strong>{navigationLabel || 'Abriendo modulo...'}</strong>
          </div>
        </div>
      ) : null}
    </ProtectedRoute>
  );
}
