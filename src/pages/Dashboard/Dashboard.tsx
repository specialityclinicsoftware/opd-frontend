import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService, visitService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const { user } = useAuth();
  const hospitalId = user?.hospitalId;

  // Fetch all patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientService.getAll();
      return response.data || [];
    },
  });

  // Fetch recent visits using the new API
  const { data: recentVisitsResponse, isLoading: visitsLoading } = useQuery({
    queryKey: ['recentVisits', hospitalId],
    queryFn: () => visitService.getRecentVisits(hospitalId!),
    enabled: !!hospitalId,
  });

  const loading = patientsLoading || visitsLoading;
  const recentVisits = recentVisitsResponse?.data || [];

  // Calculate stats from recent visits
  const today = new Date().toDateString();
  const todayVisits = recentVisits.filter(
    (v) => new Date(v.visitDate).toDateString() === today
  ).length;
  const pendingVisits = recentVisits.filter((v) => v.status === 'pending').length;
  const completedVisits = recentVisits.filter((v) => v.status === 'completed').length;

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    try {
      const response = await patientService.searchByPhone(searchPhone);
      if (response.data) {
        window.location.href = `/patients/${response.data._id}`;
      }
    } catch (err) {
      alert('Patient not found');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/patients/register" className={styles.actionButton}>
            + New Patient
          </Link>
          <Link to="/visits/workflow/new/pre-consultation" className={styles.actionButton}>
            + New Visit
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Patients</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>{patients.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '0.5rem' }}>Today's Visits</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#3b82f6' }}>{todayVisits}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '0.5rem' }}>Pending</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#f59e0b' }}>{pendingVisits}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '0.5rem' }}>Completed</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#10b981' }}>{completedVisits}</div>
        </div>
      </div>

      {/* Quick Search */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search patient by phone number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              padding: '0.625rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              outline: 'none',
            }}
          />
          <button onClick={handleSearch} style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            Search
          </button>
        </div>
      </div>

      {/* Recent Visits */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>Recent Visits</h2>
        {recentVisits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No visits recorded yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Patient</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Phone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Doctor</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Complaints</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => {
                  const patient = typeof visit.patientId === 'object' ? visit.patientId : null;
                  const patientIdString = typeof visit.patientId === 'string' ? visit.patientId : visit.patientId?._id;

                  return (
                    <tr key={visit._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>
                        {new Date(visit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#1e293b', fontWeight: '500' }}>
                        {patient?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>
                        {patient?.phoneNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>{visit.consultingDoctor || 'N/A'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: visit.status === 'completed' ? '#dcfce7' : '#dbeafe',
                          color: visit.status === 'completed' ? '#166534' : '#1e40af',
                        }}>
                          {visit.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {visit.chiefComplaints || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <Link
                          to={`/patients/${patientIdString}`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
