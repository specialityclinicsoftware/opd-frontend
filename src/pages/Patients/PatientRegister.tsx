import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services';
import type { PatientFormData } from '../../types';

const PatientRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    phoneNumber: '',
    age: 0,
    gender: 'Male',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }
    if (formData.age < 0 || formData.age > 150) {
      setError('Age must be between 0 and 150');
      return;
    }

    try {
      setLoading(true);
      const response = await patientService.register(formData);
      alert('Patient registered successfully!');
      navigate(`/patients/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register patient');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Register New Patient</h1>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Phone Number <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="10 digit phone number"
              maxLength={10}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                placeholder="Age"
                min="0"
                max="150"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gender <span style={styles.required}>*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows={3}
              style={styles.textarea}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#2c3e50',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  required: {
    color: '#991b1b',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  cancelButton: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default PatientRegister;
