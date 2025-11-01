import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { medicationService, patientService, visitService } from '../../services';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import type { Patient, Visit, Medication, PrescriptionFormData, User } from '../../types';

const PrescriptionNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const preselectedDoctor = searchParams.get('doctor');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<PrescriptionFormData>({
    hospitalId: user?.hospitalId || '',
    patientId: preselectedPatientId || '',
    visitId: '',
    prescribedDate: new Date(),
    doctorId: user?._id || '',
    consultingDoctor: preselectedDoctor || user?.name || '',
    diagnosis: '',
    medications: [
      {
        medicineName: '',
        dosage: '',
        days: 1,
        timing: {
          morning: false,
          afternoon: false,
          evening: false,
          night: false,
        },
        meal: {
          beforeMeal: false,
          afterMeal: false,
        },
      },
    ],
    notes: '',
  });

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p._id === preselectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patientId: patient._id }));
        loadVisits(patient._id);
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

  const loadVisits = async (patientId: string) => {
    try {
      const response = await visitService.getByPatient(patientId);
      setVisits(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Load visits error:', err);
      setVisits([]);
    }
  };

  const loadDoctors = async () => {
    if (!user?.hospitalId) return;
    try {
      const doctors = await userService.getHospitalDoctors(user.hospitalId);
      setDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (err) {
      console.error('Load doctors error:', err);
    }
  };

  const handlePatientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
    setFormData(prev => ({ ...prev, patientId, visitId: '' }));
    if (patientId) {
      await loadVisits(patientId);
    } else {
      setVisits([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(d => d._id === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      consultingDoctor: doctor?.name || '',
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicineName: '',
          dosage: '',
          days: 1,
          timing: {
            morning: false,
            afternoon: false,
            evening: false,
            night: false,
          },
          meal: {
            beforeMeal: false,
            afterMeal: false,
          },
        },
      ],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => {
      if (prev.medications.length === 1) {
        alert('At least one medication is required');
        return prev;
      }
      const meds = [...prev.medications];
      meds.splice(index, 1);
      return { ...prev, medications: meds };
    });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    setFormData(prev => {
      const meds = [...prev.medications];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medications: meds };
    });
  };

  const updateMedicationTiming = (index: number, field: keyof Medication['timing'], checked: boolean) => {
    setFormData(prev => {
      const meds = [...prev.medications];
      meds[index] = {
        ...meds[index],
        timing: { ...meds[index].timing, [field]: checked },
      };
      return { ...prev, medications: meds };
    });
  };

  const updateMedicationMeal = (index: number, field: keyof Medication['meal'], checked: boolean) => {
    setFormData(prev => {
      const meds = [...prev.medications];
      meds[index] = {
        ...meds[index],
        meal: { ...meds[index].meal, [field]: checked },
      };
      return { ...prev, medications: meds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    if (!formData.visitId) {
      setError('Please select a visit');
      return;
    }
    if (!formData.consultingDoctor.trim()) {
      setError('Consulting doctor name is required');
      return;
    }
    if (formData.medications.some(m => !m.medicineName.trim())) {
      setError('All medications must have a medicine name');
      return;
    }

    try {
      setLoading(true);
      await medicationService.create(formData);
      alert('Prescription created successfully!');
      navigate(`/patients/${formData.patientId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create prescription');
      console.error('Create prescription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Compact Header - Patient & Prescription Info */}
        <div style={styles.compactHeader}>
          <div style={styles.headerRow}>
            <h1 style={styles.pageTitle}>New Prescription</h1>
            <div style={styles.headerRight}>
              {/* Patient Selector */}
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

              {/* Visit Selector */}
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Visit *</label>
                <select
                  name="visitId"
                  value={formData.visitId}
                  onChange={handleChange}
                  style={styles.compactSelect}
                  required
                  disabled={!formData.patientId}
                >
                  <option value="">Select Visit</option>
                  {visits.map(visit => (
                    <option key={visit._id} value={visit._id}>
                      {new Date(visit.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Dropdown */}
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  style={styles.compactSelect}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Date</label>
                <input
                  type="date"
                  name="prescribedDate"
                  value={formData.prescribedDate instanceof Date ? formData.prescribedDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, prescribedDate: new Date(e.target.value) }))}
                  style={styles.compactInput}
                />
              </div>
            </div>
          </div>

          {/* Patient & Diagnosis Info Row */}
          {(selectedPatient || formData.diagnosis) && (
            <div style={styles.infoRow}>
              {selectedPatient && (
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
              )}
              {formData.diagnosis && (
                <div style={styles.diagnosisBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{formData.diagnosis}</span>
                </div>
              )}
              {!formData.diagnosis && (
                <div style={styles.compactFieldInline}>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Enter diagnosis (optional)"
                    style={styles.inlineDiagnosisInput}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Medications - Prominent Section */}
        <div style={styles.medicationsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.medicationsTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
              Medications <span style={styles.required}>*</span>
            </h2>
            <button type="button" onClick={addMedication} style={styles.addButton}>
              + Add Medication
            </button>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{...styles.tableHeader, width: '50px'}}>  #</th>
                  <th style={{...styles.tableHeader, minWidth: '280px'}}>Medicine Name *</th>
                  <th style={{...styles.tableHeader, width: '150px'}}>Dosage</th>
                  <th style={{...styles.tableHeader, width: '120px'}}>Days</th>
                  <th style={{...styles.tableHeader, minWidth: '180px'}}>
                    Timing
                    <div style={styles.timingSubHeader}>
                      <span>M</span>
                      <span>A</span>
                      <span>E</span>
                      <span>N</span>
                    </div>
                  </th>
                  <th style={{...styles.tableHeader, minWidth: '160px'}}>
                    Meal
                    <div style={styles.timingSubHeader}>
                      <span>Before</span>
                      <span>After</span>
                    </div>
                  </th>
                  <th style={{...styles.tableHeader, width: '70px'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.medications.map((med, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        value={med.medicineName}
                        onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                        placeholder="Medicine name"
                        style={styles.tableInput}
                        required
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="500mg"
                        style={styles.tableInput}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="number"
                        value={med.days}
                        onChange={(e) => updateMedication(index, 'days', parseInt(e.target.value) || 1)}
                        placeholder="7"
                        style={styles.tableInput}
                        min="1"
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.timing.morning}
                            onChange={(e) => updateMedicationTiming(index, 'morning', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>M</span>
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.timing.afternoon}
                            onChange={(e) => updateMedicationTiming(index, 'afternoon', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>A</span>
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.timing.evening}
                            onChange={(e) => updateMedicationTiming(index, 'evening', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>E</span>
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.timing.night}
                            onChange={(e) => updateMedicationTiming(index, 'night', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>N</span>
                        </label>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.meal.beforeMeal}
                            onChange={(e) => updateMedicationMeal(index, 'beforeMeal', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>Before</span>
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={med.meal.afterMeal}
                            onChange={(e) => updateMedicationMeal(index, 'afterMeal', e.target.checked)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>After</span>
                        </label>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          style={styles.removeButtonSmall}
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div style={styles.section}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes or instructions"
              rows={3}
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Creating Prescription...' : 'Create Prescription'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.cancelButton}
          >
            Cancel
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
  pageTitle: {
    fontSize: '1.25rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
  },
  headerRight: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
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
    flexWrap: 'wrap' as const,
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
  diagnosisBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fde68a',
    fontSize: '0.875rem',
    color: '#92400e',
    fontWeight: '500' as const,
    flex: '1',
    maxWidth: '500px',
  },
  compactFieldInline: {
    flex: '1',
    maxWidth: '500px',
  },
  inlineDiagnosisInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
  },
  dot: {
    color: '#cbd5e0',
  },
  medicationsSection: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    marginBottom: '1rem',
    border: '2px solid rgb(59, 130, 246)',
  },
  medicationsTitle: {
    fontSize: '1.25rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: '1.25rem',
    border: '1px solid #e2e8f0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  formGroup: {
    marginBottom: '1rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontSize: '0.875rem',
    color: '#475569',
  },
  required: {
    color: '#dc2626',
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
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    transition: 'all 0.2s ease',
  },
  patientInfo: {
    marginTop: '0.75rem',
    marginBottom: '1rem',
    padding: '0.875rem 1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  // Table styles for modern ERP layout
  tableContainer: {
    overflowX: 'auto' as const,
    marginTop: '1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate' as const,
    borderSpacing: '0',
    fontSize: '0.875rem',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  tableHeader: {
    padding: '0.875rem 1rem',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: '#475569',
    fontSize: '0.8125rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    borderRight: '1px solid #f1f5f9',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '0.75rem 1rem',
    borderRight: '1px solid #f1f5f9',
    verticalAlign: 'middle' as const,
  },
  tableInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    color: '#475569',
    transition: 'color 0.15s ease',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#059669',
  },
  checkboxText: {
    fontSize: '0.8125rem',
    color: '#475569',
    fontWeight: '500',
  },
  timingSubHeader: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '0.375rem',
    fontSize: '0.6875rem',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  removeButtonSmall: {
    width: '32px',
    height: '32px',
    padding: '0',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  submitButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  cancelButton: {
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};

export default PrescriptionNew;
