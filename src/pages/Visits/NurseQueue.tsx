import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitWorkflowService } from '../../services';
import { Button, Card, Loading, Alert } from '../../components/ui';
import { NurseQueueItem } from '../../types';
import styles from './NurseQueue.module.css';

const NurseQueue = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  // Fetch nurse queue
  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['nurse-queue'],
    queryFn: async () => {
      const response = await visitWorkflowService.getNurseQueue();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Start pre-consultation mutation
  const startPreConsultationMutation = useMutation({
    mutationFn: (visitId: string) => visitWorkflowService.startPreConsultation(visitId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['nurse-queue'] });
      // Navigate to pre-consultation form
      navigate(`/nurse/pre-consultation/${response.data._id}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to start pre-consultation');
    },
  });

  const handleStartPreConsultation = (visitId: string) => {
    setError('');
    startPreConsultationMutation.mutate(visitId);
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
      'pending': { label: 'Pending', color: '#f59e0b' },
      'with-nurse': { label: 'In Progress', color: '#3b82f6' },
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
        <Alert type="error">Failed to load nurse queue. Please try again.</Alert>
      </div>
    );
  }

  const queueItems = data || [];
  const pendingVisits = queueItems.filter((item: NurseQueueItem) => item.status === 'pending');
  const inProgressVisits = queueItems.filter((item: NurseQueueItem) => item.status === 'with-nurse');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Nurse Queue</h1>
          <p className={styles.subtitle}>Pre-consultation visits</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendingVisits.length}</span>
            <span className={styles.statLabel}>Pending</span>
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
            <span>All visits have been processed</span>
          </div>
        </Card>
      ) : (
        <div className={styles.queueList}>
          {inProgressVisits.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>In Progress</h2>
              {inProgressVisits.map((item: NurseQueueItem) => (
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
                      <div className={styles.itemMeta}>
                        <span>Visit: {formatDate(item.visitDate)}</span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      {getStatusBadge(item.status)}
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/nurse/pre-consultation/${item._id}`)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {pendingVisits.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Pending Visits</h2>
              {pendingVisits.map((item: NurseQueueItem) => (
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
                      <div className={styles.itemMeta}>
                        <span>Visit: {formatDate(item.visitDate)}</span>
                        <span>Waiting since: {formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      {getStatusBadge(item.status)}
                      <Button
                        variant="success"
                        onClick={() => handleStartPreConsultation(item._id)}
                        disabled={startPreConsultationMutation.isPending}
                      >
                        {startPreConsultationMutation.isPending ? 'Starting...' : 'Start Pre-Consultation'}
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

export default NurseQueue;
