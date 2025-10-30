import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { visitWorkflowService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Loading, Alert } from '../../components/ui';
import ConsultationForm from '../../components/visits/ConsultationForm';
import { ConsultationData, VisitFormData } from '../../types';
import styles from './Consultation.module.css';

const Consultation = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<VisitFormData>({
    patientId: '',
    visitDate: new Date(),
    consultingDoctor: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allowEditNurseData, setAllowEditNurseData] = useState(false);

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
        consultingDoctor: user?.name || visitData.consultingDoctor || '',
        // Nurse data (Stage 1)
        vitals: visitData.vitals,
        chiefComplaints: visitData.chiefComplaints,
        pastHistory: visitData.pastHistory,
        familyHistory: visitData.familyHistory,
        maritalHistory: visitData.maritalHistory,
        generalExamination: visitData.generalExamination,
        bloodInvestigations: visitData.bloodInvestigations,
        // Doctor data (Stage 2)
        systemicExamination: visitData.systemicExamination,
        diagnosis: visitData.diagnosis,
        treatment: visitData.treatment,
        investigation: visitData.investigation,
        advice: visitData.advice,
        reviewDate: visitData.reviewDate,
      });
    }
  }, [visitData, user]);

  // Update consultation mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!visitId) throw new Error('Visit ID is required');

      const consultationData: ConsultationData = {
        systemicExamination: formData.systemicExamination,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        investigation: formData.investigation,
        advice: formData.advice,
        reviewDate: formData.reviewDate,
      };

      return visitWorkflowService.updateConsultation(visitId, consultationData);
    },
    onSuccess: () => {
      setSuccessMessage('Consultation data saved successfully');
      setError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to save consultation data');
      setSuccessMessage('');
    },
  });

  // Finalize visit mutation
  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!visitId) throw new Error('Visit ID is required');
      return visitWorkflowService.finalizeVisit(visitId);
    },
    onSuccess: () => {
      navigate('/doctor/queue', {
        state: { message: 'Consultation completed successfully.' }
      });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to finalize consultation');
    },
  });

  const handleSave = () => {
    setError('');
    setSuccessMessage('');
    updateMutation.mutate();
  };

  const handleFinalize = () => {
    if (!formData.diagnosis?.trim()) {
      setError('Please enter a diagnosis before finalizing');
      return;
    }

    if (!formData.treatment?.trim()) {
      setError('Please enter treatment plan before finalizing');
      return;
    }

    setError('');
    setSuccessMessage('');

    // First save, then finalize
    updateMutation.mutate(undefined, {
      onSuccess: () => {
        finalizeMutation.mutate();
      }
    });
  };

  const handleCancel = () => {
    navigate('/doctor/queue');
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
  const nurse = visitData.nurseId && typeof visitData.nurseId === 'object' ? visitData.nurseId : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Doctor Consultation</h1>
          <p className={styles.subtitle}>Stage 2: Doctor Assessment & Treatment</p>
        </div>
        {patient && (
          <Card className={styles.patientCard}>
            <h3>{patient.name}</h3>
            <p>{patient.age} years • {patient.gender}</p>
            <p>{patient.phoneNumber}</p>
            {nurse && (
              <p className={styles.nurseInfo}>Pre-consultation by: {nurse.name}</p>
            )}
          </Card>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card>
        <div className={styles.editToggle}>
          <label>
            <input
              type="checkbox"
              checked={allowEditNurseData}
              onChange={(e) => setAllowEditNurseData(e.target.checked)}
            />
            <span>Allow editing nurse data (if hospital policy permits)</span>
          </label>
        </div>

        <ConsultationForm
          formData={formData}
          onFormDataChange={setFormData}
          showPreConsultationData={true}
          allowEditPreConsultationData={allowEditNurseData}
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
            disabled={updateMutation.isPending || finalizeMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Progress'}
          </Button>
          <Button
            variant="success"
            onClick={handleFinalize}
            disabled={updateMutation.isPending || finalizeMutation.isPending}
          >
            {finalizeMutation.isPending ? 'Finalizing...' : 'Finalize Visit'}
          </Button>
        </div>
      </div>

      {visitData.status === 'completed' && (
        <Alert type="info">
          This consultation has been completed.
        </Alert>
      )}
    </div>
  );
};

export default Consultation;
