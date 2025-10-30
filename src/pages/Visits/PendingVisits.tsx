import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitService, patientService } from '../../services';
import { Visit, Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PendingVisits = () => {
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<{ [key: string]: Patient }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingVisits();
  }, []);

  const loadPendingVisits = async () => {
    try {
      setLoading(true);
      const response = await visitService.getPendingVisits();
      const visits = response.data || [];
      setPendingVisits(visits);

      // Load patient details for each visit
      const patientIds = [...new Set(visits.map(v => v.patientId))];
      const patientMap: { [key: string]: Patient } = {};

      await Promise.all(
        patientIds.map(async (id) => {
          try {
            const patientResponse = await patientService.getById(id);
            patientMap[id] = patientResponse.data;
          } catch (err) {
            console.error(`Failed to load patient ${id}:`, err);
          }
        })
      );

      setPatients(patientMap);
    } catch (err) {
      console.error('Load pending visits error:', err);
      setError('Failed to load pending visits');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueVisit = (visitId: string) => {
    navigate(`/visits/new-staged?visitId=${visitId}`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isDoctor) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Access Denied</h2>
          <p>Only doctors can view pending consultations.</p>
          <button onClick={() => navigate('/')} style={styles.button}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <svg style={styles.spinner} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <p>Loading pending consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Pending Consultations</h1>
          <p style={styles.subtitle}>
            Visits awaiting doctor review ({pendingVisits.length} pending)
          </p>
        </div>
        <button
          onClick={() => navigate('/visits/new-staged')}
          style={styles.newVisitButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Visit
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {pendingVisits.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={styles.emptyTitle}>No Pending Consultations</h3>
          <p style={styles.emptyText}>All visits have been completed or no nurse entries are waiting for review.</p>
        </div>
      ) : (
        <div style={styles.visitsList}>
          {pendingVisits.map((visit) => {
            const patient = patients[visit.patientId];
            return (
              <div key={visit._id} style={styles.visitCard}>
                <div style={styles.visitCardHeader}>
                  <div>
                    <h3 style={styles.patientName}>
                      {patient ? patient.name : 'Loading...'}
                    </h3>
                    <p style={styles.patientDetails}>
                      {patient && (
                        <>
                          {patient.age} years • {patient.gender} • {patient.phoneNumber}
                        </>
                      )}
                    </p>
                  </div>
                  <span style={styles.statusBadge}>Awaiting Review</span>
                </div>

                <div style={styles.visitCardBody}>
                  <div style={styles.visitInfoGrid}>
                    <div style={styles.visitInfoItem}>
                      <span style={styles.visitInfoLabel}>Visit Date:</span>
                      <span style={styles.visitInfoValue}>{formatDate(visit.visitDate)}</span>
                    </div>
                    <div style={styles.visitInfoItem}>
                      <span style={styles.visitInfoLabel}>Consulting Doctor:</span>
                      <span style={styles.visitInfoValue}>{visit.consultingDoctor}</span>
                    </div>
                    <div style={styles.visitInfoItem}>
                      <span style={styles.visitInfoLabel}>Entered By:</span>
                      <span style={styles.visitInfoValue}>
                        {visit.audit?.enteredBy?.nurseName || 'Unknown Nurse'}
                      </span>
                    </div>
                    <div style={styles.visitInfoItem}>
                      <span style={styles.visitInfoLabel}>Completed At:</span>
                      <span style={styles.visitInfoValue}>
                        {visit.audit?.timestamps?.nurseCompletedAt
                          ? formatDate(visit.audit.timestamps.nurseCompletedAt)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {visit.chiefComplaints && (
                    <div style={styles.complaintsSection}>
                      <strong style={styles.complaintsLabel}>Chief Complaints:</strong>
                      <p style={styles.complaintsText}>{visit.chiefComplaints}</p>
                    </div>
                  )}

                  {visit.vitals && (
                    <div style={styles.vitalsSection}>
                      <strong style={styles.vitalsLabel}>Vitals:</strong>
                      <div style={styles.vitalsGrid}>
                        {visit.vitals.pulseRate && (
                          <span style={styles.vitalItem}>
                            Pulse: {visit.vitals.pulseRate} bpm
                          </span>
                        )}
                        {visit.vitals.bloodPressure && (
                          <span style={styles.vitalItem}>
                            BP: {visit.vitals.bloodPressure.systolic}/{visit.vitals.bloodPressure.diastolic} mmHg
                          </span>
                        )}
                        {visit.vitals.spO2 && (
                          <span style={styles.vitalItem}>
                            SpO2: {visit.vitals.spO2}%
                          </span>
                        )}
                        {visit.vitals.temperature && (
                          <span style={styles.vitalItem}>
                            Temp: {visit.vitals.temperature}°F
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.visitCardFooter}>
                  <button
                    onClick={() => handleContinueVisit(visit._id)}
                    style={styles.continueButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Continue Consultation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
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
  newVisitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '1rem 1.25rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #fee2e2',
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
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600' as const,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b',
  },
  spinner: {
    marginBottom: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    margin: '1rem 0 0.5rem',
    color: '#0f172a',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0,
  },
  visitsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  visitCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  patientName: {
    fontSize: '1.25rem',
    margin: 0,
    marginBottom: '0.25rem',
    color: '#0f172a',
    fontWeight: '600' as const,
  },
  patientDetails: {
    fontSize: '0.9rem',
    margin: 0,
    color: '#64748b',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600' as const,
  },
  visitCardBody: {
    padding: '1.5rem',
  },
  visitInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  visitInfoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  visitInfoLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontWeight: '600' as const,
  },
  visitInfoValue: {
    fontSize: '0.95rem',
    color: '#0f172a',
    fontWeight: '500' as const,
  },
  complaintsSection: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#fef9f3',
    borderRadius: '8px',
    borderLeft: '4px solid #f59e0b',
  },
  complaintsLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#92400e',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  complaintsText: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#0f172a',
    lineHeight: '1.5',
  },
  vitalsSection: {
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    borderLeft: '4px solid #10b981',
  },
  vitalsLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#065f46',
    marginBottom: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  vitalsGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  vitalItem: {
    fontSize: '0.9rem',
    color: '#0f172a',
    padding: '0.375rem 0.75rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #d1fae5',
  },
  visitCardFooter: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  continueButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default PendingVisits;
