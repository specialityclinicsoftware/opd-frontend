import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, visitService, medicationService } from '../../services';
import { useState } from 'react';
// Types for Patient, Visit, MedicationHistory are inferred from API responses

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await patientService.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch visits
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['visits', id],
    queryFn: async () => {
      const response = await visitService.getByPatient(id!);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!id,
  });

  // Fetch medications
  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ['medications', id],
    queryFn: async () => {
      const response = await medicationService.getByPatient(id!);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!id,
  });

  // Delete patient mutation
  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => patientService.delete(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      alert('Patient deleted successfully');
      navigate('/patients');
    },
    onError: () => {
      alert('Failed to delete patient');
    },
  });

  const loading = patientLoading || visitsLoading || medsLoading;

  const handleDelete = () => {
    if (!patient || !window.confirm(`Are you sure you want to delete patient ${patient.name}?`)) {
      return;
    }
    deleteMutation.mutate(patient._id);
  };

  if (loading) {
    return <div style={styles.loading}>Loading patient details...</div>;
  }

  if (!patient) {
    return <div style={styles.error}>Patient not found</div>;
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Header with actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link
            to="/patients"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              display: 'inline-block',
            }}
          >
            ← Back to Patients
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {patient.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/visits/workflow/new/pre-consultation?patientId=${patient._id}`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            + New Visit
          </Link>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Patient Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Phone
          </div>
          <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>
            {patient.phoneNumber}
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Age
          </div>
          <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>
            {patient.age || 'N/A'}
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Gender
          </div>
          <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>
            {patient.gender}
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Registered
          </div>
          <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>
            {new Date(patient.registrationDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>

      {patient.address && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Address
          </div>
          <div style={{ fontSize: '0.875rem', color: '#475569' }}>{patient.address}</div>
        </div>
      )}

      {/* Visit History */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            Visit History
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{visits.length} visits</span>
        </div>
        {visits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No visits recorded yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      width: '40px',
                    }}
                  ></th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Doctor
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Chief Complaints
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Diagnosis
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Vitals
                  </th>
                </tr>
              </thead>
              <tbody>
                {visits
                  .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                  .map(visit => (
                    <>
                      <tr
                        key={visit._id}
                        style={{
                          borderBottom: expandedVisit === visit._id ? 'none' : '1px solid #f1f5f9',
                          cursor: 'pointer',
                          backgroundColor: expandedVisit === visit._id ? '#f8fafc' : 'transparent',
                        }}
                        onClick={() =>
                          setExpandedVisit(expandedVisit === visit._id ? null : visit._id)
                        }
                      >
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#64748b',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              transform:
                                expandedVisit === visit._id ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                            }}
                          >
                            ▶
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#1e293b',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {new Date(visit.visitDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#475569',
                          }}
                        >
                          {visit.consultingDoctor || 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: visit.status === 'completed' ? '#dcfce7' : '#dbeafe',
                              color: visit.status === 'completed' ? '#166534' : '#1e40af',
                            }}
                          >
                            {visit.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#475569',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {visit.chiefComplaints || '-'}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#475569',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {visit.diagnosis || '-'}
                        </td>
                        <td
                          style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#64748b' }}
                        >
                          {visit.vitals ? (
                            <div>
                              {visit.vitals.bloodPressure &&
                                `BP: ${visit.vitals.bloodPressure.systolic}/${visit.vitals.bloodPressure.diastolic}`}
                              {visit.vitals.pulseRate && `, PR: ${visit.vitals.pulseRate}`}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      {expandedVisit === visit._id && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td
                            colSpan={7}
                            style={{ padding: '0.75rem 1rem', backgroundColor: '#fafbfc' }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                              }}
                            >
                              {/* General Examination */}
                              {visit.generalExamination && (
                                <div
                                  style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      marginBottom: '0.5rem',
                                    }}
                                  >
                                    General Examination
                                  </div>
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(2, 1fr)',
                                      gap: '0.5rem',
                                      fontSize: '0.8125rem',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '3px',
                                          backgroundColor: visit.generalExamination.pallor
                                            ? '#3b82f6'
                                            : '#e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {visit.generalExamination.pallor ? '✓' : ''}
                                      </span>
                                      <span style={{ color: '#475569' }}>Pallor</span>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '3px',
                                          backgroundColor: visit.generalExamination.icterus
                                            ? '#3b82f6'
                                            : '#e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {visit.generalExamination.icterus ? '✓' : ''}
                                      </span>
                                      <span style={{ color: '#475569' }}>Icterus</span>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '3px',
                                          backgroundColor: visit.generalExamination.clubbing
                                            ? '#3b82f6'
                                            : '#e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {visit.generalExamination.clubbing ? '✓' : ''}
                                      </span>
                                      <span style={{ color: '#475569' }}>Clubbing</span>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '3px',
                                          backgroundColor: visit.generalExamination.cyanosis
                                            ? '#3b82f6'
                                            : '#e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {visit.generalExamination.cyanosis ? '✓' : ''}
                                      </span>
                                      <span style={{ color: '#475569' }}>Cyanosis</span>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '3px',
                                          backgroundColor: visit.generalExamination.lymphadenopathy
                                            ? '#3b82f6'
                                            : '#e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {visit.generalExamination.lymphadenopathy ? '✓' : ''}
                                      </span>
                                      <span style={{ color: '#475569' }}>Lymphadenopathy</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Systemic Examination */}
                              {visit.systemicExamination && (
                                <div
                                  style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      marginBottom: '0.5rem',
                                    }}
                                  >
                                    Systemic Examination
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.8125rem',
                                      color: '#475569',
                                      display: 'grid',
                                      gap: '0.25rem',
                                    }}
                                  >
                                    {visit.systemicExamination.cvs && (
                                      <div>
                                        <strong>CVS:</strong> {visit.systemicExamination.cvs}
                                      </div>
                                    )}
                                    {visit.systemicExamination.rs && (
                                      <div>
                                        <strong>RS:</strong> {visit.systemicExamination.rs}
                                      </div>
                                    )}
                                    {visit.systemicExamination.pa && (
                                      <div>
                                        <strong>PA:</strong> {visit.systemicExamination.pa}
                                      </div>
                                    )}
                                    {visit.systemicExamination.cns && (
                                      <div>
                                        <strong>CNS:</strong> {visit.systemicExamination.cns}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Prescriptions */}
      {medications.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Recent Prescriptions
            </h2>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {medications.length} prescriptions
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            {medications.slice(0, 5).map(med => (
              <div
                key={med._id}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                      Dr. {med.consultingDoctor}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                      {new Date(med.prescribedDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '500' }}>
                    {med.diagnosis}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                  {med.medications.map((m, idx) => {
                    // Build timing display
                    const timingParts = [];
                    if (m.timing.morning) timingParts.push('M');
                    if (m.timing.afternoon) timingParts.push('A');
                    if (m.timing.evening) timingParts.push('E');
                    if (m.timing.night) timingParts.push('N');
                    const timingDisplay = timingParts.length > 0 ? timingParts.join('-') : '';

                    // Build meal display
                    const mealParts = [];
                    if (m.meal.beforeMeal) mealParts.push('Before');
                    if (m.meal.afterMeal) mealParts.push('After');
                    const mealDisplay = mealParts.length > 0 ? `(${mealParts.join('/')})` : '';

                    return (
                      <div key={idx} style={{ marginBottom: '0.25rem' }}>
                        • {m.medicineName} - {m.dosage} - {timingDisplay} {mealDisplay} - {m.days} days
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '2rem',
    borderRadius: '4px',
    textAlign: 'center' as const,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    margin: 0,
    fontSize: '1.75rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#991b1b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  patientInfo: {
    padding: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  infoItem: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  actionButtonSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  noData: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
  },
  medicationList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  medicationCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '1rem',
  },
  medicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #eee',
  },
  medicationDate: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  diagnosis: {
    color: '#334155',
    fontSize: '0.9rem',
  },
  medicationBody: {
    fontSize: '0.9rem',
  },
  medicationItem: {
    marginBottom: '0.25rem',
  },
  visitList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  visitCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '1rem',
  },
  visitHeader: {
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #eee',
  },
  visitDate: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  visitDoctor: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  visitBody: {
    fontSize: '0.95rem',
  },
  visitItem: {
    marginBottom: '0.5rem',
  },
  vitals: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.5rem',
  },
};

export default PatientDetails;
