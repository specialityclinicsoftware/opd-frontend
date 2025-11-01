import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { visitService, patientService } from '../../services';
import userService from '../../services/userService';
import type { Patient, VisitFormData, User } from '../../types';
import type { AxiosError } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import PreConsultationForm from '../../components/visits/PreConsultationForm';

const PreConsultationWorkflow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Role checks for future access control
  const { isDoctor: _isDoctor, isNurse: _isNurse, user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewVisit, setIsNewVisit] = useState(true);

  const [formData, setFormData] = useState<VisitFormData>({
    patientId: preselectedPatientId || '',
    visitDate: new Date(),
    consultingDoctor: '',
    vitals: {
      pulseRate: undefined,
      bloodPressure: undefined,
      spO2: undefined,
      temperature: undefined,
    },
    chiefComplaints: '',
    pastHistory: '',
    familyHistory: '',
    maritalHistory: '',
    generalExamination: {},
    bloodInvestigations: [],
    status: 'draft',
  });

  useEffect(() => {
    loadPatients();
    if (user?.hospitalId) {
      loadDoctors();
    }
    if (id) {
      setIsNewVisit(false);
      loadExistingVisit();
    }
  }, [id, user?.hospitalId]);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p._id === preselectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patientId: patient._id }));
      }
    }
  }, [preselectedPatientId, patients]);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data || []);
    } catch (err) {
      console.error('Load patients error:', err);
    }
  };

  const loadDoctors = async () => {
    if (!user?.hospitalId) return;
    try {
      const doctorsData = await userService.getHospitalDoctors(user.hospitalId);
      setDoctors(doctorsData || []);
    } catch (err) {
      console.error('Load doctors error:', err);
    }
  };

  const loadExistingVisit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await visitService.getById(id);
      const visit = response.data;
      setFormData({
        patientId: visit.patientId,
        visitDate: new Date(visit.visitDate),
        consultingDoctor: visit.consultingDoctor || '',
        vitals: visit.vitals,
        chiefComplaints: visit.chiefComplaints,
        pastHistory: visit.pastHistory,
        familyHistory: visit.familyHistory,
        maritalHistory: visit.maritalHistory,
        generalExamination: visit.generalExamination,
        bloodInvestigations: visit.bloodInvestigations,
        status: visit.status,
      });
      const patient = patients.find(p => p._id === visit.patientId);
      if (patient) setSelectedPatient(patient);
    } catch (err) {
      console.error('Load visit error:', err);
      setError('Failed to load visit data');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patientId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Shift+Enter submits the form
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget;
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.click();
      }
      return;
    }

    // Arrow key navigation (left/right)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      // Get all focusable elements (excluding checkboxes and buttons)
      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input[type="text"]:not([disabled]), input[type="number"]:not([disabled]), input[type="date"]:not([disabled]), input[type="time"]:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        )
      );

      const target = e.target as HTMLElement;
      const currentIndex = focusableElements.indexOf(target);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextElement = focusableElements[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
          // If it's an input or textarea, select the content
          if (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA') {
            (nextElement as HTMLInputElement | HTMLTextAreaElement).select();
          }
        }
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevElement = focusableElements[currentIndex - 1];
        if (prevElement) {
          prevElement.focus();
          // If it's an input or textarea, select the content
          if (prevElement.tagName === 'INPUT' || prevElement.tagName === 'TEXTAREA') {
            (prevElement as HTMLInputElement | HTMLTextAreaElement).select();
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    if (!formData.consultingDoctor.trim()) {
      setError('Consulting doctor name is required');
      return;
    }

    try {
      setLoading(true);

      if (isNewVisit) {
        // Create new visit with pre-consultation data
        const response = await visitService.create({
          ...formData,
          status: 'draft',
        });
        const visitId = response.data._id;

        // Submit pre-consultation
        await visitService.submitPreConsultation(visitId, formData);

        alert('Pre-consultation completed! Visit is now pending for doctor review.');
        navigate('/visits/pending');
      } else {
        // Update existing visit's pre-consultation
        await visitService.submitPreConsultation(id!, formData);
        alert('Pre-consultation updated successfully!');
        navigate('/visits/pending');
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to save pre-consultation data');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNewVisit) {
    return (
      <div style={styles.loadingContainer}>
        <svg style={styles.spinner} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6">
          <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <p style={styles.loadingText}>Loading visit data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Compact Header */}
        <div style={styles.compactHeader}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <div style={styles.stageRow}>
                <div style={styles.stageActiveCompact}>1</div>
                <h1 style={styles.compactTitle}>Pre-Consultation</h1>
                <svg width="24" height="8" viewBox="0 0 24 8" style={{ margin: '0 0.5rem' }}>
                  <line x1="0" y1="4" x2="24" y2="4" stroke="#cbd5e0" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                <div style={styles.stageInactiveCompact}>2</div>
                <span style={styles.stageTextInactive}>Doctor Consultation</span>
              </div>
            </div>
            <div style={styles.headerRight}>
              {/* Patient Selector - Only for new visits */}
              {isNewVisit && (
                <div style={styles.compactField}>
                  <label style={styles.compactLabel}>Patient *</label>
                  <select
                    value={formData.patientId}
                    onChange={handlePatientChange}
                    style={styles.compactSelect}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visit Date */}
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Visit Date</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate instanceof Date ? formData.visitDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, visitDate: new Date(e.target.value) })}
                  style={styles.compactInput}
                />
              </div>

              {/* Consulting Doctor */}
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Doctor *</label>
                <select
                  name="consultingDoctor"
                  value={formData.consultingDoctor}
                  onChange={(e) => setFormData({ ...formData, consultingDoctor: e.target.value })}
                  style={styles.compactSelect}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor.name}>
                      {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                style={styles.cancelButtonCompact}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Patient Info Badge */}
          {selectedPatient && (
            <div style={styles.infoRow}>
              <div style={styles.patientBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{selectedPatient.name}</span>
                <span style={styles.dot}>•</span>
                <span>{selectedPatient.age}y</span>
                <span style={styles.dot}>•</span>
                <span>{selectedPatient.gender}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pre-Consultation Form */}
        <PreConsultationForm
          formData={formData}
          onFormDataChange={setFormData}
          readOnly={false}
        />

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.buttonContent}>
                <svg style={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Saving...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Complete Pre-Consultation
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  compactHeader: {
    backgroundColor: 'white',
    padding: '1rem 1.25rem',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
  },
  headerRight: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
  },
  stageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stageActiveCompact: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700' as const,
    flexShrink: 0,
  },
  stageInactiveCompact: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700' as const,
    flexShrink: 0,
    border: '1px solid #e2e8f0',
  },
  compactTitle: {
    fontSize: '1.125rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
    whiteSpace: 'nowrap' as const,
  },
  stageTextInactive: {
    fontSize: '0.8125rem',
    color: '#94a3b8',
    fontWeight: '500' as const,
    whiteSpace: 'nowrap' as const,
  },
  compactField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  compactLabel: {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  compactSelect: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    minWidth: '150px',
  },
  compactInput: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    minWidth: '150px',
  },
  infoRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  patientBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '500' as const,
  },
  dot: {
    color: '#cbd5e0',
  },
  cancelButtonCompact: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    alignSelf: 'flex-end',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1rem',
    margin: 0,
    marginBottom: '1rem',
    color: '#1e293b',
    fontWeight: '600' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    letterSpacing: '-0.025em',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500' as const,
    fontSize: '0.875rem',
    color: '#475569',
  },
  required: {
    color: '#dc2626',
    marginLeft: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    cursor: 'pointer',
  },
  submitSection: {
    position: 'sticky' as const,
    bottom: '0',
    marginTop: '1.5rem',
    marginBottom: '0',
    padding: '1.25rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  submitButton: {
    width: '100%',
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    margin: '2rem',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    marginTop: '1rem',
  },
};

export default PreConsultationWorkflow;
