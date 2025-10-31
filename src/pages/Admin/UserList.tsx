import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import userService, { type User } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Alert from '../../components/ui/Alert';
import type { AxiosError } from '../../types/api';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');


  // Determine which hospitalId to use
  const targetHospitalId = hospitalId || currentUser?.hospitalId;


  const { data: response, isLoading } = useQuery({
    queryKey: ['users', targetHospitalId],
    queryFn: () => userService.getHospitalUsers(targetHospitalId!),
    enabled: !!targetHospitalId,
  });

  const activateMutation = useMutation({
    mutationFn: userService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', targetHospitalId] });
      setError(null);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to activate user');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', targetHospitalId] });
      setError(null);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const handleToggleStatus = (user: User) => {
    if (user.isActive) {
      if (window.confirm(`Are you sure you want to deactivate ${user.name}?`)) {
        deactivateMutation.mutate(user._id);
      }
    } else {
      activateMutation.mutate(user._id);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      super_admin: { bg: '#dbeafe', text: '#1e40af' },
      hospital_admin: { bg: '#e0e7ff', text: '#4338ca' },
      doctor: { bg: '#dcfce7', text: '#166534' },
      nurse: { bg: '#fef3c7', text: '#92400e' },
      receptionist: { bg: '#f3e8ff', text: '#6b21a8' },
    };
    return colors[role] || { bg: '#f1f5f9', text: '#475569' };
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      hospital_admin: 'Hospital Admin',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
    };
    return labels[role] || role;
  };

  const filteredUsers = response?.data?.filter(
    (user) => filterRole === 'all' || user.role === filterRole
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        {hospitalId && currentUser?.role === 'super_admin' && (
          <Button variant="secondary" onClick={() => navigate('/admin/hospitals')}>
            ← Back to Hospitals
          </Button>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
          User Management
        </h1>
        <Button onClick={() => navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users/create` : '/admin/users/create')}>
          Create User
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
            Filter by role:
          </span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              color: '#1e293b',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Roles</option>
            <option value="hospital_admin">Hospital Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="receptionist">Receptionist</option>
          </select>
          <span style={{ fontSize: '14px', color: '#64748b', marginLeft: 'auto' }}>
            {filteredUsers?.length || 0} user{filteredUsers?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

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
                Name
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Role
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
            {filteredUsers?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  No users found. Create your first user to get started.
                </td>
              </tr>
            ) : (
              filteredUsers?.map((user) => {
                const roleColors = getRoleBadgeColor(user.role);
                return (
                  <tr
                    key={user._id}
                    style={{ borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>
                      <div style={{ fontWeight: '500' }}>{user.name}</div>
                      {user.specialization && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {user.specialization}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: roleColors.bg,
                        color: roleColors.text,
                      }}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                      <div>{user.email}</div>
                      {user.phoneNumber && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {user.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                        color: user.isActive ? '#166534' : '#991b1b',
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          onClick={() => navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users/${user._id}/edit` : `/admin/users/${user._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={user.isActive ? 'danger' : 'secondary'}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
