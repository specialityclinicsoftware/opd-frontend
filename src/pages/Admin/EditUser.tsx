import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import userService, { type UpdateUserInput } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import type { AxiosError } from '../../types/api';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { userId, hospitalId } = useParams<{ userId: string; hospitalId?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserInput>({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    licenseNumber: '',
    role: undefined,
  });

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
        role: user.role,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => userService.updateUser(userId!, formData),
    onSuccess: (data) => {
      setSuccess(`User "${data.name}" updated successfully!`);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setTimeout(() => {
        navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users` : '/admin/users');
      }, 2000);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to update user');
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    updateMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert variant="error">User not found</Alert>
      </div>
    );
  }

  const showDoctorFields = formData.role === 'doctor';

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button
          variant="secondary"
          onClick={() => navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users` : '/admin/users')}
        >
          ← Back to Users
        </Button>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
        Edit User
      </h1>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            Basic Information
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Role <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  cursor: 'pointer'
                }}
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                {currentUser?.role === 'super_admin' && (
                  <option value="hospital_admin">Hospital Admin</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Doctor-specific fields */}
        {showDoctorFields && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              Doctor Information
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <Input
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Cardiologist, Pediatrician"
              />

              <Input
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter medical license number"
              />
            </div>
          </div>
        )}

        {/* User Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            Account Status
          </h2>

          <div style={{
            padding: '12px 16px',
            backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: user.isActive ? '#166534' : '#991b1b',
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: user.isActive ? '#166534' : '#991b1b',
            }}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users` : '/admin/users')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
