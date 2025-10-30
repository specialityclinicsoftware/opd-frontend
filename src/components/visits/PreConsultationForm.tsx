import type { VisitFormData, BloodInvestigation } from '../../types';

interface PreConsultationFormProps {
  formData: VisitFormData;
  onFormDataChange: (formData: VisitFormData) => void;
  readOnly?: boolean;
}

const PreConsultationForm = ({ formData, onFormDataChange, readOnly = false }: PreConsultationFormProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (readOnly) return;

    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      onFormDataChange({
        ...formData,
        [parent]: {
          ...((formData as any)[parent] || {}),
          [child]: subChild
            ? { ...((formData as any)[parent]?.[child] || {}), [subChild]: type === 'number' ? Number(value) : value }
            : type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        },
      });
    } else {
      onFormDataChange({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      });
    }
  };

  const addBloodTest = () => {
    if (readOnly) return;
    onFormDataChange({
      ...formData,
      bloodInvestigations: [
        ...(formData.bloodInvestigations || []),
        { testName: '', value: '', unit: '', referenceRange: '', testDate: new Date() },
      ],
    });
  };

  const removeBloodTest = (index: number) => {
    if (readOnly) return;
    const updated = [...(formData.bloodInvestigations || [])];
    updated.splice(index, 1);
    onFormDataChange({
      ...formData,
      bloodInvestigations: updated,
    });
  };

  const updateBloodTest = (index: number, field: keyof BloodInvestigation, value: any) => {
    if (readOnly) return;
    const updated = [...(formData.bloodInvestigations || [])];
    updated[index] = { ...updated[index], [field]: value };
    onFormDataChange({
      ...formData,
      bloodInvestigations: updated,
    });
  };

  return (
    <div>
      {/* Vitals Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Vitals
        </h2>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Pulse Rate (bpm)</label>
            <input
              type="number"
              name="vitals.pulseRate"
              value={formData.vitals?.pulseRate || ''}
              onChange={handleChange}
              placeholder="e.g., 72"
              style={styles.input}
              disabled={readOnly}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>SpO2 (%)</label>
            <input
              type="number"
              name="vitals.spO2"
              value={formData.vitals?.spO2 || ''}
              onChange={handleChange}
              placeholder="e.g., 98"
              style={styles.input}
              disabled={readOnly}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              name="vitals.temperature"
              value={formData.vitals?.temperature || ''}
              onChange={handleChange}
              placeholder="e.g., 98.6"
              style={styles.input}
              disabled={readOnly}
            />
          </div>
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Pressure - Systolic</label>
            <input
              type="number"
              name="vitals.bloodPressure.systolic"
              value={formData.vitals?.bloodPressure?.systolic || ''}
              onChange={handleChange}
              placeholder="e.g., 120"
              style={styles.input}
              disabled={readOnly}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Pressure - Diastolic</label>
            <input
              type="number"
              name="vitals.bloodPressure.diastolic"
              value={formData.vitals?.bloodPressure?.diastolic || ''}
              onChange={handleChange}
              placeholder="e.g., 80"
              style={styles.input}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* History Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          History
        </h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Chief Complaints</label>
          <textarea
            name="chiefComplaints"
            value={formData.chiefComplaints || ''}
            onChange={handleChange}
            rows={3}
            style={styles.textarea}
            disabled={readOnly}
          />
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Past History</label>
            <textarea
              name="pastHistory"
              value={formData.pastHistory || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              disabled={readOnly}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Family History</label>
            <textarea
              name="familyHistory"
              value={formData.familyHistory || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              disabled={readOnly}
            />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Marital History</label>
          <textarea
            name="maritalHistory"
            value={formData.maritalHistory || ''}
            onChange={handleChange}
            rows={2}
            style={styles.textarea}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* General Examination Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          General Examination
        </h2>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="generalExamination.pallor"
              checked={formData.generalExamination?.pallor || false}
              onChange={handleChange}
              disabled={readOnly}
            />
            Pallor
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="generalExamination.icterus"
              checked={formData.generalExamination?.icterus || false}
              onChange={handleChange}
              disabled={readOnly}
            />
            Icterus
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="generalExamination.clubbing"
              checked={formData.generalExamination?.clubbing || false}
              onChange={handleChange}
              disabled={readOnly}
            />
            Clubbing
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="generalExamination.cyanosis"
              checked={formData.generalExamination?.cyanosis || false}
              onChange={handleChange}
              disabled={readOnly}
            />
            Cyanosis
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="generalExamination.lymphadenopathy"
              checked={formData.generalExamination?.lymphadenopathy || false}
              onChange={handleChange}
              disabled={readOnly}
            />
            Lymphadenopathy
          </label>
        </div>
      </div>

      {/* Blood Investigations Section */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Blood Investigations
          </h2>
          {!readOnly && (
            <button type="button" onClick={addBloodTest} style={styles.addButton}>
              + Add Test
            </button>
          )}
        </div>
        {formData.bloodInvestigations?.map((test, index) => (
          <div key={index} style={{ ...styles.bloodTestGroup, marginBottom: '15px' }}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Test Name</label>
                <input
                  type="text"
                  value={test.testName}
                  onChange={(e) => updateBloodTest(index, 'testName', e.target.value)}
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Value</label>
                <input
                  type="text"
                  value={test.value}
                  onChange={(e) => updateBloodTest(index, 'value', e.target.value)}
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Unit</label>
                <input
                  type="text"
                  value={test.unit}
                  onChange={(e) => updateBloodTest(index, 'unit', e.target.value)}
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reference Range</label>
                <input
                  type="text"
                  value={test.referenceRange}
                  onChange={(e) => updateBloodTest(index, 'referenceRange', e.target.value)}
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Test Date</label>
                <input
                  type="date"
                  value={test.testDate instanceof Date ? test.testDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateBloodTest(index, 'testDate', new Date(e.target.value))}
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => removeBloodTest(index)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline styles (matching VisitNew.tsx structure)
const styles = {
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1a1a1a',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    marginBottom: '5px',
    color: '#4a5568',
  },
  input: {
    padding: '10px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    backgroundColor: '#fff',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '15px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#4a5568',
    cursor: 'pointer',
  },
  addButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: 'pointer',
  },
  removeButton: {
    backgroundColor: '#f56565',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  bloodTestGroup: {
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
};

export default PreConsultationForm;
