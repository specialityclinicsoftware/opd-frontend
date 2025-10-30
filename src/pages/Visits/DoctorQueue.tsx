import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitWorkflowService } from '../../services';
import { Button, Card, Loading, Alert } from '../../components/ui';
import { DoctorQueueItem } from '../../types';
import styles from './DoctorQueue.module.css';

const DoctorQueue = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  // Fetch doctor queue
  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['doctor-queue'],
    queryFn: async () => {
      const response = await visitWorkflowService.getDoctorQueue();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Start consultation mutation
  const startConsultationMutation = useMutation({
    mutationFn: (visitId: string) => visitWorkflowService.startConsultation(visitId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-queue'] });
      // Navigate to consultation form
      navigate(`/doctor/consultation/${response.data._id}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to start consultation');
    },
  });

  const handleStartConsultation = (visitId: string) => {
    setError('');
    startConsultationMutation.mutate(visitId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'ready-for-doctor': { label: 'Ready', color: '#10b981' },
      'with-doctor': { label: 'In Progress', color: '#3b82f6' },
    };

    const badge = badges[status] || { label: status, color: '#6b7280' };

    return (
      <span
        className={styles.statusBadge}
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
        <p>Loading queue...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.container}>
        <Alert type="error">Failed to load doctor queue. Please try again.</Alert>
      </div>
    );
  }

  const queueItems = data || [];
  const readyVisits = queueItems.filter((item: DoctorQueueItem) => item.status === 'ready-for-doctor');
  const inProgressVisits = queueItems.filter((item: DoctorQueueItem) => item.status === 'with-doctor');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Doctor Queue</h1>
          <p className={styles.subtitle}>Consultations ready for review</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{readyVisits.length}</span>
            <span className={styles.statLabel}>Ready</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{inProgressVisits.length}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {queueItems.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <p>No visits in queue</p>
            <span>All consultations have been processed</span>
          </div>
        </Card>
      ) : (
        <div className={styles.queueList}>
          {inProgressVisits.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>In Progress</h2>
              {inProgressVisits.map((item: DoctorQueueItem) => (
                <Card key={item._id} className={styles.queueItem}>
                  <div className={styles.itemContent}>
                    <div className={styles.patientInfo}>
                      <h3>{item.patientId.name}</h3>
                      <div className={styles.itemDetails}>
                        <span>{item.patientId.age} years</span>
                        <span>•</span>
                        <span>{item.patientId.gender}</span>
                        <span>•</span>
                        <span>{item.patientId.phoneNumber}</span>
                      </div>
                      {item.chiefComplaints && (
                        <div className={styles.complaints}>
                          <strong>Chief Complaints:</strong> {item.chiefComplaints}
                        </div>
                      )}
                      <div className={styles.itemMeta}>
                        <span>Visit: {formatDate(item.visitDate)}</span>
                        {item.nurseId && <span>Nurse: {item.nurseId.name}</span>}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      {getStatusBadge(item.status)}
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/doctor/consultation/${item._id}`)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {readyVisits.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Ready for Consultation</h2>
              {readyVisits.map((item: DoctorQueueItem) => (
                <Card key={item._id} className={styles.queueItem}>
                  <div className={styles.itemContent}>
                    <div className={styles.patientInfo}>
                      <h3>{item.patientId.name}</h3>
                      <div className={styles.itemDetails}>
                        <span>{item.patientId.age} years</span>
                        <span>•</span>
                        <span>{item.patientId.gender}</span>
                        <span>•</span>
                        <span>{item.patientId.phoneNumber}</span>
                      </div>
                      {item.vitals && (
                        <div className={styles.vitalsPreview}>
                          <strong>Vitals:</strong>
                          {item.vitals.bloodPressure && (
                            <span> BP: {item.vitals.bloodPressure.systolic}/{item.vitals.bloodPressure.diastolic}</span>
                          )}
                          {item.vitals.pulseRate && <span> | Pulse: {item.vitals.pulseRate}</span>}
                          {item.vitals.temperature && <span> | Temp: {item.vitals.temperature}°F</span>}
                        </div>
                      )}
                      {item.chiefComplaints && (
                        <div className={styles.complaints}>
                          <strong>Chief Complaints:</strong> {item.chiefComplaints}
                        </div>
                      )}
                      <div className={styles.itemMeta}>
                        <span>Visit: {formatDate(item.visitDate)}</span>
                        {item.nurseId && <span>Nurse: {item.nurseId.name}</span>}
                        {item.preConsultationCompletedAt && (
                          <span>Completed: {formatDate(item.preConsultationCompletedAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      {getStatusBadge(item.status)}
                      <Button
                        variant="success"
                        onClick={() => handleStartConsultation(item._id)}
                        disabled={startConsultationMutation.isPending}
                      >
                        {startConsultationMutation.isPending ? 'Starting...' : 'Start Consultation'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorQueue;
