'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import apiClient from '@/app/utils/api';
import styles from './page.module.css';

interface MedicalSession {
  id?: number;
  patientId: number;
  date: string;
  doctorResponsible: string;
  consultationReason: string;
  anamnesis?: string;
  medicalHistory?: string;
  diagnosis: string;
  treatmentPlan: string;
}

const createEmptySession = (): MedicalSession => ({
  patientId: 0,
  date: new Date().toISOString().slice(0, 10),
  doctorResponsible: '',
  consultationReason: '',
  anamnesis: '',
  medicalHistory: '',
  diagnosis: '',
  treatmentPlan: '',
});

export default function MedicalSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<MedicalSession[]>([]);
  const [formData, setFormData] = useState<MedicalSession>(createEmptySession());
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    router.prefetch('/dashboard');

    const loadSessions = async () => {
      try {
        const response = await apiClient.get<MedicalSession[]>('/api/medical-sessions');
        setSessions(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No fue posible cargar las sesiones');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSessions();
  }, [router]);

  const orderedSessions = useMemo(
    () =>
      [...sessions].sort((left, right) => {
        const leftTime = Date.parse(left.date);
        const rightTime = Date.parse(right.date);
        return rightTime - leftTime;
      }),
    [sessions],
  );

  const handleFieldChange = (field: keyof MedicalSession, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: field === 'patientId' ? Number(value) : value,
    }));
  };

  const handleSelectSession = (session: MedicalSession) => {
    setSelectedSessionId(session.id ?? null);
    setFormData(session);
    setFeedback('');
    setError('');
  };

  const handleNewSession = () => {
    setSelectedSessionId(null);
    setFormData(createEmptySession());
    setFeedback('');
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');
    setError('');

    if (!formData.patientId || !formData.doctorResponsible || !formData.consultationReason || !formData.diagnosis || !formData.treatmentPlan) {
      setError('Paciente, doctor, motivo, diagnóstico y plan son requeridos');
      setIsSaving(false);
      return;
    }

    try {
      if (selectedSessionId) {
        const updated = await apiClient.patch<MedicalSession>(
          `/api/medical-sessions/${selectedSessionId}`,
          formData,
        );

        setSessions((current) => current.map((session) => (session.id === selectedSessionId ? updated : session)));
        setFeedback('Sesion médica actualizada correctamente.');
      } else {
        const created = await apiClient.post<MedicalSession>('/api/medical-sessions', formData);
        setSessions((current) => [created, ...current]);
        setSelectedSessionId(created.id ?? null);
        setFeedback('Sesion médica creada correctamente.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la sesión');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    setError('');
    setFeedback('');

    try {
      await apiClient.delete(`/api/medical-sessions/${id}`);
      setSessions((current) => current.filter((session) => session.id !== id));
      if (selectedSessionId === id) {
        handleNewSession();
      }
      setFeedback('Sesion médica eliminada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la sesión');
    }
  };

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <div className={styles.hero}>
          <div className={`${styles.heroPanel} glass-panel`}>
            <div className={styles.heroHeader}>
              <div>
                <span className={styles.eyebrow}>Sesiones medicas</span>
                <h1 className="page-title">Modulo de sesiones medicas</h1>
                <p className={`page-subtitle ${styles.heroCopy}`}>
                  Registra y administra seguimientos clinicos independientes de la historia.
                </p>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => startTransition(() => router.push('/dashboard'))}
              >
                Volver al dashboard
              </button>
              <button className={styles.secondaryButton} type="button" onClick={handleNewSession}>
                Nueva sesion
              </button>
            </div>
          </div>
        </div>

        <div className={styles.gridTwo} style={{ gap: '1.5rem', marginTop: '1.5rem' }}>
          <section className={styles.sectionCard} style={{ flex: 1 }}>
            <div className={styles.sectionAccordionHeader}>
              <div>
                <h3>Formulario de sesion</h3>
                <p className={styles.sectionHint}>
                  Crea o edita una sesion medica. Todos los campos de anamnesis y antecedentes son textos libres.
                </p>
              </div>
            </div>

            <div className={styles.gridSingle}>
              <div>
                <label htmlFor="patientId">ID de paciente</label>
                <input
                  id="patientId"
                  type="number"
                  value={formData.patientId || ''}
                  onChange={(event) => handleFieldChange('patientId', event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="date">Fecha</label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(event) => handleFieldChange('date', event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="doctorResponsible">Doctor responsable</label>
                <input
                  id="doctorResponsible"
                  value={formData.doctorResponsible}
                  onChange={(event) => handleFieldChange('doctorResponsible', event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="consultationReason">Motivo de consulta</label>
                <input
                  id="consultationReason"
                  value={formData.consultationReason}
                  onChange={(event) => handleFieldChange('consultationReason', event.target.value)}
                />
              </div>
              <div className={styles.fullWidth}>
                <label htmlFor="anamnesis">Anamnesis</label>
                <textarea
                  id="anamnesis"
                  value={formData.anamnesis || ''}
                  onChange={(event) => handleFieldChange('anamnesis', event.target.value)}
                />
              </div>
              <div className={styles.fullWidth}>
                <label htmlFor="medicalHistory">Antecedentes</label>
                <textarea
                  id="medicalHistory"
                  value={formData.medicalHistory || ''}
                  onChange={(event) => handleFieldChange('medicalHistory', event.target.value)}
                />
              </div>
              <div className={styles.fullWidth}>
                <label htmlFor="diagnosis">Diagnostico</label>
                <textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(event) => handleFieldChange('diagnosis', event.target.value)}
                />
              </div>
              <div className={styles.fullWidth}>
                <label htmlFor="treatmentPlan">Plan de tratamiento</label>
                <textarea
                  id="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={(event) => handleFieldChange('treatmentPlan', event.target.value)}
                />
              </div>
            </div>

            {error ? (
              <p style={{ color: '#b91c1c', marginTop: '1rem' }}>{error}</p>
            ) : null}
            {feedback ? (
              <p style={{ color: '#166534', marginTop: '1rem' }}>{feedback}</p>
            ) : null}

            <div className={styles.sectionAccordionActions}>
              <button className={styles.primaryButton} type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Guardando...' : selectedSessionId ? 'Actualizar sesion' : 'Crear sesion'}
              </button>
            </div>
          </section>

          <section className={styles.sectionCard} style={{ flex: 1 }}>
            <div className={styles.sectionAccordionHeader}>
              <div>
                <h3>Sesiones registradas</h3>
                <p className={styles.sectionHint}>
                  Selecciona una sesion para editarla o eliminarla.
                </p>
              </div>
            </div>

            {isLoading ? (
              <p>Cargando sesiones...</p>
            ) : sessions.length === 0 ? (
              <p className={styles.emptyStateInline}>No hay sesiones medicas registradas.</p>
            ) : (
              <div className={styles.sessionList}>
                {orderedSessions.map((session) => (
                  <article key={session.id} className={styles.sessionCard}>
                    <div className={styles.sessionCardHeader}>
                      <div className={styles.sessionCardTitle}>
                        <strong>Sesion</strong>
                        <span className={styles.sessionBadge}>{session.date}</span>
                      </div>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleDelete(session.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className={styles.gridSingle}>
                      <p>
                        <strong>Paciente ID:</strong> {session.patientId}
                      </p>
                      <p>
                        <strong>Doctor:</strong> {session.doctorResponsible}
                      </p>
                      <p>
                        <strong>Motivo:</strong> {session.consultationReason}
                      </p>
                      <p>
                        <strong>Diagnostico:</strong> {session.diagnosis}
                      </p>
                    </div>
                    <div className={styles.sectionAccordionActions}>
                      <button className={styles.primaryButton} type="button" onClick={() => handleSelectSession(session)}>
                        Editar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
