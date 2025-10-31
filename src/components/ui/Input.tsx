import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const FormGroup = ({ children, label, htmlFor, required, error, helpText }: FormGroupProps) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {helpText && !error && <div className={styles.helpText}>{helpText}</div>}
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

const Input = ({ error, label, className = '', ...props }: InputProps) => {
  const classes = [
    styles.input,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // If label is provided, wrap in FormGroup for backward compatibility
  if (label) {
    return (
      <FormGroup label={label} htmlFor={props.id} required={props.required}>
        <input className={classes} {...props} />
      </FormGroup>
    );
  }

  return <input className={classes} {...props} />;
};

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = ({ error, className = '', ...props }: TextAreaProps) => {
  const classes = [
    styles.textarea,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <textarea className={classes} {...props} />;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: Array<{ value: string | number; label: string }>;
}

export const Select = ({ error, options, children, className = '', ...props }: SelectProps) => {
  const classes = [
    styles.select,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select className={classes} {...props}>
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  );
};

export default Input;
