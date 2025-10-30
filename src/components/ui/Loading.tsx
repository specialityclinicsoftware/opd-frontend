import styles from './Loading.module.css';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loading = ({ text = 'Loading...', size = 'medium' }: LoadingProps) => {
  const classes = [
    styles.container,
    size !== 'medium' && styles[size],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>{text}</div>
    </div>
  );
};

export default Loading;
