import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { visitService } from '../../services';
import type { VisitFormData, Visit, Patient } from '../../types';
import type { AxiosError } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import ConsultationForm from '../../components/visits/ConsultationForm';

// Extended type for populated visit
interface PopulatedVisit extends Omit<Visit, 'patientId'> {
  patientId: string | Patient;
}

const ConsultationWorkflow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [visit, setVisit] = useState<PopulatedVisit | null>(null);

  const [formData, setFormData] = useState<VisitFormData>({
    patientId: '',
    visitDate: new Date(),
    consultingDoctor: '',
    vitals: {},
    systemicExamination: {},
    diagnosis: '',
    treatment: '',
    investigation: '',
    advice: '',
  });

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await visitService.getById(id);
      const visitData = response.data as PopulatedVisit;
      setVisit(visitData);

      setFormData({
        patientId:
          typeof visitData.patientId === 'string' ? visitData.patientId : visitData.patientId._id,
        visitDate: new Date(visitData.visitDate),
        consultingDoctor: visitData.consultingDoctor || '',
        vitals: visitData.vitals,
        chiefComplaints: visitData.chiefComplaints,
        pastHistory: visitData.pastHistory,
        familyHistory: visitData.familyHistory,
        maritalHistory: visitData.maritalHistory,
        generalExamination: visitData.generalExamination,
        bloodInvestigations: visitData.bloodInvestigations,
        systemicExamination: visitData.systemicExamination,
        diagnosis: visitData.diagnosis,
        treatment: visitData.treatment,
        investigation: visitData.investigation,
        advice: visitData.advice,
        reviewDate: visitData.reviewDate ? new Date(visitData.reviewDate) : undefined,
      });
    } catch (err) {
      console.error('Load visit error:', err);
      setError('Failed to load visit data');
    } finally {
      setLoading(false);
    }
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

    // Enter moves to next field for all inputs
    if (e.key === 'Enter' && !e.shiftKey) {
      const target = e.target as HTMLElement;

      // Prevent default Enter behavior (including new line in textareas)
      e.preventDefault();

      // Get all focusable elements (excluding checkboxes and buttons)
      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input[type="text"]:not([disabled]), input[type="number"]:not([disabled]), input[type="date"]:not([disabled]), input[type="time"]:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        )
      );

      const currentIndex = focusableElements.indexOf(target);
      const nextElement = focusableElements[currentIndex + 1];

      if (nextElement) {
        nextElement.focus();
        // If it's an input or textarea, select the content
        if (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA') {
          (nextElement as HTMLInputElement | HTMLTextAreaElement).select();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id) {
      setError('Visit ID is missing');
      return;
    }

    try {
      setSaving(true);

      // Submit consultation data
      await visitService.submitConsultation(id, {
        systemicExamination: formData.systemicExamination,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        investigation: formData.investigation,
        advice: formData.advice,
        reviewDate: formData.reviewDate,
      });

      // Get patient ID and doctor name from visit data
      const patientId =
        typeof visit?.patientId === 'string' ? visit.patientId : visit?.patientId?._id;
      const doctorName = formData.consultingDoctor || visit?.consultingDoctor || '';

      // Redirect to prescription page with patient and doctor pre-selected
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (doctorName) params.append('doctor', doctorName);

      navigate(`/prescriptions/new?${params.toString()}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to complete consultation');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getPatient = (): Patient | null => {
    if (visit && typeof visit.patientId === 'object' && visit.patientId !== null) {
      return visit.patientId as Patient;
    }
    return null;
  };

  if (!isDoctor) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2 style={styles.errorTitle}>Access Denied</h2>
          <p style={styles.errorText}>Only doctors can access consultation.</p>
          <button onClick={() => navigate('/')} style={styles.primaryButton}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <svg
          style={styles.spinner}
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeWidth="3"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <p style={styles.loadingText}>Loading visit data...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2 style={styles.errorTitle}>Visit Not Found</h2>
          <p style={styles.errorText}>The visit you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/visits/pending')} style={styles.primaryButton}>
            Back to Pending Visits
          </button>
        </div>
      </div>
    );
  }

  const patient = getPatient();

  return (
    <div style={styles.container}>
      {/* Compact Header with Patient Info, Stage, and Chief Complaints */}
      <div style={styles.compactHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.stageRow}>
            <div style={styles.stageCompletedCompact} title="Pre-Consultation Complete">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={styles.stageText}>Pre-Consult</span>
            <svg width="24" height="8" viewBox="0 0 24 8" style={{ margin: '0 0.5rem' }}>
              <line x1="0" y1="4" x2="24" y2="4" stroke="#10b981" strokeWidth="2" />
            </svg>
            <div style={styles.stageActiveCompact}>2</div>
            <h1 style={styles.compactTitle}>Doctor Consultation</h1>
          </div>
        </div>
        <div style={styles.headerRight}>
          {patient && (
            <div style={styles.patientInfoCompact}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#64748b' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={styles.patientName}>{patient.name}</span>
              <span style={styles.patientDivider}>•</span>
              <span style={styles.patientDetail}>{patient.age}y</span>
              <span style={styles.patientDivider}>•</span>
              <span style={styles.patientDetail}>{patient.gender}</span>
              <span style={styles.patientDivider}>•</span>
              <span style={styles.patientDetail}>{patient.phoneNumber}</span>
            </div>
          )}
          {formData.chiefComplaints && (
            <div style={styles.complaintsCompact}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#dc2626', flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={styles.complaintsText}>{formData.chiefComplaints}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Consultation Form with Pre-Consultation Data */}
        <ConsultationForm
          formData={formData}
          onFormDataChange={setFormData}
          showPreConsultationData={true}
          allowEditPreConsultationData={true}
        />

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button
            type="button"
            onClick={() => navigate('/visits/pending')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.submitButton,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <span style={styles.buttonContent}>
                <svg
                  style={styles.spinner}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="3"
                    strokeDasharray="31.4 31.4"
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                Saving...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Complete Consultation
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.875rem 1.25rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1 1 auto',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  stageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stageCompletedCompact: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stageText: {
    fontSize: '0.8125rem',
    color: '#10b981',
    fontWeight: '600' as const,
    whiteSpace: 'nowrap' as const,
  },
  stageActiveCompact: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700' as const,
    flexShrink: 0,
  },
  compactTitle: {
    fontSize: '1.125rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
    whiteSpace: 'nowrap' as const,
  },
  patientInfoCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  patientName: {
    fontSize: '0.9375rem',
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  patientDivider: {
    color: '#cbd5e0',
    fontSize: '0.875rem',
  },
  patientDetail: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  complaintsCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    maxWidth: '400px',
    minWidth: 0,
  },
  complaintsText: {
    fontSize: '0.875rem',
    color: '#991b1b',
    fontWeight: '500' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
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
  errorBox: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    maxWidth: '500px',
    margin: '4rem auto',
  },
  errorTitle: {
    fontSize: '1.5rem',
    margin: '1rem 0 0.5rem',
    color: '#1e293b',
    fontWeight: '600' as const,
  },
  errorText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    margin: '0 0 1.5rem',
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
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
    flex: '1',
    maxWidth: '400px',
  },
  cancelButton: {
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
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
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9375rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
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

export default ConsultationWorkflow;
