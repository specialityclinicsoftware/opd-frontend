import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { medicationService, patientService, visitService } from '../../services';
import { Patient, Visit, Medication, MedicationFormData } from '../../types';

const PrescriptionNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<MedicationFormData>({
    patientId: preselectedPatientId || '',
    visitId: '',
    prescribedDate: new Date(),
    consultingDoctor: '',
    diagnosis: '',
    medications: [
      {
        medicineName: '',
        dosage: '',
        frequency: 'OD',
        duration: '',
        route: 'Oral',
        instructions: '',
        timing: '',
      },
    ],
    notes: '',
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

  const handlePatientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patientId, visitId: '' });
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
    setFormData({ ...formData, [name]: value });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          medicineName: '',
          dosage: '',
          frequency: 'OD',
          duration: '',
          route: 'Oral',
          instructions: '',
          timing: '',
        },
      ],
    });
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length === 1) {
      alert('At least one medication is required');
      return;
    }
    const meds = [...formData.medications];
    meds.splice(index, 1);
    setFormData({ ...formData, medications: meds });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const meds = [...formData.medications];
    meds[index] = { ...meds[index], [field]: value };
    setFormData({ ...formData, medications: meds });
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prescription');
      console.error('Create prescription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>New Prescription</h1>

      <form onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Patient & Visit Selection */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Patient & Visit Information</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select Patient <span style={styles.required}>*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={handlePatientChange}
              style={styles.select}
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
          {selectedPatient && (
            <div style={styles.patientInfo}>
              <strong>Age:</strong> {selectedPatient.age || 'N/A'} |
              <strong> Gender:</strong> {selectedPatient.gender}
            </div>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select Visit <span style={styles.required}>*</span>
            </label>
            <select
              name="visitId"
              value={formData.visitId}
              onChange={handleChange}
              style={styles.select}
              required
              disabled={!formData.patientId}
            >
              <option value="">-- Select Visit --</option>
              {visits.map(visit => (
                <option key={visit._id} value={visit._id}>
                  {new Date(visit.visitDate).toLocaleDateString()} - Dr. {visit.consultingDoctor}
                  {visit.diagnosis && ` - ${visit.diagnosis}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prescription Details */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Prescription Details</h2>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prescribed Date</label>
              <input
                type="date"
                name="prescribedDate"
                value={formData.prescribedDate instanceof Date ? formData.prescribedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, prescribedDate: new Date(e.target.value) })}
                style={styles.input}
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
                onChange={handleChange}
                placeholder="Doctor name"
                style={styles.input}
                required
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis"
              rows={2}
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Medications */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Medications <span style={styles.required}>*</span>
            </h2>
            <button type="button" onClick={addMedication} style={styles.addButton}>
              + Add Medication
            </button>
          </div>
          {formData.medications.map((med, index) => (
            <div key={index} style={styles.medicationCard}>
              <div style={styles.medicationHeader}>
                <span style={styles.medicationNumber}>Medication {index + 1}</span>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Medicine Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={med.medicineName}
                    onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                    placeholder="e.g., Paracetamol"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency</label>
                  <select
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    style={styles.select}
                  >
                    <option value="OD">OD (Once daily)</option>
                    <option value="BD">BD (Twice daily)</option>
                    <option value="TDS">TDS (Three times daily)</option>
                    <option value="QID">QID (Four times daily)</option>
                    <option value="PRN">PRN (As needed)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Route</label>
                  <select
                    value={med.route}
                    onChange={(e) => updateMedication(index, 'route', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV">IV (Intravenous)</option>
                    <option value="IM">IM (Intramuscular)</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Timing</label>
                  <input
                    type="text"
                    value={med.timing || ''}
                    onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                    placeholder="e.g., Before meals"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Instructions</label>
                  <input
                    type="text"
                    value={med.instructions || ''}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    placeholder="Special instructions"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ))}
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#2c3e50',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    margin: 0,
    color: '#2c3e50',
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
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
  },
  required: {
    color: '#991b1b',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  patientInfo: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#166534',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  medicationCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fafafa',
  },
  medicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #ddd',
  },
  medicationNumber: {
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#2c3e50',
  },
  removeButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#991b1b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  submitButton: {
    flex: 1,
    padding: '1rem',
    fontSize: '1rem',
    backgroundColor: '#166534',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default PrescriptionNew;
