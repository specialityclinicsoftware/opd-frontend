import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { visitService } from '../../services';

const VisitEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadVisit(id);
    }
  }, [id]);

  const loadVisit = async (visitId: string) => {
    try {
      setLoading(true);
      const response = await visitService.getById(visitId);
      // Visit loaded successfully
      // For now, just show a message - full edit functionality can be added later
      setError('Visit editing functionality coming soon. Visit ID: ' + visitId);
    } catch (err) {
      setError('Failed to load visit');
      console.error('Load visit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading visit...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Visit</h1>
      <div style={styles.message}>
        {error || 'Visit editing functionality can be implemented similar to VisitNew component.'}
      </div>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        Go Back
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#2c3e50',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  message: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '1.5rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  backButton: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default VisitEdit;
