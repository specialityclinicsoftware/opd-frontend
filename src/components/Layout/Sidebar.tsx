import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, isDoctor, isNurse, isReceptionist, logout } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isHospitalAdmin = user?.role === 'hospital_admin';
  const isAdmin = isSuperAdmin || isHospitalAdmin;

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      path: '/patients',
      label: 'Patients',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    // Super Admin - Hospital Management
    ...(isSuperAdmin ? [{
      path: '/admin/hospitals',
      label: 'Hospitals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    }] : []),
    // Admin - User Management
    ...(isAdmin ? [{
      path: '/admin/users',
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <line x1="16" y1="11" x2="22" y2="11" />
          <line x1="19" y1="8" x2="19" y2="14" />
        </svg>
      ),
    }] : []),
    // Pending Visits (for both nurses and doctors)
    ...((isNurse || isDoctor) ? [{
      path: '/visits/pending',
      label: 'Pending Visits',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    }] : []),
    // New Visit Workflow
    ...((isNurse || isDoctor) ? [{
      path: '/visits/workflow/new/pre-consultation',
      label: 'New Visit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    }] : []),

    {
      path: '/prescriptions/new',
      label: 'Prescriptions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h1 style={styles.brand}>MediCare OPD</h1>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.user}>
          <div style={styles.avatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name || 'User'}</div>
            <div style={styles.userRole}>
              {user?.role.replace('_', ' ') || 'Staff'}
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    left: 0,
    top: 0,
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logo: {
    color: '#3b82f6',
  },
  brand: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#fff',
  },
  nav: {
    flex: 1,
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    overflowY: 'auto' as const,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    borderLeft: '3px solid #3b82f6',
    fontWeight: '600',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'capitalize' as const,
  },
  logoutButton: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
};

export default Sidebar;
