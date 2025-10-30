import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService, visitService, medicationService } from '../../services';
import { Patient, Visit, MedicationHistory } from '../../types';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'visit' | 'prescription';
  data: Visit | MedicationHistory;
}

const PatientHistory = () => {
  const { patientId } = useParams<{ patientId: string }>();

  // Fetch patient
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientService.getById(patientId!);
      return response.data;
    },
    enabled: !!patientId,
  });

  // Fetch patient history (visits + medications)
  const { data: timeline = [], isLoading: historyLoading } = useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const [visitsRes, medsRes] = await Promise.all([
        visitService.getByPatient(patientId!),
        medicationService.getByPatient(patientId!),
      ]);

      const visits = Array.isArray(visitsRes.data) ? visitsRes.data : [];
      const medications = Array.isArray(medsRes.data) ? medsRes.data : [];

      const events: TimelineEvent[] = [
        ...visits.map(v => ({
          id: v._id,
          date: new Date(v.visitDate),
          type: 'visit' as const,
          data: v,
        })),
        ...medications.map(m => ({
          id: m._id,
          date: new Date(m.prescribedDate),
          type: 'prescription' as const,
          data: m,
        })),
      ];

      // Sort by date descending (newest first)
      events.sort((a, b) => b.date.getTime() - a.date.getTime());
      return events;
    },
    enabled: !!patientId,
  });

  const loading = patientLoading || historyLoading;

  if (loading) {
    return <div style={styles.loading}>Loading patient history...</div>;
  }

  if (!patient) {
    return <div style={styles.error}>Patient not found</div>;
  }

  return (
    <div style={styles.container}>
      {/* Patient Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{patient.name} - Complete History</h1>
          <div style={styles.patientInfo}>
            Phone: {patient.phoneNumber} | Age: {patient.age || 'N/A'} | Gender: {patient.gender}
          </div>
        </div>
        <Link to={`/patients/${patient._id}`} style={styles.backButton}>
          Back to Patient
        </Link>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div style={styles.noData}>No medical history available</div>
      ) : (
        <div style={styles.timeline}>
          {timeline.map((event, index) => (
            <div key={event.id} style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              {index < timeline.length - 1 && <div style={styles.timelineLine} />}
              <div style={styles.timelineContent}>
                <div style={styles.timelineDate}>
                  {event.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {event.type === 'visit' ? (
                  <VisitEvent visit={event.data as Visit} />
                ) : (
                  <PrescriptionEvent prescription={event.data as MedicationHistory} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VisitEvent = ({ visit }: { visit: Visit }) => (
  <div style={styles.eventCard}>
    <div style={styles.eventHeader}>
      <div style={styles.eventType}>Visit</div>
      <div style={styles.eventDoctor}>Dr. {visit.consultingDoctor}</div>
    </div>
    <div style={styles.eventBody}>
      {visit.chiefComplaints && (
        <div style={styles.eventSection}>
          <strong>Chief Complaints:</strong>
          <div>{visit.chiefComplaints}</div>
        </div>
      )}
      {visit.vitals && (
        <div style={styles.eventSection}>
          <strong>Vitals:</strong>
          <div style={styles.vitalsGrid}>
            {visit.vitals.pulseRate && <span>Pulse: {visit.vitals.pulseRate} bpm</span>}
            {visit.vitals.bloodPressure && (
              <span>
                BP: {visit.vitals.bloodPressure.systolic}/{visit.vitals.bloodPressure.diastolic}
              </span>
            )}
            {visit.vitals.spO2 && <span>SpO2: {visit.vitals.spO2}%</span>}
            {visit.vitals.temperature && <span>Temp: {visit.vitals.temperature}°F</span>}
          </div>
        </div>
      )}
      {visit.generalExamination && Object.values(visit.generalExamination).some(v => v) && (
        <div style={styles.eventSection}>
          <strong>General Examination:</strong>
          <div style={styles.examList}>
            {visit.generalExamination.pallor && <span>Pallor</span>}
            {visit.generalExamination.icterus && <span>Icterus</span>}
            {visit.generalExamination.clubbing && <span>Clubbing</span>}
            {visit.generalExamination.cyanosis && <span>Cyanosis</span>}
            {visit.generalExamination.lymphadenopathy && <span>Lymphadenopathy</span>}
          </div>
        </div>
      )}
      {visit.diagnosis && (
        <div style={styles.eventSection}>
          <strong>Diagnosis:</strong>
          <div>{visit.diagnosis}</div>
        </div>
      )}
      {visit.treatment && (
        <div style={styles.eventSection}>
          <strong>Treatment:</strong>
          <div>{visit.treatment}</div>
        </div>
      )}
      {visit.investigation && (
        <div style={styles.eventSection}>
          <strong>Investigation:</strong>
          <div>{visit.investigation}</div>
        </div>
      )}
      {visit.advice && (
        <div style={styles.eventSection}>
          <strong>Advice:</strong>
          <div>{visit.advice}</div>
        </div>
      )}
      {visit.reviewDate && (
        <div style={styles.eventSection}>
          <strong>Review Date:</strong>{' '}
          {new Date(visit.reviewDate).toLocaleDateString()}
        </div>
      )}
    </div>
  </div>
);

const PrescriptionEvent = ({ prescription }: { prescription: MedicationHistory }) => (
  <div style={styles.eventCard}>
    <div style={styles.eventHeader}>
      <div style={styles.eventTypePrescription}>Prescription</div>
      <div style={styles.eventDoctor}>Dr. {prescription.consultingDoctor}</div>
    </div>
    <div style={styles.eventBody}>
      {prescription.diagnosis && (
        <div style={styles.eventSection}>
          <strong>Diagnosis:</strong> {prescription.diagnosis}
        </div>
      )}
      <div style={styles.eventSection}>
        <strong>Medications:</strong>
        <div style={styles.medicationList}>
          {prescription.medications.map((med, idx) => (
            <div key={idx} style={styles.medicationItem}>
              <div style={styles.medicineName}>{med.medicineName}</div>
              <div style={styles.medicineDetails}>
                {med.dosage && <span>{med.dosage}</span>}
                {med.frequency && <span>{med.frequency}</span>}
                {med.duration && <span>{med.duration}</span>}
                {med.route && <span>{med.route}</span>}
              </div>
              {med.timing && (
                <div style={styles.medicineInstructions}>Timing: {med.timing}</div>
              )}
              {med.instructions && (
                <div style={styles.medicineInstructions}>{med.instructions}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {prescription.notes && (
        <div style={styles.eventSection}>
          <strong>Notes:</strong>
          <div>{prescription.notes}</div>
        </div>
      )}
    </div>
  </div>
);

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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    color: '#2c3e50',
  },
  patientInfo: {
    fontSize: '1rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#334155',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    display: 'inline-block',
  },
  noData: {
    textAlign: 'center' as const,
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#999',
  },
  timeline: {
    position: 'relative' as const,
  },
  timelineItem: {
    position: 'relative' as const,
    paddingLeft: '3rem',
    paddingBottom: '2rem',
  },
  timelineDot: {
    position: 'absolute' as const,
    left: '0',
    top: '0.5rem',
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
    backgroundColor: '#334155',
    border: '3px solid white',
    boxShadow: '0 0 0 2px #334155',
  },
  timelineLine: {
    position: 'absolute' as const,
    left: '0.5rem',
    top: '1.5rem',
    bottom: '0',
    width: '2px',
    backgroundColor: '#ddd',
  },
  timelineContent: {
    marginLeft: '1rem',
  },
  timelineDate: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '0.5rem',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  eventHeader: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
  },
  eventTypePrescription: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#6b21a8',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
  },
  eventDoctor: {
    fontSize: '0.9rem',
    color: '#666',
  },
  eventBody: {
    padding: '1rem',
  },
  eventSection: {
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  examList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  medicationList: {
    marginTop: '0.75rem',
  },
  medicationItem: {
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    borderLeft: '3px solid #6b21a8',
  },
  medicineName: {
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#2c3e50',
    marginBottom: '0.25rem',
  },
  medicineDetails: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  medicineInstructions: {
    fontSize: '0.85rem',
    color: '#888',
    fontStyle: 'italic',
  },
};

export default PatientHistory;
