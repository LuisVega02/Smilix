'use client';

import { ChangeEvent, startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import apiClient from '@/app/utils/api';
import styles from './page.module.css';

interface PatientProfile {
  firstName: string;
  lastName: string;
  nickname?: string;
  documentId: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  address?: string;
  phones: string[];
  email?: string;
  occupation?: string;
  leadSource?: string;
  photoUrl?: string;
}

interface GuardianProfile {
  fullName: string;
  relationship?: string;
  documentId?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

interface MedicalSession {
  date: string;
  doctorResponsible: string;
  consultationReason: string;
  diagnosis: string;
  treatmentPlan: string;
}

interface ClinicalHistory {
  id?: number;
  patient: PatientProfile;
  guardian?: GuardianProfile | null;
  anamnesis: string;
  medicalBackground: string;
  prenatalBackground: string;
  postnatalBackground: string;
  oralHabits: string;
  dentalDevelopment: string;
  attachments: string[];
  radiographs: string[];
  patientPhotos: string[];
  sessions: MedicalSession[];
  status?: 'draft' | 'active' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

const createEmptyHistory = (): ClinicalHistory => ({
  patient: {
    firstName: '',
    lastName: '',
    nickname: '',
    documentId: '',
    birthDate: '',
    age: undefined,
    gender: '',
    address: '',
    phones: [],
    email: '',
    occupation: '',
    leadSource: '',
    photoUrl: '',
  },
  guardian: {
    fullName: '',
    relationship: '',
    documentId: '',
    phone: '',
    email: '',
    photoUrl: '',
  },
  anamnesis: '',
  medicalBackground: '',
  prenatalBackground: '',
  postnatalBackground: '',
  oralHabits: '',
  dentalDevelopment: '',
  attachments: [],
  radiographs: [],
  patientPhotos: [],
  sessions: [],
  status: 'draft',
});

const createEmptySession = (): MedicalSession => ({
  date: new Date().toISOString().slice(0, 10),
  doctorResponsible: '',
  consultationReason: '',
  diagnosis: '',
  treatmentPlan: '',
});

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const formatList = (items: string[]) => items.join(', ');

const getSessionTimestamp = (date: string) => {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

export default function ClinicalHistoryPage() {
  const router = useRouter();
  const [histories, setHistories] = useState<ClinicalHistory[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ClinicalHistory>(createEmptyHistory());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');

    const loadHistories = async () => {
      try {
        const response = await apiClient.get<ClinicalHistory[]>('/api/clinical-histories');
        setHistories(response);

        if (response.length > 0) {
          setSelectedHistoryId(response[0].id || null);
          setFormData(response[0]);
          setIsSessionsOpen(response[0].sessions.length > 0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No fue posible cargar historias clinicas';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistories();
  }, []);

  const selectedHistory = useMemo(
    () => histories.find((history) => history.id === selectedHistoryId) || null,
    [histories, selectedHistoryId],
  );

  const orderedSessions = useMemo(
    () =>
      formData.sessions
        .map((session, index) => ({ session, index }))
        .sort((left, right) => {
          const difference = getSessionTimestamp(right.session.date) - getSessionTimestamp(left.session.date);

          if (difference !== 0) {
            return difference;
          }

          return right.index - left.index;
        }),
    [formData.sessions],
  );

  const updatePatientField = (field: keyof PatientProfile, value: string | number | string[]) => {
    setFormData((current) => ({
      ...current,
      patient: {
        ...current.patient,
        [field]: value,
      },
    }));
  };

  const updateGuardianField = (field: keyof GuardianProfile, value: string) => {
    setFormData((current) => ({
      ...current,
      guardian: {
        fullName: current.guardian?.fullName || '',
        relationship: current.guardian?.relationship || '',
        documentId: current.guardian?.documentId || '',
        phone: current.guardian?.phone || '',
        email: current.guardian?.email || '',
        photoUrl: current.guardian?.photoUrl || '',
        [field]: value,
      },
    }));
  };

  const updateSessionField = (
    index: number,
    field: keyof MedicalSession,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      sessions: current.sessions.map((session, sessionIndex) =>
        sessionIndex === index
          ? {
              ...session,
              [field]: value,
            }
          : session,
      ),
    }));
  };

  const addSession = () => {
    setFormData((current) => ({
      ...current,
      sessions: [...current.sessions, createEmptySession()],
    }));
    setIsSessionsOpen(true);
  };

  const removeSession = (index: number) => {
    setFormData((current) => ({
      ...current,
      sessions: current.sessions.filter((_, sessionIndex) => sessionIndex !== index),
    }));
  };

  const handleHistorySelect = (history: ClinicalHistory) => {
    setSelectedHistoryId(history.id || null);
    setFormData(history);
    setIsSessionsOpen(history.sessions.length > 0);
    setFeedback('');
    setError('');
  };

  const handleCreateNew = () => {
    setSelectedHistoryId(null);
    setFormData(createEmptyHistory());
    setIsSessionsOpen(false);
    setFeedback('');
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');
    setError('');

    try {
      if (selectedHistoryId) {
        const updatedHistory = await apiClient.patch<ClinicalHistory>(
          `/api/clinical-histories/${selectedHistoryId}`,
          formData,
        );
        setHistories((current) =>
          current.map((history) => (history.id === selectedHistoryId ? updatedHistory : history)),
        );
        setFormData(updatedHistory);
        setFeedback('Historia clinica actualizada correctamente.');
      } else {
        const createdHistory = await apiClient.post<ClinicalHistory>(
          '/api/clinical-histories',
          formData,
        );
        setHistories((current) => [createdHistory, ...current]);
        setSelectedHistoryId(createdHistory.id || null);
        setFormData(createdHistory);
        setFeedback('Historia clinica creada correctamente.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible guardar la historia clinica';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextArea = (
    event: ChangeEvent<HTMLTextAreaElement>,
    field:
      | 'anamnesis'
      | 'medicalBackground'
      | 'prenatalBackground'
      | 'postnatalBackground'
      | 'oralHabits'
      | 'dentalDevelopment',
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleFileSelection = (
    event: ChangeEvent<HTMLInputElement>,
    field: 'attachments' | 'radiographs' | 'patientPhotos',
  ) => {
    const files = Array.from(event.target.files || []).map((file) => file.name);

    if (!files.length) {
      return;
    }

    setFormData((current) => ({
      ...current,
      [field]: Array.from(new Set([...(current[field] || []), ...files])),
    }));
  };

  const handlePatientPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingPhoto(true);
    setError('');
    setFeedback('');

    try {
      const uploadPayload = new FormData();
      uploadPayload.append('file', file);

      const response = await apiClient.postFormData<{ relativePath: string }>(
        '/api/clinical-histories/upload/patient-photo',
        uploadPayload,
      );

      updatePatientField('photoUrl', response.relativePath);
      setFeedback('Foto del paciente cargada en el servidor local.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible subir la foto del paciente';
      setError(message);
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className={styles.loadingScreen}>Cargando historia clinica...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <header className={`${styles.header} glass-panel`}>
          <div>
            <button
              className={styles.backLink}
              onClick={() => {
                setIsNavigating(true);
                startTransition(() => {
                  router.push('/dashboard');
                });
              }}
              type="button"
            >
              Volver al menu principal
            </button>
            <span className={styles.eyebrow}>SMILIX 2.0</span>
            <h1 className="page-title">Historia clinica</h1>
            <p className={`page-subtitle ${styles.headerCopy}`}>
              Captura los campos base del requerimiento: anamnesis, antecedentes,
              habitos, desarrollo dental y adjuntos del paciente. Las sesiones medicas
              se agregan solo si el caso las requiere.
            </p>
          </div>

          <div className={styles.headerStats}>
            <div>
              <span>Historias cargadas</span>
              <strong>{histories.length}</strong>
            </div>
            <div>
              <span>Estado actual</span>
              <strong>
                {formData.status === 'active'
                  ? 'Activa'
                  : formData.status === 'closed'
                    ? 'Cerrada'
                    : 'Borrador'}
              </strong>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={`${styles.sidebar} glass-panel`}>
            <div className={styles.sidebarTop}>
              <div>
                <span className={styles.sidebarLabel}>Pacientes</span>
                <h2>Listado rapido</h2>
              </div>
              <button className={styles.createButton} onClick={handleCreateNew} type="button">
                Nueva historia
              </button>
            </div>

            <div className={styles.historyList}>
              {histories.map((history) => (
                <button
                  key={history.id}
                  className={`${styles.historyCard} ${history.id === selectedHistoryId ? styles.historyCardActive : ''}`}
                  onClick={() => handleHistorySelect(history)}
                  type="button"
                >
                  <span>{history.status === 'active' ? 'Activa' : history.status === 'closed' ? 'Cerrada' : 'Borrador'}</span>
                  <strong>
                    {history.patient.firstName} {history.patient.lastName}
                  </strong>
                  <small>
                    {history.sessions.length > 0
                      ? `${history.sessions.length} sesion${history.sessions.length === 1 ? '' : 'es'} registrada${history.sessions.length === 1 ? '' : 's'}`
                      : 'Sin sesiones medicas'}
                  </small>
                </button>
              ))}

              {histories.length === 0 && (
                <p className={styles.emptyState}>Todavia no hay historias registradas.</p>
              )}
            </div>
          </aside>

          <main className={styles.content}>
            <section className={`${styles.formShell} glass-panel`}>
              <div className={styles.topActions}>
                <div>
                  <span className={styles.formLabel}>Registro actual</span>
                  <h2>
                    {selectedHistory
                      ? `${selectedHistory.patient.firstName} ${selectedHistory.patient.lastName}`
                      : 'Nueva historia clinica'}
                  </h2>
                </div>

                <div className={styles.actionGroup}>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        status: event.target.value as ClinicalHistory['status'],
                      }))
                    }
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activa</option>
                    <option value="closed">Cerrada</option>
                  </select>
                  <button className={styles.saveButton} onClick={handleSave} type="button" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar historia'}
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}
              {feedback && <div className={styles.feedbackBox}>{feedback}</div>}

              <div className={styles.sectionGrid}>
                <section className={styles.sectionCard}>
                  <h3>Datos del paciente</h3>
                  <div className={styles.gridTwo}>
                    <div>
                      <label htmlFor="patient-firstName">Nombres</label>
                      <input
                        id="patient-firstName"
                        value={formData.patient.firstName}
                        onChange={(event) => updatePatientField('firstName', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-lastName">Apellidos</label>
                      <input
                        id="patient-lastName"
                        value={formData.patient.lastName}
                        onChange={(event) => updatePatientField('lastName', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-nickname">Apodo</label>
                      <input
                        id="patient-nickname"
                        value={formData.patient.nickname || ''}
                        onChange={(event) => updatePatientField('nickname', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-document">Documento</label>
                      <input
                        id="patient-document"
                        value={formData.patient.documentId}
                        onChange={(event) => updatePatientField('documentId', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-birthDate">Fecha de nacimiento</label>
                      <input
                        id="patient-birthDate"
                        type="date"
                        value={formData.patient.birthDate || ''}
                        onChange={(event) => updatePatientField('birthDate', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-age">Edad</label>
                      <input
                        id="patient-age"
                        type="number"
                        value={formData.patient.age || ''}
                        onChange={(event) => updatePatientField('age', Number(event.target.value))}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-gender">Genero</label>
                      <input
                        id="patient-gender"
                        value={formData.patient.gender || ''}
                        onChange={(event) => updatePatientField('gender', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-occupation">Ocupacion</label>
                      <input
                        id="patient-occupation"
                        value={formData.patient.occupation || ''}
                        onChange={(event) => updatePatientField('occupation', event.target.value)}
                      />
                    </div>
                    <div className={styles.fullWidth}>
                      <label htmlFor="patient-address">Direccion</label>
                      <input
                        id="patient-address"
                        value={formData.patient.address || ''}
                        onChange={(event) => updatePatientField('address', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-phones">Telefonos</label>
                      <input
                        id="patient-phones"
                        value={formatList(formData.patient.phones)}
                        onChange={(event) => updatePatientField('phones', parseList(event.target.value))}
                        placeholder="999888777, 014556677"
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-email">Correo</label>
                      <input
                        id="patient-email"
                        value={formData.patient.email || ''}
                        onChange={(event) => updatePatientField('email', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-leadSource">Fuente de captacion</label>
                      <input
                        id="patient-leadSource"
                        value={formData.patient.leadSource || ''}
                        onChange={(event) => updatePatientField('leadSource', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-photo">Foto paciente</label>
                      <div className={styles.photoUploadCard}>
                        <input
                          id="patient-photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePatientPhotoUpload}
                        />
                        <small className={styles.helperText}>
                          {isUploadingPhoto
                            ? 'Subiendo foto...'
                            : 'La imagen se almacena temporalmente en el backend local.'}
                        </small>
                        {formData.patient.photoUrl ? (
                          <>
                            <img
                              className={styles.photoPreview}
                              src={apiClient.resolveAssetUrl(formData.patient.photoUrl)}
                              alt="Foto del paciente"
                            />
                            <input
                              value={formData.patient.photoUrl || ''}
                              onChange={(event) => updatePatientField('photoUrl', event.target.value)}
                              placeholder="Ruta de la imagen"
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <h3>Tutor o apoderado</h3>
                  <div className={styles.gridTwo}>
                    <div>
                      <label htmlFor="guardian-name">Nombre completo</label>
                      <input
                        id="guardian-name"
                        value={formData.guardian?.fullName || ''}
                        onChange={(event) => updateGuardianField('fullName', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-relationship">Relacion</label>
                      <input
                        id="guardian-relationship"
                        value={formData.guardian?.relationship || ''}
                        onChange={(event) => updateGuardianField('relationship', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-document">Documento</label>
                      <input
                        id="guardian-document"
                        value={formData.guardian?.documentId || ''}
                        onChange={(event) => updateGuardianField('documentId', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-phone">Telefono</label>
                      <input
                        id="guardian-phone"
                        value={formData.guardian?.phone || ''}
                        onChange={(event) => updateGuardianField('phone', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-email">Correo</label>
                      <input
                        id="guardian-email"
                        value={formData.guardian?.email || ''}
                        onChange={(event) => updateGuardianField('email', event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-photo">Foto tutor</label>
                      <input
                        id="guardian-photo"
                        value={formData.guardian?.photoUrl || ''}
                        onChange={(event) => updateGuardianField('photoUrl', event.target.value)}
                        placeholder="Referencia o nombre del archivo"
                      />
                    </div>
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <h3>Historia clinica base</h3>
                  <div className={styles.gridSingle}>
                    <div>
                      <label htmlFor="anamnesis">Anamnesis</label>
                      <textarea id="anamnesis" value={formData.anamnesis} onChange={(event) => handleTextArea(event, 'anamnesis')} />
                    </div>
                    <div>
                      <label htmlFor="medicalBackground">Antecedentes medicos</label>
                      <textarea
                        id="medicalBackground"
                        value={formData.medicalBackground}
                        onChange={(event) => handleTextArea(event, 'medicalBackground')}
                      />
                    </div>
                    <div>
                      <label htmlFor="prenatalBackground">Antecedentes prenatales</label>
                      <textarea
                        id="prenatalBackground"
                        value={formData.prenatalBackground}
                        onChange={(event) => handleTextArea(event, 'prenatalBackground')}
                      />
                    </div>
                    <div>
                      <label htmlFor="postnatalBackground">Antecedentes postnatales</label>
                      <textarea
                        id="postnatalBackground"
                        value={formData.postnatalBackground}
                        onChange={(event) => handleTextArea(event, 'postnatalBackground')}
                      />
                    </div>
                    <div>
                      <label htmlFor="oralHabits">Habitos orales</label>
                      <textarea id="oralHabits" value={formData.oralHabits} onChange={(event) => handleTextArea(event, 'oralHabits')} />
                    </div>
                    <div>
                      <label htmlFor="dentalDevelopment">Desarrollo dental</label>
                      <textarea
                        id="dentalDevelopment"
                        value={formData.dentalDevelopment}
                        onChange={(event) => handleTextArea(event, 'dentalDevelopment')}
                      />
                    </div>
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <div className={styles.sectionAccordionHeader}>
                    <div>
                      <h3>Sesiones medicas</h3>
                      <p className={styles.sectionHint}>
                        Puedes dejar la historia clinica sin sesiones y agregarlas mas adelante.
                        La mas reciente se muestra primero.
                      </p>
                    </div>

                    <div className={styles.sectionAccordionActions}>
                      <button className={styles.secondaryButton} onClick={addSession} type="button">
                        Agregar sesion
                      </button>
                      <button
                        className={styles.toggleButton}
                        onClick={() => setIsSessionsOpen((current) => !current)}
                        type="button"
                      >
                        {isSessionsOpen ? 'Ocultar' : 'Mostrar'} sesiones
                      </button>
                    </div>
                  </div>

                  {isSessionsOpen ? (
                    formData.sessions.length > 0 ? (
                      <div className={styles.sessionList}>
                        {orderedSessions.map(({ session, index }, renderIndex) => (
                          <article key={`${session.date}-${index}`} className={styles.sessionCard}>
                            <div className={styles.sessionCardHeader}>
                              <div className={styles.sessionCardTitle}>
                                <strong>Sesion {renderIndex + 1}</strong>
                                {renderIndex === 0 ? (
                                  <span className={styles.sessionBadge}>Mas reciente</span>
                                ) : null}
                              </div>
                              <button
                                className={styles.removeButton}
                                onClick={() => removeSession(index)}
                                type="button"
                              >
                                Eliminar
                              </button>
                            </div>

                            <div className={styles.gridTwo}>
                              <div>
                                <label htmlFor={`session-date-${index}`}>Fecha</label>
                                <input
                                  id={`session-date-${index}`}
                                  type="date"
                                  value={session.date}
                                  onChange={(event) => updateSessionField(index, 'date', event.target.value)}
                                />
                              </div>
                              <div>
                                <label htmlFor={`session-doctor-${index}`}>Doctor responsable</label>
                                <input
                                  id={`session-doctor-${index}`}
                                  value={session.doctorResponsible}
                                  onChange={(event) =>
                                    updateSessionField(index, 'doctorResponsible', event.target.value)
                                  }
                                />
                              </div>
                              <div className={styles.fullWidth}>
                                <label htmlFor={`session-reason-${index}`}>Motivo de consulta</label>
                                <input
                                  id={`session-reason-${index}`}
                                  value={session.consultationReason}
                                  onChange={(event) =>
                                    updateSessionField(index, 'consultationReason', event.target.value)
                                  }
                                />
                              </div>
                              <div className={styles.fullWidth}>
                                <label htmlFor={`session-diagnosis-${index}`}>Diagnostico</label>
                                <textarea
                                  id={`session-diagnosis-${index}`}
                                  value={session.diagnosis}
                                  onChange={(event) => updateSessionField(index, 'diagnosis', event.target.value)}
                                />
                              </div>
                              <div className={styles.fullWidth}>
                                <label htmlFor={`session-plan-${index}`}>Plan</label>
                                <textarea
                                  id={`session-plan-${index}`}
                                  value={session.treatmentPlan}
                                  onChange={(event) => updateSessionField(index, 'treatmentPlan', event.target.value)}
                                />
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyStateInline}>
                        Todavia no hay sesiones medicas para este paciente.
                      </p>
                    )
                  ) : null}
                </section>

                <section className={styles.sectionCard}>
                  <h3>Adjuntos y evidencia</h3>
                  <div className={styles.gridSingle}>
                    <div>
                      <label htmlFor="attachments">Archivos adjuntos</label>
                      <input
                        id="attachments-upload"
                        type="file"
                        multiple
                        onChange={(event) => handleFileSelection(event, 'attachments')}
                      />
                      <input
                        id="attachments"
                        value={formatList(formData.attachments)}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            attachments: parseList(event.target.value),
                          }))
                        }
                        placeholder="Consentimiento firmado, Triage inicial"
                      />
                    </div>
                    <div>
                      <label htmlFor="radiographs">Radiografias</label>
                      <input
                        id="radiographs-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(event) => handleFileSelection(event, 'radiographs')}
                      />
                      <input
                        id="radiographs"
                        value={formatList(formData.radiographs)}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            radiographs: parseList(event.target.value),
                          }))
                        }
                        placeholder="Panoramica 2026-05, Periapical 1.6"
                      />
                    </div>
                    <div>
                      <label htmlFor="patientPhotos">Fotos del paciente</label>
                      <input
                        id="patientPhotos-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(event) => handleFileSelection(event, 'patientPhotos')}
                      />
                      <input
                        id="patientPhotos"
                        value={formatList(formData.patientPhotos)}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            patientPhotos: parseList(event.target.value),
                          }))
                        }
                        placeholder="Frontal sonrisa, Perfil derecho"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>

        {isNavigating ? (
          <div className={styles.routeOverlay}>
            <div className={styles.routeOverlayCard}>
              <span className={styles.routeSpinner} />
              <strong>Volviendo al panel principal...</strong>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}