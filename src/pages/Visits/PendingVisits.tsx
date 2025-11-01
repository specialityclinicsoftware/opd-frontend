import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitService } from '../../services';
import type { Visit, Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Extended type for populated visit
interface PopulatedVisit extends Omit<Visit, 'patientId'> {
  patientId: string | Patient;
}

const PendingVisits = () => {
  const navigate = useNavigate();
  const { isDoctor, user } = useAuth();
  const [pendingVisits, setPendingVisits] = useState<PopulatedVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.hospitalId) {
      loadPendingVisits();
    }
  }, [user?.hospitalId]);

  const loadPendingVisits = async () => {
    if (!user?.hospitalId) {
      setError('Hospital ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await visitService.getPendingVisits(user.hospitalId);
      setPendingVisits(response.data as PopulatedVisit[]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Load pending visits error:', err);
      setError(error.response?.data?.message || 'Failed to load pending visits');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueVisit = (visitId: string) => {
    navigate(`/visits/workflow/${visitId}/consultation`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPatient = (visit: PopulatedVisit): Patient | null => {
    if (typeof visit.patientId === 'object' && visit.patientId !== null) {
      return visit.patientId as Patient;
    }
    return null;
  };

  // Allow both doctors and nurses to view pending visits
  // Nurses can view but not take action (handled in the action button visibility)

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <svg style={styles.spinner} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <p style={styles.loadingText}>Loading pending consultations...</p>
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
            {pendingVisits.length} {pendingVisits.length === 1 ? 'visit' : 'visits'} awaiting doctor review
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            Back
          </button>
          <button
            onClick={() => navigate('/visits/workflow/new/pre-consultation')}
            style={styles.primaryButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Visit
          </button>
        </div>
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
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>#</th>
                <th style={styles.tableHeader}>Patient</th>
                <th style={styles.tableHeader}>Age/Gender</th>
                <th style={styles.tableHeader}>Phone</th>
                <th style={styles.tableHeader}>Visit Date</th>
                <th style={styles.tableHeader}>Doctor</th>
                <th style={styles.tableHeader}>Chief Complaints</th>
                <th style={styles.tableHeader}>Vitals</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingVisits.map((visit, index) => {
                const patient = getPatient(visit);
                return (
                  <tr key={visit._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCellBold}>
                      {patient ? patient.name : 'Unknown'}
                    </td>
                    <td style={styles.tableCell}>
                      {patient ? `${patient.age || 'N/A'} / ${patient.gender}` : 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      {patient ? patient.phoneNumber : 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.dateCell}>
                        <span style={styles.dateText}>{formatDate(visit.visitDate)}</span>
                        <span style={styles.timeText}>{formatTime(visit.visitDate)}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>{visit.consultingDoctor}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.complaintsCell}>
                        {visit.chiefComplaints || <span style={styles.emptyValue}>-</span>}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      {visit.vitals ? (
                        <div style={styles.vitalsCell}>
                          {visit.vitals.pulseRate && (
                            <span style={styles.vitalChip}>
                              PR: {visit.vitals.pulseRate}
                            </span>
                          )}
                          {visit.vitals.bloodPressure && (
                            <span style={styles.vitalChip}>
                              BP: {visit.vitals.bloodPressure.systolic}/{visit.vitals.bloodPressure.diastolic}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={styles.emptyValue}>-</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.statusBadge}>Pending</span>
                    </td>
                    <td style={styles.tableCell}>
                      {isDoctor ? (
                        <button
                          onClick={() => handleContinueVisit(visit._id)}
                          style={styles.actionButton}
                          title="Continue consultation"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          Continue
                        </button>
                      ) : (
                        <span style={styles.viewOnlyBadge}>View Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '1.75rem',
    margin: 0,
    marginBottom: '0.25rem',
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.9375rem',
    margin: 0,
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  backButton: {
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
  primaryButton: {
    display: 'flex',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  spinner: {
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    margin: 0,
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
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    margin: '1rem 0 0.5rem',
    color: '#1e293b',
    fontWeight: '600' as const,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    margin: 0,
    textAlign: 'center' as const,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  },
  tableHeader: {
    padding: '0.875rem 1rem',
    textAlign: 'left' as const,
    fontWeight: '600' as const,
    fontSize: '0.75rem',
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  },
  tableCell: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.875rem',
  },
  tableCellBold: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#1e293b',
    fontSize: '0.875rem',
    fontWeight: '600' as const,
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.125rem',
  },
  dateText: {
    color: '#1e293b',
    fontSize: '0.875rem',
  },
  timeText: {
    color: '#64748b',
    fontSize: '0.75rem',
  },
  complaintsCell: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  vitalsCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  vitalChip: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#f0fdf4',
    color: '#065f46',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500' as const,
    border: '1px solid #d1fae5',
    whiteSpace: 'nowrap' as const,
  },
  emptyValue: {
    color: '#cbd5e0',
    fontStyle: 'italic' as const,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  viewOnlyBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    border: '1px solid #e2e8f0',
  },
};

export default PendingVisits;
