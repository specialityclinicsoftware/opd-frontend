import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { Button, Input, Alert, Card } from '../../components/ui';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Update auth context
        login(user);


        // Redirect based on role
        if (user.role === 'doctor') {
          navigate('/visits/pending');
        } else if (user.role === 'nurse') {
          navigate('/visits/workflow/new/pre-consultation');
        } else if (user.role === 'hospital_admin' || user.role === 'super_admin') {
          navigate('/');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Medical System</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && <Alert type="error">{error}</Alert>}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.loginFooter}>
          <p>Two-Stage Sequential Consultation Flow</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
