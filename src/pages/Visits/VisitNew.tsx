import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { visitService, patientService } from '../../services';
import type { Patient, VisitFormData, BloodInvestigation } from '../../types';

const VisitNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  });

  useEffect(() => {
    loadPatients();
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

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data || []);
    } catch (err) {
      console.error('Load patients error:', err);
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patientId });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev as any)[parent] || {}),
          [child]: subChild
            ? { ...((prev as any)[parent]?.[child] || {}), [subChild]: type === 'number' ? Number(value) : value }
            : type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      });
    }
  };

  const addBloodTest = () => {
    setFormData({
      ...formData,
      bloodInvestigations: [
        ...(formData.bloodInvestigations || []),
        { testName: '', value: '', unit: '', referenceRange: '', testDate: new Date() },
      ],
    });
  };

  const removeBloodTest = (index: number) => {
    const investigations = [...(formData.bloodInvestigations || [])];
    investigations.splice(index, 1);
    setFormData({ ...formData, bloodInvestigations: investigations });
  };

  const updateBloodTest = (index: number, field: keyof BloodInvestigation, value: any) => {
    const investigations = [...(formData.bloodInvestigations || [])];
    investigations[index] = { ...investigations[index], [field]: value };
    setFormData({ ...formData, bloodInvestigations: investigations });
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
      await visitService.create(formData);
      alert('Visit created successfully!');
      navigate(`/patients/${formData.patientId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create visit');
      console.error('Create visit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Compact Header */}
        <div style={styles.compactHeader}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <h1 style={styles.compactTitle}>New Visit Entry</h1>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  style={styles.compactSelect}
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
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
              <div style={styles.compactField}>
                <label style={styles.compactLabel}>Consulting Doctor *</label>
                <input
                  type="text"
                  name="consultingDoctor"
                  value={formData.consultingDoctor}
                  onChange={handleChange}
                  placeholder="Doctor name"
                  style={styles.compactInput}
                  required
                />
              </div>
            </div>
          </div>
          {selectedPatient && (
            <div style={styles.patientBadge}>
              <span style={styles.badgeLabel}>Patient Info:</span>
              <span style={styles.badgeValue}>{selectedPatient.name}</span>
              <span style={styles.badgeSeparator}>|</span>
              <span style={styles.badgeValue}>Age: {selectedPatient.age || 'N/A'}</span>
              <span style={styles.badgeSeparator}>|</span>
              <span style={styles.badgeValue}>Gender: {selectedPatient.gender}</span>
            </div>
          )}
        </div>

        {/* Vitals - Compact */}
        <div style={styles.compactSection}>
          <h3 style={styles.compactSectionTitle}>Vitals</h3>
          <div style={styles.inlineFormRow}>
            <div style={styles.inlineFormGroup}>
              <label style={styles.inlineLabel}>Pulse</label>
              <input
                type="number"
                name="vitals.pulseRate"
                value={formData.vitals?.pulseRate || ''}
                onChange={handleChange}
                placeholder="72"
                style={styles.smallInput}
              />
            </div>
            <div style={styles.inlineFormGroup}>
              <label style={styles.inlineLabel}>SpO2</label>
              <input
                type="number"
                name="vitals.spO2"
                value={formData.vitals?.spO2 || ''}
                onChange={handleChange}
                placeholder="98"
                style={styles.smallInput}
              />
            </div>
            <div style={styles.inlineFormGroup}>
              <label style={styles.inlineLabel}>Temp</label>
              <input
                type="number"
                step="0.1"
                name="vitals.temperature"
                value={formData.vitals?.temperature || ''}
                onChange={handleChange}
                placeholder="98.6"
                style={styles.smallInput}
              />
            </div>
            <div style={styles.inlineFormGroup}>
              <label style={styles.inlineLabel}>BP (S/D)</label>
              <div style={styles.bpGroup}>
                <input
                  type="number"
                  name="vitals.bloodPressure.systolic"
                  value={formData.vitals?.bloodPressure?.systolic || ''}
                  onChange={handleChange}
                  placeholder="120"
                  style={styles.bpInput}
                />
                <span style={styles.bpSeparator}>/</span>
                <input
                  type="number"
                  name="vitals.bloodPressure.diastolic"
                  value={formData.vitals?.bloodPressure?.diastolic || ''}
                  onChange={handleChange}
                  placeholder="80"
                  style={styles.bpInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* History - Compact */}
        <div style={styles.compactSection}>
          <h3 style={styles.compactSectionTitle}>History</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Chief Complaints</label>
            <textarea
              name="chiefComplaints"
              value={formData.chiefComplaints}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
            />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Past</label>
              <textarea
                name="pastHistory"
                value={formData.pastHistory}
                onChange={handleChange}
                rows={1}
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Family</label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                rows={1}
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Marital</label>
              <textarea
                name="maritalHistory"
                value={formData.maritalHistory}
                onChange={handleChange}
                rows={1}
                style={styles.textarea}
              />
            </div>
          </div>
        </div>

        {/* General & Systemic Examination - Combined Compact */}
        <div style={styles.compactSection}>
          <h3 style={styles.compactSectionTitle}>General Examination</h3>
          <div style={styles.compactCheckboxGroup}>
            <label style={styles.compactCheckboxLabel}>
              <input
                type="checkbox"
                name="generalExamination.pallor"
                checked={formData.generalExamination?.pallor || false}
                onChange={handleChange}
              />
              Pallor
            </label>
            <label style={styles.compactCheckboxLabel}>
              <input
                type="checkbox"
                name="generalExamination.icterus"
                checked={formData.generalExamination?.icterus || false}
                onChange={handleChange}
              />
              Icterus
            </label>
            <label style={styles.compactCheckboxLabel}>
              <input
                type="checkbox"
                name="generalExamination.clubbing"
                checked={formData.generalExamination?.clubbing || false}
                onChange={handleChange}
              />
              Clubbing
            </label>
            <label style={styles.compactCheckboxLabel}>
              <input
                type="checkbox"
                name="generalExamination.cyanosis"
                checked={formData.generalExamination?.cyanosis || false}
                onChange={handleChange}
              />
              Cyanosis
            </label>
            <label style={styles.compactCheckboxLabel}>
              <input
                type="checkbox"
                name="generalExamination.lymphadenopathy"
                checked={formData.generalExamination?.lymphadenopathy || false}
                onChange={handleChange}
              />
              Lymphadenopathy
            </label>
          </div>

          <h3 style={{...styles.compactSectionTitle, marginTop: '1rem', marginBottom: '0.5rem'}}>Systemic Examination</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>CVS</label>
              <input
                type="text"
                name="systemicExamination.cvs"
                value={formData.systemicExamination?.cvs || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="S1S2 N"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>RS</label>
              <input
                type="text"
                name="systemicExamination.rs"
                value={formData.systemicExamination?.rs || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="NVBS B/L"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>PA</label>
              <input
                type="text"
                name="systemicExamination.pa"
                value={formData.systemicExamination?.pa || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="Soft NT"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CNS</label>
              <input
                type="text"
                name="systemicExamination.cns"
                value={formData.systemicExamination?.cns || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="NAD"
              />
            </div>
          </div>
        </div>

        {/* Assessment & Plan - Prominent Section */}
        <div style={styles.prominentSection}>
          <h2 style={styles.prominentSectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Assessment & Plan
          </h2>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={3}
                style={styles.prominentTextarea}
                placeholder="Diagnosis..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Treatment</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                rows={3}
                style={styles.prominentTextarea}
                placeholder="Treatment plan..."
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Investigation</label>
              <textarea
                name="investigation"
                value={formData.investigation}
                onChange={handleChange}
                rows={3}
                style={styles.prominentTextarea}
                placeholder="Investigation recommendations..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Advice</label>
              <textarea
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                rows={3}
                style={styles.prominentTextarea}
                placeholder="Advice for patient..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Review Date</label>
              <input
                type="date"
                name="reviewDate"
                value={formData.reviewDate instanceof Date ? formData.reviewDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, reviewDate: new Date(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Blood Investigations - Compact */}
        <div style={styles.compactSection}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
            <h3 style={styles.compactSectionTitle}>Blood Investigations</h3>
            <button type="button" onClick={addBloodTest} style={styles.addButtonSmall}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>
          {formData.bloodInvestigations?.map((test, index) => (
            <div key={index} style={styles.compactBloodTestCard}>
              <div style={styles.compactBloodTestHeader}>
                <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b'}}>#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeBloodTest(index)}
                  style={styles.removeButtonSmall}
                >
                  ×
                </button>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr', gap: '0.5rem', alignItems: 'flex-end'}}>
                <div style={styles.inlineFormGroup}>
                  <label style={styles.inlineLabel}>Test Name</label>
                  <input
                    type="text"
                    value={test.testName}
                    onChange={(e) => updateBloodTest(index, 'testName', e.target.value)}
                    style={styles.smallInput}
                    placeholder="e.g., CBC"
                  />
                </div>
                <div style={styles.inlineFormGroup}>
                  <label style={styles.inlineLabel}>Value</label>
                  <input
                    type="text"
                    value={test.value}
                    onChange={(e) => updateBloodTest(index, 'value', e.target.value)}
                    style={styles.smallInput}
                    placeholder="10.5"
                  />
                </div>
                <div style={styles.inlineFormGroup}>
                  <label style={styles.inlineLabel}>Unit</label>
                  <input
                    type="text"
                    value={test.unit}
                    onChange={(e) => updateBloodTest(index, 'unit', e.target.value)}
                    style={styles.smallInput}
                    placeholder="g/dL"
                  />
                </div>
                <div style={styles.inlineFormGroup}>
                  <label style={styles.inlineLabel}>Ref Range</label>
                  <input
                    type="text"
                    value={test.referenceRange}
                    onChange={(e) => updateBloodTest(index, 'referenceRange', e.target.value)}
                    style={styles.smallInput}
                    placeholder="12-16"
                  />
                </div>
                <div style={styles.inlineFormGroup}>
                  <label style={styles.inlineLabel}>Date</label>
                  <input
                    type="date"
                    value={test.testDate instanceof Date ? test.testDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateBloodTest(index, 'testDate', new Date(e.target.value))}
                    style={styles.smallInput}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

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
                Creating Visit...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Create Visit Record
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
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  compactHeader: {
    backgroundColor: 'white',
    padding: '0.875rem 1.25rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '0.75rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  compactTitle: {
    fontSize: '1.5rem',
    margin: 0,
    color: '#2c3e50',
    fontWeight: '600' as const,
  },
  compactField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  compactLabel: {
    fontSize: '0.75rem',
    fontWeight: '500' as const,
    color: '#64748b',
  },
  compactInput: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    minWidth: '150px',
  },
  compactSelect: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    minWidth: '200px',
    cursor: 'pointer',
  },
  patientBadge: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#1e40af',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  badgeLabel: {
    fontWeight: '600' as const,
  },
  badgeValue: {
    fontWeight: '400' as const,
  },
  badgeSeparator: {
    color: '#93c5fd',
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
  compactSection: {
    backgroundColor: 'white',
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  prominentSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
    marginBottom: '1rem',
    border: '2px solid rgb(59, 130, 246)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
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
  compactSectionTitle: {
    fontSize: '0.875rem',
    margin: 0,
    marginBottom: '0.625rem',
    color: '#475569',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  prominentSectionTitle: {
    fontSize: '1.125rem',
    margin: 0,
    marginBottom: '1.25rem',
    color: 'rgb(59, 130, 246)',
    fontWeight: '600' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid rgb(59, 130, 246)',
    letterSpacing: '-0.025em',
  },
  formGroup: {
    marginBottom: '1rem',
    flex: 1,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  inlineFormRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
  },
  inlineFormGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    minWidth: '100px',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500' as const,
    fontSize: '0.875rem',
    color: '#475569',
  },
  inlineLabel: {
    fontSize: '0.75rem',
    fontWeight: '500' as const,
    color: '#64748b',
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
  smallInput: {
    padding: '0.5rem 0.625rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    width: '100%',
    minWidth: '80px',
  },
  bpGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  bpInput: {
    padding: '0.5rem 0.625rem',
    fontSize: '0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    width: '70px',
  },
  bpSeparator: {
    color: '#94a3b8',
    fontWeight: '600' as const,
    fontSize: '1rem',
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
    backgroundColor: '#ffffff',
    color: '#1e293b',
    lineHeight: '1.5',
  },
  prominentTextarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    border: '1px solid rgb(59, 130, 246)',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    lineHeight: '1.5',
    minHeight: '90px',
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#475569',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    fontWeight: '500' as const,
  },
  compactCheckboxGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginBottom: '0.5rem',
  },
  compactCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#475569',
    cursor: 'pointer',
    fontWeight: '500' as const,
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  addButtonSmall: {
    padding: '0.375rem 0.75rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)',
  },
  bloodTestCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s ease',
  },
  bloodTestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontWeight: '600' as const,
    color: '#1e293b',
    fontSize: '0.875rem',
  },
  compactBloodTestCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.625rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8fafc',
  },
  compactBloodTestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  removeButton: {
    padding: '0.625rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  removeButtonSmall: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.25rem',
    fontWeight: '700' as const,
    lineHeight: '1',
    transition: 'all 0.2s ease',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSection: {
    position: 'sticky' as const,
    bottom: '0',
    marginTop: '0.75rem',
    marginBottom: '0',
    padding: '0.875rem 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  submitButton: {
    width: '100%',
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
    fontSize: '0.9375rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
  },
};

export default VisitNew;
