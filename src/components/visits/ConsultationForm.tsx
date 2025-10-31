import { useState } from 'react';
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
  const [isPreConsultationExpanded, setIsPreConsultationExpanded] = useState(false);

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

  // Compact summary for pre-consultation data
  const renderCompactPreConsultation = () => {
    const vitals = formData.vitals;
    const hasVitals = vitals?.pulseRate || vitals?.bloodPressure || vitals?.spO2 || vitals?.temperature;

    return (
      <div style={styles.compactSection}>
        <div style={styles.compactHeader}>
          <div style={styles.compactTitleRow}>
            <h3 style={styles.compactTitle}>Pre-Consultation Summary</h3>
            <button
              type="button"
              onClick={() => setIsPreConsultationExpanded(!isPreConsultationExpanded)}
              style={styles.toggleButton}
            >
              {isPreConsultationExpanded ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Collapse
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Expand Details
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compact View */}
        {!isPreConsultationExpanded && (
          <div style={styles.summaryGrid}>
            {/* Vitals Summary */}
            {hasVitals && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Vitals</div>
                <div style={styles.summaryValues}>
                  {vitals?.pulseRate && <span style={styles.vitalBadge}>PR: {vitals.pulseRate}</span>}
                  {vitals?.bloodPressure && (
                    <span style={styles.vitalBadge}>
                      BP: {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                    </span>
                  )}
                  {vitals?.spO2 && <span style={styles.vitalBadge}>SpO₂: {vitals.spO2}%</span>}
                  {vitals?.temperature && <span style={styles.vitalBadge}>Temp: {vitals.temperature}°F</span>}
                </div>
              </div>
            )}

            {/* Chief Complaints */}
            {formData.chiefComplaints && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Chief Complaints</div>
                <div style={styles.summaryText}>{formData.chiefComplaints}</div>
              </div>
            )}

            {/* History Summary */}
            {(formData.pastHistory || formData.familyHistory) && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>History</div>
                <div style={styles.summaryText}>
                  {formData.pastHistory && <div><strong>Past:</strong> {formData.pastHistory}</div>}
                  {formData.familyHistory && <div><strong>Family:</strong> {formData.familyHistory}</div>}
                </div>
              </div>
            )}

            {!hasVitals && !formData.chiefComplaints && !formData.pastHistory && !formData.familyHistory && (
              <div style={styles.emptyState}>No pre-consultation data available</div>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isPreConsultationExpanded && (
          <div style={styles.expandedContent}>
            <PreConsultationForm
              formData={formData}
              onFormDataChange={onFormDataChange}
              readOnly={!allowEditPreConsultationData}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Pre-Consultation Data - Compact & Collapsible */}
      {showPreConsultationData && renderCompactPreConsultation()}

      {/* Systemic Examination Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Systemic Examination
        </h2>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>CVS</label>
            <textarea
              name="systemicExamination.cvs"
              value={formData.systemicExamination?.cvs || ''}
              onChange={handleChange}
              rows={1}
              style={styles.textarea}
              placeholder="Cardiovascular findings..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>RS</label>
            <textarea
              name="systemicExamination.rs"
              value={formData.systemicExamination?.rs || ''}
              onChange={handleChange}
              rows={1}
              style={styles.textarea}
              placeholder="Respiratory findings..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>PA</label>
            <textarea
              name="systemicExamination.pa"
              value={formData.systemicExamination?.pa || ''}
              onChange={handleChange}
              rows={1}
              style={styles.textarea}
              placeholder="Abdominal findings..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>CNS</label>
            <textarea
              name="systemicExamination.cns"
              value={formData.systemicExamination?.cns || ''}
              onChange={handleChange}
              rows={1}
              style={styles.textarea}
              placeholder="CNS findings..."
            />
          </div>
        </div>
      </div>

      {/* Assessment & Plan Section - Prominent */}
      <div style={styles.assessmentSection}>
        <h2 style={styles.assessmentTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Assessment & Plan
        </h2>
        <div style={styles.assessmentGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis || ''}
              onChange={handleChange}
              rows={3}
              style={styles.assessmentTextarea}
              placeholder="Enter diagnosis..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Treatment</label>
            <textarea
              name="treatment"
              value={formData.treatment || ''}
              onChange={handleChange}
              rows={3}
              style={styles.assessmentTextarea}
              placeholder="Enter treatment plan..."
            />
          </div>
        </div>
        <div style={styles.assessmentGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Investigation</label>
            <textarea
              name="investigation"
              value={formData.investigation || ''}
              onChange={handleChange}
              rows={3}
              style={styles.assessmentTextarea}
              placeholder="Enter investigation recommendations..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Advice</label>
            <textarea
              name="advice"
              value={formData.advice || ''}
              onChange={handleChange}
              rows={3}
              style={styles.assessmentTextarea}
              placeholder="Enter advice for patient..."
            />
          </div>
        </div>
        <div style={styles.reviewDateRow}>
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
    </div>
  );
};

// Modern professional ERP-style inline styles
const styles = {
  compactSection: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  compactHeader: {
    marginBottom: '0.75rem',
  },
  compactTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600' as const,
    color: '#64748b',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '0.75rem',
  },
  summaryCard: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  summaryValues: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  vitalBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '600' as const,
    border: '1px solid #bfdbfe',
  },
  summaryText: {
    fontSize: '0.875rem',
    color: '#1e293b',
    lineHeight: '1.5',
  },
  emptyState: {
    padding: '1rem',
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontStyle: 'italic' as const,
  },
  expandedContent: {
    marginTop: '0.5rem',
  },
  section: {
    backgroundColor: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#1e293b',
    letterSpacing: '-0.025em',
  },
  assessmentSection: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    marginBottom: '1rem',
    border: '2px solid #3b82f6',
  },
  assessmentTitle: {
    fontSize: '1.125rem',
    fontWeight: '600' as const,
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#1e293b',
    letterSpacing: '-0.025em',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
  },
  assessmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  reviewDateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    maxWidth: '300px',
  },
  assessmentTextarea: {
    padding: '0.75rem 1rem',
    border: '1.5px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    backgroundColor: '#fff',
    lineHeight: '1.6',
    transition: 'all 0.2s ease',
    color: '#1e293b',
    minHeight: '90px',
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
  input: {
    padding: '0.625rem 0.875rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    color: '#1e293b',
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
};

export default ConsultationForm;
