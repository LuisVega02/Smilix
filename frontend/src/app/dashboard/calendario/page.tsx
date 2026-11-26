'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import apiClient from '@/app/utils/api';
import styles from './page.module.css';

type AppointmentStatus = 'agendado' | 'confirmado' | 'finalizada' | 'cancelada';

interface Appointment {
  id: number;
  patientId: number;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  doctorResponsible: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
}

interface AppointmentForm {
  patientId: string;
  doctorResponsible: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
}

const statusLabels: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

const statusClasses: Record<AppointmentStatus, string> = {
  agendado: styles.statusAgendado,
  confirmado: styles.statusConfirmado,
  finalizada: styles.statusFinalizada,
  cancelada: styles.statusCancelada,
};

const formatDayLabel = (date: Date) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);

const formatDateLabel = (date: Date) =>
  `${date.getDate()} ${new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date)}`;

const getWeekStart = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + delta);
  return result;
};

const isoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const localDateString = (timestamp: string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const localTimeString = (timestamp: string) => {
  const date = new Date(timestamp);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

const createEmptyForm = (date: string): AppointmentForm => ({
  patientId: '',
  doctorResponsible: '',
  date,
  startTime: '09:00',
  endTime: '09:30',
  status: 'agendado',
  notes: '',
});

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(isoDate(getWeekStart(new Date())));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AppointmentForm>(createEmptyForm(isoDate(getWeekStart(new Date()))));
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    router.prefetch('/dashboard');

    const loadAppointments = async () => {
      try {
        const response = await apiClient.get<Appointment[]>('/api/appointments');
        setAppointments(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las citas');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
  }, [router]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [selectedWeekStart]);

  const appointmentsByDate = useMemo(() => {
    return weekDays.reduce<Record<string, Appointment[]>>((acc, date) => {
      const key = isoDate(date);
      acc[key] = appointments.filter((appointment) => localDateString(appointment.startTime) === key);
      return acc;
    }, {});
  }, [appointments, weekDays]);

  const selectedDayAppointments = useMemo(
    () => appointmentsByDate[selectedDay] || [],
    [appointmentsByDate, selectedDay],
  );

  const selectedDayLabel = useMemo(() => {
    const date = new Date(selectedDay);
    return `${formatDayLabel(date)}, ${formatDateLabel(date)}`;
  }, [selectedDay]);

  const resetForm = () => {
    setSelectedAppointmentId(null);
    setFormData(createEmptyForm(selectedDay));
    setError('');
    setFeedback('');
  };

  const handleDaySelect = (date: Date) => {
    const nextDay = isoDate(date);
    setSelectedDay(nextDay);
    setSelectedAppointmentId(null);
    setFormData((current) => ({ ...current, date: nextDay }));
    setError('');
    setFeedback('');
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
    setSelectedDay(localDateString(appointment.startTime));
    setFormData({
      patientId: String(appointment.patientId),
      doctorResponsible: appointment.doctorResponsible,
      date: localDateString(appointment.startTime),
      startTime: localTimeString(appointment.startTime),
      endTime: localTimeString(appointment.endTime),
      status: appointment.status,
      notes: appointment.notes || '',
    });
    setError('');
    setFeedback('');
  };

  const handleFieldChange = (field: keyof AppointmentForm, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildPayload = () => ({
    patientId: Number(formData.patientId),
    doctorResponsible: (formData.doctorResponsible || '').trim(),
    startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
    endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
    status: formData.status,
    notes: (formData.notes || '').trim() || undefined,
  });

  const validateForm = (): string | null => {
    if (!formData.patientId || Number.isNaN(Number(formData.patientId))) {
      return 'El ID del paciente es requerido y debe ser numérico.';
    }
    if (!(formData.doctorResponsible || '').trim()) {
      return 'El doctor responsable es requerido.';
    }
    if (!formData.date) {
      return 'La fecha de la cita es requerida.';
    }
    if (!formData.startTime || !formData.endTime) {
      return 'El horario de inicio y fin son requeridos.';
    }
    if (formData.startTime >= formData.endTime) {
      return 'La hora de fin debe ser posterior a la hora de inicio.';
    }
    return null;
  };

  const handleSave = async () => {
    setError('');
    setFeedback('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const candidateStart = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const candidateDoctor = formData.doctorResponsible.trim().toLowerCase();

    const conflict = appointments.find((appointment) => {
      const otherDoctor = appointment.doctorResponsible?.trim().toLowerCase();
      return (
        appointment.id !== selectedAppointmentId &&
        otherDoctor === candidateDoctor &&
        appointment.startTime === candidateStart
      );
    });

    if (conflict) {
      setError('Ya existe una cita para este doctor en el mismo horario.');
      return;
    }

    const payload = buildPayload();

    try {
      let saved: Appointment;
      if (selectedAppointmentId) {
        saved = await apiClient.patch<Appointment>(`/api/appointments/${selectedAppointmentId}`, payload);
        setAppointments((current) =>
          current.map((appointment) => (appointment.id === selectedAppointmentId ? saved : appointment)),
        );
        setFeedback('Cita actualizada correctamente.');
      } else {
        saved = await apiClient.post<Appointment>('/api/appointments', payload);
        setAppointments((current) => [saved, ...current]);
        setSelectedAppointmentId(saved.id);
        setFeedback('Cita agendada correctamente.');
      }
      setSelectedDay(localDateString(saved.startTime));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la cita.');
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointmentId) return;
    const confirmed = window.confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/appointments/${selectedAppointmentId}`);
      setAppointments((current) => current.filter((appointment) => appointment.id !== selectedAppointmentId));
      handleClearSelection();
      setFeedback('Cita eliminada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la cita.');
    }
  };

  const handleClearSelection = () => {
    setSelectedAppointmentId(null);
    setFormData(createEmptyForm(selectedDay));
    setError('');
    setFeedback('');
  };

  const handleWeekShift = (offset: number) => {
    const next = new Date(selectedWeekStart);
    next.setDate(next.getDate() + offset);
    const weekStart = getWeekStart(next);
    setSelectedWeekStart(weekStart);
    setSelectedDay(isoDate(weekStart));
    setFormData((current) => ({ ...current, date: isoDate(weekStart) }));
    setSelectedAppointmentId(null);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className={styles.pageShell}>
          <p>Cargando calendario...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className={styles.pageShell}>
        <div className={styles.hero}>
          <div className={styles.heroHeader}>
            <div>
              <span className={styles.eyebrow}>Calendario semanal</span>
              <h1>Agenda y revisa las citas por semana</h1>
              <p className={styles.heroCopy}>
                Selecciona un día para ver las citas programadas y registra nuevas citas con estados.
              </p>
            </div>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} type="button" onClick={() => router.push('/dashboard')}>
                Volver al dashboard
              </button>
              <button className={styles.secondaryButton} type="button" onClick={handleClearSelection}>
                Nueva cita
              </button>
            </div>
          </div>
        </div>

        <section className={styles.calendarShell}>
          <div className={styles.calendarControls}>
            <button className={styles.secondaryButton} type="button" onClick={() => handleWeekShift(-7)}>
              Semana anterior
            </button>
            <strong>Semana comenzando {formatDateLabel(selectedWeekStart)}</strong>
            <button className={styles.secondaryButton} type="button" onClick={() => handleWeekShift(7)}>
              Semana siguiente
            </button>
          </div>

          <div className={styles.calendarGrid}>
            {weekDays.map((date) => {
              const dateKey = isoDate(date);
              const appointmentsForDay = appointmentsByDate[dateKey] || [];
              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`${styles.dayCard} ${selectedDay === dateKey ? styles.selected : ''}`}
                  onClick={() => handleDaySelect(date)}
                >
                  <div className={styles.dayLabel}>
                    <span className={styles.dayName}>{formatDayLabel(date)}</span>
                    <span className={styles.dayDate}>{date.getDate()}</span>
                  </div>
                  <div className={styles.appointmentSummary}>
                    <span className={styles.appointmentCount}>
                      {appointmentsForDay.length} cita{appointmentsForDay.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className={styles.statusLegend}>
                    {Object.entries(
                      appointmentsForDay.reduce<Record<AppointmentStatus, number>>((acc, appointment) => {
                        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
                        return acc;
                      }, { agendado: 0, confirmado: 0, finalizada: 0, cancelada: 0 }),
                    ).map(([status, count]) =>
                      count ? (
                        <span key={status} className={`${styles.statusPill} ${statusClasses[status as AppointmentStatus]}`}>
                          {statusLabels[status as AppointmentStatus]} {count}
                        </span>
                      ) : null,
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={styles.dayNoteSection}>
            <div className={styles.notePanel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Citas del día</h2>
                  <p className={styles.emptyState}>{selectedDayLabel}</p>
                </div>
                <span className={`${styles.statusPill} ${styles.statusCounter}`}>
                  {selectedDayAppointments.length} programada{selectedDayAppointments.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className={styles.panelContent}>
                {selectedDayAppointments.length === 0 ? (
                  <p className={styles.emptyState}>No hay citas programadas para este día.</p>
                ) : (
                  selectedDayAppointments
                    .sort((left, right) => left.startTime.localeCompare(right.startTime))
                    .map((appointment) => (
                      <button
                        type="button"
                        key={appointment.id}
                        className={styles.appointmentCard}
                        onClick={() => handleAppointmentSelect(appointment)}
                      >
                        <div className={styles.appointmentCardHeader}>
                          <strong>{appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : `Paciente #${appointment.patientId}`}</strong>
                          <span className={`${styles.statusPill} ${statusClasses[appointment.status]}`}>
                            {statusLabels[appointment.status]}
                          </span>
                        </div>
                        <div className={styles.appointmentMeta}>
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)} · Dr. {appointment.doctorResponsible}
                        </div>
                        {appointment.notes ? <div className={styles.noteItem}>{appointment.notes}</div> : null}
                      </button>
                    ))
                )}
              </div>
            </div>

            <div className={styles.formPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>{selectedAppointmentId ? 'Editar cita' : 'Nueva cita'}</h2>
                  <p className={styles.emptyState}>Selecciona un día del calendario para guardar una cita en ese día.</p>
                </div>
              </div>

              <div className={styles.panelContent}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="patientId">ID de paciente</label>
                  <input
                    id="patientId"
                    type="number"
                    value={formData.patientId}
                    onChange={(event) => handleFieldChange('patientId', event.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="doctorResponsible">Doctor responsable</label>
                  <input
                    id="doctorResponsible"
                    type="text"
                    value={formData.doctorResponsible}
                    onChange={(event) => handleFieldChange('doctorResponsible', event.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="date">Fecha</label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(event) => handleFieldChange('date', event.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="startTime">Hora inicio</label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(event) => handleFieldChange('startTime', event.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="endTime">Hora fin</label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(event) => handleFieldChange('endTime', event.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="status">Estado de la cita</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(event) => handleFieldChange('status', event.target.value)}
                  >
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="notes">Notas / motivo</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => handleFieldChange('notes', event.target.value)}
                  />
                </div>

                <div className={styles.formActions}>
                  <button className={styles.primaryButton} type="button" onClick={handleSave}>
                    Guardar cita
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                    Limpiar formulario
                  </button>
                  {selectedAppointmentId ? (
                    <button className={`${styles.secondaryButton} ${styles.dangerButton}`} type="button" onClick={handleDelete}>
                      Eliminar cita
                    </button>
                  ) : null}
                </div>

                {error ? <div className={styles.errorBox}>{error}</div> : null}
                {feedback ? <div className={styles.feedbackBox}>{feedback}</div> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
