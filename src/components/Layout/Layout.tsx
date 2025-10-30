import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    padding: '2rem',
    minHeight: '100vh',
  },
};

export default Layout;
