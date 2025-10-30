import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService, visitService } from '../../services';
import type { Visit } from '../../types';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [searchPhone, setSearchPhone] = useState('');

  // Fetch all patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientService.getAll();
      return response.data || [];
    },
  });

  // Fetch all visits for all patients
  const { data: dashboardData, isLoading: visitsLoading } = useQuery({
    queryKey: ['dashboard-visits', patients.length],
    queryFn: async () => {
      const allVisits: Visit[] = [];

      for (const patient of patients) {
        try {
          const visitsRes = await visitService.getByPatient(patient._id);
          const visits = Array.isArray(visitsRes.data) ? visitsRes.data : [];
          allVisits.push(...visits);
        } catch (err) {
          console.error(`Error fetching visits for patient ${patient._id}:`, err);
        }
      }

      // Calculate today's visits
      const today = new Date().toDateString();
      const todayCount = allVisits.filter(
        (v) => new Date(v.visitDate).toDateString() === today
      ).length;

      // Get recent 10 visits with patient data
      const sortedVisits = allVisits
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
        .slice(0, 10);

      const visitsWithPatients = sortedVisits.map(visit => {
        const patient = patients.find(p => p._id === visit.patientId);
        return { ...visit, patient };
      });

      return {
        stats: {
          totalPatients: patients.length,
          todayVisits: todayCount,
        },
        recentVisits: visitsWithPatients,
      };
    },
    enabled: patients.length > 0, // Only run when we have patients
  });

  const loading = patientsLoading || visitsLoading;
  const stats = dashboardData?.stats || { totalPatients: 0, todayVisits: 0 };
  const recentVisits = dashboardData?.recentVisits || [];

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
      <h1 className={styles.title}>OPD Dashboard</h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalPatients}</div>
          <div className={styles.statLabel}>Total Patients</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.todayVisits}</div>
          <div className={styles.statLabel}>Today's Visits</div>
        </div>
      </div>

      {/* Quick Search */}
      <div className={styles.searchSection}>
        <h2 className={styles.sectionTitle}>Quick Patient Search</h2>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by phone number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.searchInput}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <Link to="/patients/register" className={styles.actionButton}>
            + Register New Patient
          </Link>
          <Link to="/visits/new" className={styles.actionButton}>
            + New Visit
          </Link>
        </div>
      </div>

      {/* Recent Visits */}
      <div className={styles.visitsSection}>
        <h2 className={styles.sectionTitle}>Recent Visits (Last 10)</h2>
        {recentVisits.length === 0 ? (
          <div className={styles.noData}>No visits recorded yet</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Patient Name</th>
                  <th className={styles.th}>Phone</th>
                  <th className={styles.th}>Doctor</th>
                  <th className={styles.th}>Diagnosis</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit._id} className={styles.tr}>
                    <td className={styles.td}>
                      {new Date(visit.visitDate).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                      {visit.patient?.name || 'Unknown'}
                    </td>
                    <td className={styles.td}>
                      {visit.patient?.phoneNumber || 'N/A'}
                    </td>
                    <td className={styles.td}>{visit.consultingDoctor}</td>
                    <td className={styles.td}>{visit.diagnosis || 'N/A'}</td>
                    <td className={styles.td}>
                      <Link
                        to={`/patients/${visit.patientId}`}
                        className={styles.viewLink}
                      >
                        View Patient
                      </Link>
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

export default Dashboard;
