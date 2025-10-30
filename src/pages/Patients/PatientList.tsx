import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services';
import type { Patient } from '../../types';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients = [], isLoading: loading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientService.getAll();
      return response.data || [];
    },
  });

  // Delete patient mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      alert('Patient deleted successfully');
    },
    onError: () => {
      alert('Failed to delete patient');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete patient ${name}?`)) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.includes(searchTerm)
  );

  if (loading) {
    return <div style={styles.loading}>Loading patients...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Patient Management</h1>
        <Link to="/patients/register" style={styles.registerButton}>
          + Register New Patient
        </Link>
      </div>

      {/* Search Bar */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Patient List */}
      <div style={styles.patientGrid}>
        {filteredPatients.length === 0 ? (
          <div style={styles.noData}>
            {searchTerm ? 'No patients found' : 'No patients registered yet'}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient._id} style={styles.patientCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.patientName}>{patient.name}</h3>
                <span style={styles.gender}>{patient.gender}</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <strong>Age:</strong> {patient.age || 'N/A'}
                </div>
                <div style={styles.infoRow}>
                  <strong>Phone:</strong> {patient.phoneNumber}
                </div>
                <div style={styles.infoRow}>
                  <strong>Address:</strong> {patient.address || 'N/A'}
                </div>
                <div style={styles.infoRow}>
                  <strong>Registered:</strong>{' '}
                  {new Date(patient.registrationDate).toLocaleDateString()}
                </div>
              </div>
              <div style={styles.cardActions}>
                <Link to={`/patients/${patient._id}`} style={styles.viewButton}>
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(patient._id, patient.name)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: 0,
  },
  registerButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#166534',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    display: 'inline-block',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  searchSection: {
    marginBottom: '2rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  patientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  noData: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#999',
    gridColumn: '1 / -1',
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    padding: '1rem',
    backgroundColor: '#334155',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    margin: 0,
    fontSize: '1.25rem',
  },
  gender: {
    fontSize: '0.875rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
  },
  cardBody: {
    padding: '1rem',
  },
  infoRow: {
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
  },
  cardActions: {
    padding: '1rem',
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid #eee',
  },
  viewButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#334155',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#991b1b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default PatientList;
