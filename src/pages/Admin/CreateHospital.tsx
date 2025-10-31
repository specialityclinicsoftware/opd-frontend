import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import hospitalService, { type ICreateHospital } from '../../services/hospitalService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

const CreateHospital: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ICreateHospital>({
   hospital:{ hospitalName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
    email: '',
    registrationNumber: '',},
  admin: { name: '',
    email: '',
    password: '',
    phoneNumber: '',}
  });

  const createMutation = useMutation({
    mutationFn: hospitalService.createHospital,
    onSuccess: (data) => {
      setSuccess(`Hospital "${data.hospital.name}" created successfully!`);
      setError(null);
      setTimeout(() => {
        navigate('/admin/hospitals');
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create hospital');
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.hospital.hospitalName || !formData.hospital.email || !formData.hospital.registrationNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.admin.name || !formData.admin.email || !formData.admin.password) {
      setError('Please fill in all admin credentials');
      return;
    }

    if (formData.admin.password.length < 6) {
      setError('Admin password must be at least 6 characters');
      return;
    }

    createMutation.mutate(formData);
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const [section, field] = name.split('.');

  setFormData((prev) => ({
    ...prev,
    [section]: {
      ...prev[section as keyof ICreateHospital],
      [field]: value,
    },
  }));
};

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button variant="secondary" onClick={() => navigate('/admin/hospitals')}>
          ← Back to Hospitals
        </Button>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
        Create New Hospital
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
        {/* Hospital Information */}
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
            Hospital Information
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            <Input
              label="Hospital Name"
              name="hospital.hospitalName"
              value={formData.hospital.hospitalName}
              onChange={handleChange}
              required
              placeholder="Enter hospital name"
            />

            <Input
              label="Registration Number"
              name="hospital.registrationNumber"
              value={formData.hospital.registrationNumber}
              onChange={handleChange}
              required
              placeholder="Enter registration number"
            />

            <Input
                label="Address"
                name="hospital.address"
                value={formData.hospital.address}
                onChange={handleChange}
                required
                placeholder="Enter hospital address"
              />

    

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <Input
                label="City"
                name="hospital.city"
                value={formData.hospital.city}
                onChange={handleChange}
                required
                placeholder="Enter hospital city"
              />
              <Input
                label="State"
                name="hospital.state"
                value={formData.hospital.state}
                onChange={handleChange}
                required
                placeholder="Enter hospital state"
              />
              <Input
                label="Pincode"
                name="hospital.pincode"
                value={formData.hospital.pincode}
                onChange={handleChange}
                required
                placeholder="Enter hospital pincode"
              />

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Phone Number"
                name="hospital.phoneNumber"
                value={formData.hospital.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />

              <Input
                label="Email"
                type="email"
                name="hospital.email"
                value={formData.hospital.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Admin Credentials */}
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
            Hospital Admin Credentials
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            <Input
              label="Admin Name"
              name="admin.name"
              value={formData.admin.name}
              onChange={handleChange}
              required
              placeholder="Enter admin name"
            />

            <Input
              label="Admin Email"
              type="email"
              name="admin.email"
              value={formData.admin.email}
              onChange={handleChange}
              required
              placeholder="Enter admin email"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Admin Password"
                type="password"
                name="admin.password"
                value={formData.admin.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
              />

              <Input
                label="Admin Phone (Optional)"
                name="admin.phoneNumber"
                value={formData.admin.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/hospitals')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Hospital'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHospital;
