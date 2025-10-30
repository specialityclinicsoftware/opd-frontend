import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { visitService, patientService } from '../../services';
import type { Patient, VisitFormData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import PreConsultationForm from '../../components/visits/PreConsultationForm';
import ConsultationForm from '../../components/visits/ConsultationForm';

const VisitNewStaged = () => {
  const navigate = useNavigate();
  const { user, isDoctor, isNurse } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const visitId = searchParams.get('visitId'); // For continuing existing visits

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStage, setCurrentStage] = useState<'pre-consultation' | 'consultation'>('pre-consultation');

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
    systemicExamination: {},
    diagnosis: '',
    treatment: '',
    investigation: '',
    advice: '',
    bloodInvestigations: [],
    status: 'draft',
    audit: {
      enteredBy: {},
      timestamps: {
        createdAt: new Date(),
      },
      isNurseAssistedVisit: false,
    },
  });

  useEffect(() => {
    loadPatients();
    if (visitId) {
      loadExistingVisit();
    }
  }, []);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p._id === preselectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patientId: patient._id }));
      }
    }
  }, [preselectedPatientId, patients]);

  // Determine initial stage based on role and visit status
  useEffect(() => {
    if (visitId) {
      // Continuing existing visit - doctor stage
      setCurrentStage('consultation');
    } else if (isNurse) {
      // Nurse creating new visit
      setCurrentStage('pre-consultation');
    } else if (isDoctor) {
      // Doctor can choose - default to pre-consultation for nurse-assisted flow
      setCurrentStage('pre-consultation');
    }
  }, [visitId, isNurse, isDoctor]);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data || []);
    } catch (err) {
      console.error('Load patients error:', err);
    }
  };

  const loadExistingVisit = async () => {
    if (!visitId) return;

    try {
      const response = await visitService.getById(visitId);
      const visit = response.data;
      setFormData({
        ...visit,
        visitDate: new Date(visit.visitDate),
        reviewDate: visit.reviewDate ? new Date(visit.reviewDate) : undefined,
      });
      setSelectedPatient(patients.find(p => p._id === visit.patientId) || null);
    } catch (err) {
      console.error('Load visit error:', err);
      setError('Failed to load visit data');
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patientId });
  };

  const handleSubmitPreConsultation = async (e: React.FormEvent) => {
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

      // Update audit trail
      const updatedFormData: VisitFormData = {
        ...formData,
        status: 'pre_consultation_complete',
        audit: {
          enteredBy: {
            ...formData.audit?.enteredBy,
            nurseId: user?.id,
            nurseName: user?.name,
          },
          timestamps: {
            ...formData.audit?.timestamps,
            nurseCompletedAt: new Date(),
          },
          isNurseAssistedVisit: true,
        },
      };

      if (visitId) {
        await visitService.update(visitId, updatedFormData);
      } else {
        await visitService.create(updatedFormData);
      }

      alert('Pre-consultation data saved! Doctor can now continue with consultation.');
      navigate('/visits/pending'); // Navigate to pending visits queue
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save visit data');
      console.error('Save visit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
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

      // Update audit trail
      const updatedFormData: VisitFormData = {
        ...formData,
        status: 'completed',
        audit: {
          enteredBy: {
            ...formData.audit?.enteredBy,
            doctorId: user?.id,
            doctorName: user?.name,
          },
          timestamps: {
            ...formData.audit?.timestamps,
            doctorCompletedAt: new Date(),
            updatedAt: new Date(),
          },
          isNurseAssistedVisit: formData.audit?.isNurseAssistedVisit || false,
        },
      };

      if (visitId) {
        await visitService.update(visitId, updatedFormData);
        alert('Visit updated successfully!');
      } else {
        await visitService.create(updatedFormData);
        alert('Visit created successfully!');
      }

      navigate(`/patients/${formData.patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete visit');
      console.error('Complete visit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStageIndicator = () => {
    if (!formData.audit?.isNurseAssistedVisit && !isNurse) {
      return null; // Don't show stages for doctor-only flow
    }

    return (
      <div style={styles.stageIndicator}>
        <div style={currentStage === 'pre-consultation' ? styles.stageActive : styles.stageCompleted}>
          <span style={styles.stageNumber}>1</span>
          <span style={styles.stageLabel}>Pre-Consultation (Nurse)</span>
        </div>
        <div style={styles.stageDivider} />
        <div style={currentStage === 'consultation' ? styles.stageActive : styles.stageInactive}>
          <span style={styles.stageNumber}>2</span>
          <span style={styles.stageLabel}>Consultation (Doctor)</span>
        </div>
      </div>
    );
  };

  // Role-based access control
  if (isNurse && currentStage === 'consultation') {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Access Denied</h2>
          <p>Nurses cannot access the consultation stage. This visit is awaiting doctor review.</p>
          <button onClick={() => navigate('/visits')} style={styles.submitButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {visitId ? 'Continue Visit' : 'New Visit Entry'}
            {currentStage === 'pre-consultation' && ' - Pre-Consultation'}
            {currentStage === 'consultation' && ' - Consultation'}
          </h1>
          <p style={styles.subtitle}>
            {currentStage === 'pre-consultation'
              ? 'Record vitals, history, and general examination'
              : 'Complete systemic examination and assessment'}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>

      {renderStageIndicator()}

      <form onSubmit={currentStage === 'pre-consultation' ? handleSubmitPreConsultation : handleSubmitConsultation}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Patient Selection - Always shown */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Patient Information
          </h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select Patient <span style={styles.required}>*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={handlePatientChange}
              style={styles.select}
              required
              disabled={!!visitId}
            >
              <option value="">-- Select Patient --</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.phoneNumber}
                </option>
              ))}
            </select>
          </div>
          {selectedPatient && (
            <div style={styles.patientInfo}>
              <strong>Age:</strong> {selectedPatient.age || 'N/A'} |
              <strong> Gender:</strong> {selectedPatient.gender}
            </div>
          )}
        </div>

        {/* Visit Details - Always shown */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Visit Details
          </h2>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Visit Date</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate instanceof Date ? formData.visitDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, visitDate: new Date(e.target.value) })}
                style={styles.input}
                disabled={currentStage === 'consultation'}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Consulting Doctor <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="consultingDoctor"
                value={formData.consultingDoctor}
                onChange={(e) => setFormData({ ...formData, consultingDoctor: e.target.value })}
                placeholder="Doctor name"
                style={styles.input}
                required
                disabled={currentStage === 'consultation'}
              />
            </div>
          </div>
        </div>

        {/* Stage-specific forms */}
        {currentStage === 'pre-consultation' && (
          <PreConsultationForm
            formData={formData}
            onFormDataChange={setFormData}
            readOnly={false}
          />
        )}

        {currentStage === 'consultation' && (
          <ConsultationForm
            formData={formData}
            onFormDataChange={setFormData}
            showPreConsultationData={formData.audit?.isNurseAssistedVisit || false}
            allowEditPreConsultationData={isDoctor}
          />
        )}

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
                <svg style={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Saving...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {currentStage === 'pre-consultation'
                  ? 'Complete Pre-Consultation'
                  : 'Complete Visit'}
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
    padding: '0 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    marginBottom: '0.25rem',
    color: '#0f172a',
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: '0.95rem',
    margin: 0,
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  stageIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  stageActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '600' as const,
  },
  stageCompleted: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '600' as const,
  },
  stageInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '8px',
    fontWeight: '500' as const,
  },
  stageNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700' as const,
  },
  stageLabel: {
    fontSize: '0.95rem',
  },
  stageDivider: {
    width: '60px',
    height: '2px',
    backgroundColor: '#e2e8f0',
    margin: '0 1rem',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '1rem 1.25rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #fee2e2',
    fontSize: '0.95rem',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '2px solid #fee2e2',
    maxWidth: '600px',
    margin: '4rem auto',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    margin: 0,
    marginBottom: '1.5rem',
    color: '#0f172a',
    fontWeight: '600' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600' as const,
    fontSize: '0.875rem',
    color: '#334155',
  },
  required: {
    color: '#ef4444',
    marginLeft: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
  },
  patientInfo: {
    marginTop: '1rem',
    padding: '1rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  submitSection: {
    position: 'sticky' as const,
    bottom: '0',
    marginTop: '2rem',
    marginBottom: '0',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  submitButton: {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#3b82f6',
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
  cancelButton: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.9rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease',
  },
};

export default VisitNewStaged;
