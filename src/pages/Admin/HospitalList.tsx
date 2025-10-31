import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import hospitalService, { type Hospital } from '../../services/hospitalService';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Alert from '../../components/ui/Alert';
import type { AxiosError } from '../../types/api';

const HospitalList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      if (window.confirm(`Are you sure you want to deactivate ${hospital.name}?`)) {
        deactivateMutation.mutate(hospital._id);
      }
    } else {
      activateMutation.mutate(hospital._id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
          Hospital Management
        </h1>
        <Button onClick={() => navigate('/admin/hospitals/create')}>
          Create Hospital
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Hospital Name
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Registration Number
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Contact
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Status
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {hospitals?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  No hospitals found. Create your first hospital to get started.
                </td>
              </tr>
            ) : (
              hospitals?.map((hospital) => (
                <tr
                  key={hospital._id}
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                >
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>
                    <div style={{ fontWeight: '500' }}>{hospital.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {hospital.address}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                    {hospital.registrationNumber}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                    <div>{hospital.phoneNumber}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {hospital.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: hospital.isActive ? '#dcfce7' : '#fee2e2',
                      color: hospital.isActive ? '#166534' : '#991b1b',
                    }}>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/admin/hospitals/${hospital._id}/users`)}
                      >
                        Manage Users
                      </Button>
                      <Button
                        variant={hospital.isActive ? 'danger' : 'secondary'}
                        onClick={() => handleToggleStatus(hospital)}
                      >
                        {hospital.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalList;
