import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  noPadding?: boolean;
}

const Card = ({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}: CardProps) => {
  const classes = [
    styles.card,
    variant !== 'default' && styles[variant],
    noPadding && styles.noPadding,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
}

export const CardHeader = ({ children, title, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      {title ? <h3 className={styles.title}>{title}</h3> : children}
    </div>
  );
};

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody = ({ children, className = '', ...props }: CardBodyProps) => {
  return (
    <div className={`${styles.body} ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div className={`${styles.footer} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
