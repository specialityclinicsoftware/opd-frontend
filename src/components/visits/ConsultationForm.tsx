import type { VisitFormData } from '../../types';
import PreConsultationForm from './PreConsultationForm';

interface ConsultationFormProps {
  formData: VisitFormData;
  onFormDataChange: (formData: VisitFormData) => void;
  showPreConsultationData?: boolean;
  allowEditPreConsultationData?: boolean;
}

const ConsultationForm = ({
  formData,
  onFormDataChange,
  showPreConsultationData = true,
  allowEditPreConsultationData = false,
}: ConsultationFormProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      onFormDataChange({
        ...formData,
        [parent]: {
          ...((formData as any)[parent] || {}),
          [child]: type === 'number' ? Number(value) : value,
        },
      });
    } else {
      onFormDataChange({
        ...formData,
        [name]: type === 'number' ? Number(value) : value,
      });
    }
  };

  return (
    <div>
      {/* Pre-Consultation Data (Read-Only or Editable) */}
      {showPreConsultationData && (
        <div style={styles.preConsultationSection}>
          <div style={styles.preConsultationHeader}>
            <h2 style={styles.preConsultationTitle}>Pre-Consultation Data (Nurse Entry)</h2>
            {allowEditPreConsultationData && (
              <span style={styles.editableBadge}>Editable</span>
            )}
          </div>
          <PreConsultationForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            readOnly={!allowEditPreConsultationData}
          />
        </div>
      )}

      {/* Systemic Examination Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Systemic Examination
        </h2>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>CVS (Cardiovascular)</label>
            <textarea
              name="systemicExamination.cvs"
              value={formData.systemicExamination?.cvs || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter cardiovascular examination findings..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>RS (Respiratory)</label>
            <textarea
              name="systemicExamination.rs"
              value={formData.systemicExamination?.rs || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter respiratory examination findings..."
            />
          </div>
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>PA (Per Abdomen)</label>
            <textarea
              name="systemicExamination.pa"
              value={formData.systemicExamination?.pa || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter abdominal examination findings..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>CNS (Central Nervous System)</label>
            <textarea
              name="systemicExamination.cns"
              value={formData.systemicExamination?.cns || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter CNS examination findings..."
            />
          </div>
        </div>
      </div>

      {/* Assessment & Plan Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Assessment & Plan
        </h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis || ''}
            onChange={handleChange}
            rows={2}
            style={styles.textarea}
            placeholder="Enter diagnosis..."
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment || ''}
            onChange={handleChange}
            rows={2}
            style={styles.textarea}
            placeholder="Enter treatment plan..."
          />
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Investigation</label>
            <textarea
              name="investigation"
              value={formData.investigation || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter investigation recommendations..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Advice</label>
            <textarea
              name="advice"
              value={formData.advice || ''}
              onChange={handleChange}
              rows={2}
              style={styles.textarea}
              placeholder="Enter advice for patient..."
            />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Review Date</label>
          <input
            type="date"
            name="reviewDate"
            value={formData.reviewDate instanceof Date ? formData.reviewDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onFormDataChange({ ...formData, reviewDate: new Date(e.target.value) })}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  preConsultationSection: {
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f8fafc',
  },
  preConsultationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  preConsultationTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#2d3748',
  },
  editableBadge: {
    backgroundColor: '#48bb78',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
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
};

export default ConsultationForm;
