import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          Medical OPD System
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/patients" style={styles.link}>Patients</Link>
          <Link to="/visits" style={styles.link}>Visits</Link>
          <Link to="/prescriptions" style={styles.link}>Prescriptions</Link>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'opacity 0.2s',
  },
};

export default Navbar;
