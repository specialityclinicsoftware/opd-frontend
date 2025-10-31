import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services';
// Patient type imported for future use

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch patients (all or search results)
  const { data: patients = [], isLoading: loading } = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.trim()) {
        const response = await patientService.search(debouncedSearch);
        return response.data || [];
      } else {
        const response = await patientService.getAll();
        return response.data || [];
      }
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

  if (loading) {
    return <div style={styles.loading}>Loading patients...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Patient Management</h1>
        <Link to="/patients/register" style={{
          padding: '0.625rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '500',
        }}>
          + New Patient
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {loading && searchTerm && (
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#3b82f6',
              fontSize: '0.875rem',
            }}>
              Searching...
            </div>
          )}
        </div>
      </div>

      {/* Patient Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            {searchTerm ? 'No patients found' : 'No patients registered yet'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Age</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Gender</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Address</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Registered</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>
                      {patient.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {patient.age || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {patient.gender}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {patient.phoneNumber}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {patient.address || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {new Date(patient.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link
                          to={`/patients/${patient._id}`}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                          }}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(patient._id, patient.name)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
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
    backgroundColor: 'rgb(59, 130, 246)',
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
    backgroundColor: 'rgb(59, 130, 246)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
    boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)',
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
