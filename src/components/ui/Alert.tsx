import type { ReactNode } from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  children: ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
}

const Alert = ({ children, variant = 'info', title, onClose }: AlertProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const classes = [styles.alert, styles[variant]].join(' ');

  return (
    <div className={classes} role="alert">
      <span className={styles.icon}>{getIcon()}</span>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
