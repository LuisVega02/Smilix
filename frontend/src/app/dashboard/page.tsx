'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import DevelopmentModal from '@/app/components/DevelopmentModal';
import apiClient from '@/app/utils/api';
import GlobalHeader from './components/GlobalHeader';
import ContextBar from './components/ContextBar';
import KpiRow from './components/KpiRow';
import ModuleCard from './components/ModuleCard';
import GlobalFooter from './components/GlobalFooter';
import CommandPalette from './components/CommandPalette';
import { ToastViewport, useToasts } from './components/Toast';
import {
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  FileTextIcon,
  LogOutIcon,
  OdontogramIcon,
  PlusIcon,
  PulseIcon,
  ServerIcon,
  SettingsIcon,
  ToothIcon,
  WhatsAppIcon,
} from './components/icons';
import {
  MODULE_STATUS_LABELS,
  type DashboardModule,
  type DashboardUser,
  type PaletteItem,
} from './components/types';
import styles from './dashboard.module.css';

const NOTIFICATION_COUNT = 3;

const MODULES: DashboardModule[] = [
  {
    id: 'historia-clinica',
    title: 'Historia Clínica',
    description: 'Anamnesis, fichas, evolución y antecedentes de pacientes.',
    status: 'ready',
    accent: 'teal',
    ctaLabel: 'Abrir historia',
    href: '/dashboard/historia-clinica',
    icon: <ToothIcon size={22} />,
  },
  {
    id: 'admision',
    title: 'Admisión y Registro',
    description: 'Alta de pacientes, captura biométrica y afiliación.',
    status: 'development',
    accent: 'orange',
    ctaLabel: 'Ver hoja de ruta',
    icon: <ClipboardIcon size={22} />,
  },
  {
    id: 'odontograma',
    title: 'Odontograma 3D',
    description: 'Mapeo gráfico dental interactivo por pieza y cara.',
    status: 'development',
    accent: 'blue',
    ctaLabel: 'Ver estado',
    icon: <OdontogramIcon size={22} />,
  },
  {
    id: 'plan-tratamiento',
    title: 'Plan de Tratamiento',
    description: 'Presupuestos, aprobaciones y etapas de ortodoncia.',
    status: 'development',
    accent: 'purple',
    ctaLabel: 'Ver estado',
    icon: <FileTextIcon size={22} />,
  },
  {
    id: 'sesion-medica',
    title: 'Sesión Médica',
    description: 'Registro clínico activo, recetas y procedimientos diarios.',
    status: 'ready',
    accent: 'green',
    ctaLabel: 'Iniciar consulta',
    href: '/dashboard/sesiones-medicas',
    icon: <PulseIcon size={22} />,
  },
  {
    id: 'calendario',
    title: 'Calendario de Citas',
    description: 'Agenda semanal por sillón dental y especialista.',
    status: 'ready',
    accent: 'indigo',
    ctaLabel: 'Ver agenda',
    href: '/dashboard/calendario',
    icon: <CalendarIcon size={22} />,
  },
  {
    id: 'whatsapp',
    title: 'Mensajes WhatsApp',
    description: 'Confirmaciones automáticas, recordatorios y bots.',
    status: 'development',
    accent: 'green',
    ctaLabel: 'Ver estado',
    icon: <WhatsAppIcon size={22} />,
  },
  {
    id: 'caja',
    title: 'Caja y Facturación',
    description: 'Cobros con POS, comprobantes SUNAT y arqueo.',
    status: 'pos',
    accent: 'red',
    ctaLabel: 'Configurado',
    icon: <CreditCardIcon size={22} />,
    adminOnly: true,
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    description: 'Permisos, sedes, catálogo tarifario y doctores.',
    status: 'admin',
    accent: 'gray',
    ctaLabel: 'Ajustes generales',
    icon: <SettingsIcon size={22} />,
    adminOnly: true,
  },
];

interface KpiState {
  appointments: number | null;
  patients: number | null;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countItems(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;

  if (payload && typeof payload === 'object') {
    const candidate = payload as {
      data?: unknown;
      items?: unknown;
      total?: unknown;
    };
    if (Array.isArray(candidate.data)) return candidate.data.length;
    if (Array.isArray(candidate.items)) return candidate.items.length;
    if (typeof candidate.total === 'number') return candidate.total;
  }

  return 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationLabel, setNavigationLabel] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [developmentModule, setDevelopmentModule] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [kpis, setKpis] = useState<KpiState>({
    appointments: null,
    patients: null,
  });

  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    router.prefetch('/dashboard/historia-clinica');
    router.prefetch('/dashboard/sesiones-medicas');
    router.prefetch('/dashboard/calendario');

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData) as DashboardUser);
      } catch {
        // Datos corruptos en localStorage: limpiamos y seguimos sin crashear.
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (isLoading) return;
    if (!localStorage.getItem('access_token')) return;

    let isCancelled = false;

    const loadKpis = async () => {
      const today = localDateKey(new Date());
      const [appointmentsResult, historiesResult] = await Promise.allSettled([
        apiClient.get<unknown>(`/api/appointments?date=${today}`),
        apiClient.get<unknown>('/api/clinical-histories'),
      ]);

      if (isCancelled) return;

      setKpis({
        appointments:
          appointmentsResult.status === 'fulfilled'
            ? countItems(appointmentsResult.value)
            : 0,
        patients:
          historiesResult.status === 'fulfilled'
            ? countItems(historiesResult.value)
            : 0,
      });
    };

    void loadKpis();

    return () => {
      isCancelled = true;
    };
  }, [isLoading]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setIsPaletteOpen((open) => !open);
        return;
      }

      if (event.key === 'Escape') {
        setIsPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const isAdmin = user?.role === 'admin';

  const visibleModules = useMemo(
    () => MODULES.filter((module) => !module.adminOnly || isAdmin),
    [isAdmin],
  );

  const navigateWithFeedback = useCallback(
    (href: string, label: string) => {
      setNavigationLabel(label);
      setIsNavigating(true);
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setNavigationLabel('Cerrando sesión...');
    setIsNavigating(true);
    startTransition(() => {
      router.replace('/login');
    });
  }, [router]);

  const handleModuleSelect = useCallback(
    (module: DashboardModule) => {
      if (module.href) {
        navigateWithFeedback(module.href, `Abriendo ${module.title}...`);
        return;
      }

      setDevelopmentModule(module.title);
    },
    [navigateWithFeedback],
  );

  const handleQuickAppointment = useCallback(() => {
    pushToast('Abriendo agenda...', 'success');
    navigateWithFeedback('/dashboard/calendario', 'Abriendo agenda...');
  }, [navigateWithFeedback, pushToast]);

  const handleHealthCheck = useCallback(async () => {
    if (isCheckingHealth) return;

    setIsCheckingHealth(true);
    try {
      const result = await apiClient.get<{ status?: string }>('/api/health');
      if (result?.status === 'ok') {
        pushToast('Servidor en línea. Todos los servicios operativos.', 'success');
      } else {
        pushToast('El servidor respondió con un estado inesperado.', 'info');
      }
    } catch {
      pushToast('No se pudo conectar con el servidor. Revisa tu conexión.', 'error');
    } finally {
      setIsCheckingHealth(false);
    }
  }, [isCheckingHealth, pushToast]);

  const handleSettings = useCallback(() => {
    setDevelopmentModule('Ajustes de cuenta');
  }, []);

  const handleNotifications = useCallback(() => {
    pushToast(
      `Tienes ${NOTIFICATION_COUNT} notificaciones sin leer.`,
      'info',
    );
  }, [pushToast]);

  const handleSupport = useCallback(() => {
    pushToast('El centro de soporte estará disponible próximamente.', 'info');
  }, [pushToast]);

  const handleDocs = useCallback(() => {
    pushToast('La documentación de la API estará disponible próximamente.', 'info');
  }, [pushToast]);

  const handleAddModules = useCallback(() => {
    pushToast('App Store próximamente', 'info');
  }, [pushToast]);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const moduleItems: PaletteItem[] = visibleModules.map((module) => ({
      id: `module-${module.id}`,
      title: module.title,
      description: module.description,
      statusLabel: MODULE_STATUS_LABELS[module.status],
      accent: module.accent,
      icon: module.icon,
      keywords: module.ctaLabel,
      onSelect: () => handleModuleSelect(module),
    }));

    return [
      ...moduleItems,
      {
        id: 'action-new-appointment',
        title: 'Nueva Cita Rápida',
        description: 'Abrir la agenda semanal para agendar una cita.',
        statusLabel: 'Acción',
        accent: 'teal',
        icon: <CalendarIcon size={18} />,
        keywords: 'agenda calendario cita crear',
        onSelect: handleQuickAppointment,
      },
      {
        id: 'action-health',
        title: 'Comprobar estado del servidor',
        description: 'Verificar la conexión con la API de Smilix.',
        statusLabel: 'Acción',
        accent: 'green',
        icon: <ServerIcon size={18} />,
        keywords: 'health estado servidor online',
        onSelect: () => {
          void handleHealthCheck();
        },
      },
      {
        id: 'action-logout',
        title: 'Cerrar sesión',
        description: 'Salir de Smilix Dental OS de forma segura.',
        statusLabel: 'Seguridad',
        accent: 'red',
        icon: <LogOutIcon size={18} />,
        keywords: 'logout salir cuenta',
        onSelect: handleLogout,
      },
    ];
  }, [
    visibleModules,
    handleModuleSelect,
    handleQuickAppointment,
    handleHealthCheck,
    handleLogout,
  ]);

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div className={styles.bootScreen} role="status">
          <span className={styles.bootSpinner} aria-hidden="true" />
          <p>Cargando panel principal...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={styles.shell}>
        <GlobalHeader
          user={user}
          notificationCount={NOTIFICATION_COUNT}
          onOpenPalette={() => setIsPaletteOpen(true)}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onNotifications={handleNotifications}
        />

        <ContextBar
          checking={isCheckingHealth}
          onCheckStatus={() => {
            void handleHealthCheck();
          }}
        />

        <main className={styles.main}>
          <KpiRow appointments={kpis.appointments} patients={kpis.patients} />

          <section
            className={styles.launcherSection}
            aria-labelledby="launcher-title"
          >
            <div className={styles.launcherHeading}>
              <div className={styles.launcherIntro}>
                <div className={styles.launcherTitleRow}>
                  <h1 id="launcher-title" className={styles.launcherTitle}>
                    Lanzador de Aplicaciones
                  </h1>
                  <span className={styles.coreBadge}>Smilix Core</span>
                </div>
                <p className={styles.launcherSubtitle}>
                  Accede a las herramientas de gestión clínica y administrativa
                  con un clic.
                </p>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleQuickAppointment}
              >
                <PlusIcon size={16} />
                Nueva Cita Rápida
              </button>
            </div>

            <div className={styles.moduleGrid}>
              {visibleModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  status={module.status}
                  accent={module.accent}
                  href={module.href}
                  icon={module.icon}
                  ctaLabel={module.ctaLabel}
                  adminOnly={module.adminOnly}
                  onClick={() => handleModuleSelect(module)}
                />
              ))}

              <button
                type="button"
                className={styles.addCard}
                onClick={handleAddModules}
              >
                <span className={styles.addIcon} aria-hidden="true">
                  <PlusIcon size={22} />
                </span>
                <span className={styles.addTitle}>Instalar más módulos</span>
                <span className={styles.addSubtitle}>Tienda Smilix AppStore</span>
              </button>
            </div>
          </section>
        </main>

        <GlobalFooter onSupport={handleSupport} onDocs={handleDocs} />

        <CommandPalette
          open={isPaletteOpen}
          items={paletteItems}
          onClose={() => setIsPaletteOpen(false)}
        />

        <ToastViewport toasts={toasts} onDismiss={dismissToast} />

        {isNavigating ? (
          <div className={styles.routeOverlay}>
            <div className={styles.routeOverlayCard}>
              <span className={styles.routeSpinner} aria-hidden="true" />
              <strong>{navigationLabel || 'Abriendo módulo...'}</strong>
            </div>
          </div>
        ) : null}
      </div>

      <DevelopmentModal
        isOpen={Boolean(developmentModule)}
        moduleName={developmentModule || ''}
        onClose={() => setDevelopmentModule(null)}
      />
    </ProtectedRoute>
  );
}
