import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import hospitalService, { type Hospital } from '../../services/hospitalService';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Alert from '../../components/ui/Alert';
import { Dialog } from '../../components/ui';
import { useDialog } from '../../hooks/useDialog';
import type { AxiosError } from '../../types/api';

const HospitalList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dialogState, hideDialog, confirm } = useDialog();
  const [error, setError] = useState<string | null>(null);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: hospitalService.getAllHospitals,
  });

  const activateMutation = useMutation({
    mutationFn: hospitalService.activateHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setError(null);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to activate hospital');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: hospitalService.deactivateHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setError(null);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to deactivate hospital');
    },
  });

  const handleToggleStatus = (hospital: Hospital) => {
    if (hospital.isActive) {
      confirm(
        `Are you sure you want to deactivate ${hospital.hospitalName}?`,
        () => deactivateMutation.mutate(hospital._id),
        'Confirm Deactivation'
      );
    } else {
      activateMutation.mutate(hospital._id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={hideDialog}
        title={dialogState.title}
        type={dialogState.type}
        showCancel={dialogState.showCancel}
        onConfirm={dialogState.onConfirm}
      >
        {dialogState.message}
      </Dialog>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Hospitals</h1>
          <Button variant="primary" onClick={() => navigate('/admin/hospitals/create')}>
            + Create Hospital
          </Button>
        </div>

        {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Hospital Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>City</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals?.map((hospital) => (
                <tr key={hospital._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px' }}>{hospital.hospitalName}</td>
                  <td style={{ padding: '16px' }}>{hospital.city || '-'}</td>
                  <td style={{ padding: '16px' }}>{hospital.phoneNumber}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: hospital.isActive ? '#dcfce7' : '#fee2e2',
                      color: hospital.isActive ? '#166534' : '#991b1b',
                    }}>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/admin/hospitals/${hospital._id}/users`)}
                      >
                        Manage Users
                      </Button>
                      <Button
                        variant={hospital.isActive ? 'danger' : 'success'}
                        onClick={() => handleToggleStatus(hospital)}
                        disabled={activateMutation.isPending || deactivateMutation.isPending}
                      >
                        {hospital.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default HospitalList;
