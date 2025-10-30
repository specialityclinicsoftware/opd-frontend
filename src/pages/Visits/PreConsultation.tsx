import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { visitWorkflowService } from '../../services';
import { Button, Card, Loading, Alert } from '../../components/ui';
import PreConsultationForm from '../../components/visits/PreConsultationForm';
import { PreConsultationData, VisitFormData } from '../../types';
import styles from './PreConsultation.module.css';

const PreConsultation = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<VisitFormData>({
    patientId: '',
    visitDate: new Date(),
    consultingDoctor: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch visit details
  const { data: visitData, isLoading } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: async () => {
      if (!visitId) throw new Error('Visit ID is required');
      const response = await visitWorkflowService.getVisitById(visitId);
      return response.data;
    },
    enabled: !!visitId,
  });

  // Load visit data into form
  useEffect(() => {
    if (visitData) {
      setFormData({
        patientId: visitData.patientId,
        visitDate: visitData.visitDate,
        consultingDoctor: visitData.consultingDoctor || '',
        vitals: visitData.vitals,
        chiefComplaints: visitData.chiefComplaints,
        pastHistory: visitData.pastHistory,
        familyHistory: visitData.familyHistory,
        maritalHistory: visitData.maritalHistory,
        generalExamination: visitData.generalExamination,
        bloodInvestigations: visitData.bloodInvestigations,
      });
    }
  }, [visitData]);

  // Update pre-consultation mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!visitId) throw new Error('Visit ID is required');

      const preConsultationData: PreConsultationData = {
        vitals: formData.vitals,
        chiefComplaints: formData.chiefComplaints,
        pastHistory: formData.pastHistory,
        familyHistory: formData.familyHistory,
        maritalHistory: formData.maritalHistory,
        generalExamination: formData.generalExamination,
        bloodInvestigations: formData.bloodInvestigations,
      };

      return visitWorkflowService.updatePreConsultation(visitId, preConsultationData);
    },
    onSuccess: () => {
      setSuccessMessage('Pre-consultation data saved successfully');
      setError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to save pre-consultation data');
      setSuccessMessage('');
    },
  });

  // Complete pre-consultation mutation
  const completeMutation = useMutation({
    mutationFn: () => {
      if (!visitId) throw new Error('Visit ID is required');
      return visitWorkflowService.completePreConsultation(visitId);
    },
    onSuccess: () => {
      navigate('/nurse/queue', {
        state: { message: 'Pre-consultation completed successfully. Visit sent to doctor.' }
      });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to complete pre-consultation');
    },
  });

  const handleSave = () => {
    setError('');
    setSuccessMessage('');
    updateMutation.mutate();
  };

  const handleComplete = () => {
    if (!formData.vitals?.pulseRate && !formData.vitals?.bloodPressure) {
      setError('Please fill in at least basic vitals before completing');
      return;
    }

    if (!formData.chiefComplaints?.trim()) {
      setError('Please enter chief complaints before completing');
      return;
    }

    setError('');
    setSuccessMessage('');

    // First save, then complete
    updateMutation.mutate(undefined, {
      onSuccess: () => {
        completeMutation.mutate();
      }
    });
  };

  const handleCancel = () => {
    navigate('/nurse/queue');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
        <p>Loading visit details...</p>
      </div>
    );
  }

  if (!visitData) {
    return (
      <div className={styles.container}>
        <Alert type="error">Visit not found</Alert>
      </div>
    );
  }

  const patient = typeof visitData.patientId === 'object' ? visitData.patientId : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Pre-Consultation</h1>
          <p className={styles.subtitle}>Stage 1: Nurse Assessment</p>
        </div>
        {patient && (
          <Card className={styles.patientCard}>
            <h3>{patient.name}</h3>
            <p>{patient.age} years • {patient.gender}</p>
            <p>{patient.phoneNumber}</p>
          </Card>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card>
        <PreConsultationForm
          formData={formData}
          onFormDataChange={setFormData}
          readOnly={visitData.status === 'ready-for-doctor' || visitData.status === 'completed'}
        />
      </Card>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <div className={styles.rightActions}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={updateMutation.isPending || completeMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Progress'}
          </Button>
          <Button
            variant="success"
            onClick={handleComplete}
            disabled={updateMutation.isPending || completeMutation.isPending}
          >
            {completeMutation.isPending ? 'Completing...' : 'Complete & Send to Doctor'}
          </Button>
        </div>
      </div>

      {visitData.status === 'ready-for-doctor' && (
        <Alert type="info">
          This pre-consultation has been completed and is now ready for the doctor.
        </Alert>
      )}
    </div>
  );
};

export default PreConsultation;
