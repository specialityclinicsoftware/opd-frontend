import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, visitService, medicationService } from '../../services';
// Types for Patient, Visit, MedicationHistory are inferred from API responses

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      return Array.isArray(response.data) ? response.data : [];
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
    <div style={styles.container}>
      {/* Patient Info Card */}
      <div style={styles.patientCard}>
        <div style={styles.cardHeader}>
          <h1 style={styles.patientName}>{patient.name}</h1>
          <button onClick={handleDelete} style={styles.deleteButton}>
            Delete Patient
          </button>
        </div>
        <div style={styles.patientInfo}>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <strong>Phone:</strong> {patient.phoneNumber}
            </div>
            <div style={styles.infoItem}>
              <strong>Age:</strong> {patient.age || 'N/A'}
            </div>
            <div style={styles.infoItem}>
              <strong>Gender:</strong> {patient.gender}
            </div>
            <div style={styles.infoItem}>
              <strong>Registered:</strong>{' '}
              {new Date(patient.registrationDate).toLocaleDateString()}
            </div>
          </div>
          {patient.address && (
            <div style={styles.infoItem}>
              <strong>Address:</strong> {patient.address}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <Link
          to={`/visits/new?patientId=${patient._id}`}
          style={styles.actionButton}
        >
          + Create New Visit
        </Link>
        <Link
          to={`/prescriptions/new?patientId=${patient._id}`}
          style={styles.actionButton}
        >
          + Add Prescription
        </Link>
        <Link
          to={`/history/${patient._id}`}
          style={styles.actionButtonSecondary}
        >
          View Complete History
        </Link>
      </div>

      {/* Recent Prescriptions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Prescriptions</h2>
        {medications.length === 0 ? (
          <div style={styles.noData}>No prescriptions yet</div>
        ) : (
          <div style={styles.medicationList}>
            {medications.slice(0, 5).map((med) => (
              <div key={med._id} style={styles.medicationCard}>
                <div style={styles.medicationHeader}>
                  <div>
                    <strong>Dr. {med.consultingDoctor}</strong>
                    <div style={styles.medicationDate}>
                      {new Date(med.prescribedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.diagnosis}>{med.diagnosis}</div>
                </div>
                <div style={styles.medicationBody}>
                  {med.medications.map((m, idx) => (
                    <div key={idx} style={styles.medicationItem}>
                      • {m.medicineName} - {m.dosage} - {m.frequency} for {m.duration}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visit History */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Visit History</h2>
        {visits.length === 0 ? (
          <div style={styles.noData}>No visits recorded yet</div>
        ) : (
          <div style={styles.visitList}>
            {visits
              .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
              .map((visit) => (
                <div key={visit._id} style={styles.visitCard}>
                  <div style={styles.visitHeader}>
                    <div>
                      <div style={styles.visitDate}>
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </div>
                      <div style={styles.visitDoctor}>Dr. {visit.consultingDoctor}</div>
                    </div>
                  </div>
                  <div style={styles.visitBody}>
                    {visit.chiefComplaints && (
                      <div style={styles.visitItem}>
                        <strong>Chief Complaints:</strong> {visit.chiefComplaints}
                      </div>
                    )}
                    {visit.diagnosis && (
                      <div style={styles.visitItem}>
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </div>
                    )}
                    {visit.treatment && (
                      <div style={styles.visitItem}>
                        <strong>Treatment:</strong> {visit.treatment}
                      </div>
                    )}
                    {visit.vitals && (
                      <div style={styles.vitals}>
                        <strong>Vitals:</strong>
                        {visit.vitals.pulseRate && ` Pulse: ${visit.vitals.pulseRate} bpm,`}
                        {visit.vitals.bloodPressure &&
                          ` BP: ${visit.vitals.bloodPressure.systolic}/${visit.vitals.bloodPressure.diastolic},`}
                        {visit.vitals.spO2 && ` SpO2: ${visit.vitals.spO2}%,`}
                        {visit.vitals.temperature && ` Temp: ${visit.vitals.temperature}°F`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
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
