import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import userService, { type CreateUserInput } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import type { AxiosError } from '../../types/api';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Determine which hospitalId to use
  const targetHospitalId = hospitalId || currentUser?.hospitalId;

  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phoneNumber: '',
    specialization: '',
    licenseNumber: '',
  });

  const createMutation = useMutation({
    mutationFn: () => userService.createUser(targetHospitalId!, formData),
    onSuccess: (data) => {
      setSuccess(`User "${data.name}" created successfully!`);
      setError(null);
      setTimeout(() => {
        navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users` : '/admin/users');
      }, 2000);
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to create user');
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    createMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        Create New User
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
              />
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(hospitalId ? `/admin/hospitals/${hospitalId}/users` : '/admin/users')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
