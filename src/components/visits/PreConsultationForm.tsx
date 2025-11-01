import type { VisitFormData, BloodInvestigation } from '../../types';

interface PreConsultationFormProps {
  formData: VisitFormData;
  onFormDataChange: (formData: VisitFormData) => void;
  readOnly?: boolean;
}

const PreConsultationForm = ({
  formData,
  onFormDataChange,
  readOnly = false,
}: PreConsultationFormProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
            ? {
                ...((formData as any)[parent]?.[child] || {}),
                [subChild]: type === 'number' ? Number(value) : value,
              }
            : type === 'checkbox'
              ? checked
              : type === 'number'
                ? Number(value)
                : value,
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
      {/* Vitals & General Examination - Compact Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Vitals & General Examination
        </h2>

        {/* Vitals in Compact Grid */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>BP (mmHg)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                name="vitals.bloodPressure.systolic"
                value={formData.vitals?.bloodPressure?.systolic || ''}
                onChange={handleChange}
                placeholder="120"
                style={styles.inputSmall}
                disabled={readOnly}
              />
              <span style={{ color: '#94a3b8' }}>/</span>
              <input
                type="number"
                name="vitals.bloodPressure.diastolic"
                value={formData.vitals?.bloodPressure?.diastolic || ''}
                onChange={handleChange}
                placeholder="80"
                style={styles.inputSmall}
                disabled={readOnly}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Pulse (bpm)</label>
            <input
              type="number"
              name="vitals.pulseRate"
              value={formData.vitals?.pulseRate || ''}
              onChange={handleChange}
              placeholder="72"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Temp (°F)</label>
            <input
              type="number"
              step="0.1"
              name="vitals.temperature"
              value={formData.vitals?.temperature || ''}
              onChange={handleChange}
              placeholder="98.6"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>SpO₂ (%)</label>
            <input
              type="number"
              name="vitals.spO2"
              value={formData.vitals?.spO2 || ''}
              onChange={handleChange}
              placeholder="98"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>RR (bpm)</label>
            <input
              type="number"
              name="vitals.respiratoryRate"
              value={formData.vitals?.respiratoryRate || ''}
              onChange={handleChange}
              placeholder="16"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="vitals.weight"
              value={formData.vitals?.weight || ''}
              onChange={handleChange}
              placeholder="70"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              step="0.1"
              name="vitals.height"
              value={formData.vitals?.height || ''}
              onChange={handleChange}
              placeholder="170"
              style={styles.input}
              disabled={readOnly}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>BMI</label>
            <div style={styles.bmiDisplay}>
              {formData.vitals?.weight && formData.vitals?.height
                ? (formData.vitals.weight / Math.pow(formData.vitals.height / 100, 2)).toFixed(1)
                : '—'}
            </div>
          </div>
        </div>

        {/* General Examination Checkboxes */}
        <div style={styles.checkboxSection}>
          <label style={styles.checkboxLabel}>General Exam:</label>
          <div style={styles.checkboxRow}>
            {[
              { name: 'pallor', label: 'Pallor' },
              { name: 'icterus', label: 'Icterus' },
              { name: 'clubbing', label: 'Clubbing' },
              { name: 'cyanosis', label: 'Cyanosis' },
              { name: 'lymphadenopathy', label: 'Lymphadenopathy' },
              { name: 'edema', label: 'Edema' },
            ].map(item => (
              <label key={item.name} style={styles.checkbox}>
                <input
                  type="checkbox"
                  name={`generalExamination.${item.name}`}
                  checked={(formData.generalExamination as any)?.[item.name] || false}
                  onChange={handleChange}
                  disabled={readOnly}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chief Complaints & Medical History - Combined Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Chief Complaints & History
        </h2>

        <div style={styles.formRow}>
          {/* Chief Complaints */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Chief Complaints <span style={styles.required}>*</span>
            </label>
            <textarea
              name="chiefComplaints"
              value={formData.chiefComplaints || ''}
              onChange={handleChange}
              placeholder="Main symptoms and complaints..."
              style={styles.textarea}
              rows={2}
              disabled={readOnly}
              required
            />
          </div>

          {/* Past History */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Past History</label>
            <textarea
              name="pastHistory"
              value={formData.pastHistory || ''}
              onChange={handleChange}
              placeholder="Previous illnesses, surgeries..."
              style={styles.textarea}
              rows={2}
              disabled={readOnly}
            />
          </div>

          {/* Family History */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Family History</label>
            <textarea
              name="familyHistory"
              value={formData.familyHistory || ''}
              onChange={handleChange}
              placeholder="Hereditary conditions..."
              style={styles.textarea}
              rows={2}
              disabled={readOnly}
            />
          </div>

          {/* Personal & Social History */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Personal & Social History</label>
            <textarea
              name="maritalHistory"
              value={formData.maritalHistory || ''}
              onChange={handleChange}
              placeholder="Marital status, occupation, habits..."
              style={styles.textarea}
              rows={2}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Blood Investigations */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Blood Investigations
          </h2>
          {!readOnly && (
            <button type="button" onClick={addBloodTest} style={styles.addButton}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Test
            </button>
          )}
        </div>

        {!formData.bloodInvestigations || formData.bloodInvestigations.length === 0 ? (
          <div style={styles.emptyState}>No blood investigations added</div>
        ) : (
          <div style={styles.testsContainer}>
            {formData.bloodInvestigations?.map((test, index) => (
              <div key={index} style={styles.testRow}>
                <div style={styles.testNumber}>#{index + 1}</div>
                <div style={styles.testFields}>
                  <input
                    type="text"
                    value={test.testName}
                    onChange={e => updateBloodTest(index, 'testName', e.target.value)}
                    placeholder="Test Name"
                    style={styles.input}
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    value={test.value}
                    onChange={e => updateBloodTest(index, 'value', e.target.value)}
                    placeholder="Value"
                    style={styles.inputSmall}
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    value={test.unit}
                    onChange={e => updateBloodTest(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    style={styles.inputSmall}
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    value={test.referenceRange}
                    onChange={e => updateBloodTest(index, 'referenceRange', e.target.value)}
                    placeholder="Range"
                    style={styles.input}
                    disabled={readOnly}
                  />
                  <input
                    type="date"
                    value={
                      test.testDate instanceof Date ? test.testDate.toISOString().split('T')[0] : ''
                    }
                    onChange={e => updateBloodTest(index, 'testDate', new Date(e.target.value))}
                    style={styles.inputSmall}
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeBloodTest(index)}
                    style={styles.removeButton}
                    title="Remove"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact professional styles matching ConsultationForm
const styles = {
  section: {
    backgroundColor: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    margin: 0,
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#1e293b',
    letterSpacing: '-0.025em',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#475569',
  },
  required: {
    color: '#dc2626',
    fontWeight: '600' as const,
  },
  input: {
    padding: '0.625rem 0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    color: '#1e293b',
  },
  inputSmall: {
    padding: '0.625rem 0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    color: '#1e293b',
    flex: 1,
  },
  textarea: {
    padding: '0.625rem 0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    backgroundColor: '#fff',
    lineHeight: '1.5',
    transition: 'all 0.2s ease',
    color: '#1e293b',
  },
  bmiDisplay: {
    padding: '0.625rem 0.875rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    color: '#3b82f6',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  checkboxSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0',
    marginTop: '0.75rem',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#475569',
    whiteSpace: 'nowrap' as const,
  },
  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    flex: 1,
  },
  checkbox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    color: '#475569',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    padding: '1.5rem',
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontStyle: 'italic' as const,
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  testsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  testRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  testNumber: {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    minWidth: '32px',
    textAlign: 'center' as const,
  },
  testFields: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
    flexWrap: 'wrap' as const,
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
};

export default PreConsultationForm;
