import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../entities/user/model/store';
import { LogIn, UserPlus, CheckCircle, Mail, Lock } from 'lucide-react';
import { ROUTES } from '../../../shared/config/routes';
import styles from './AuthForm.module.css';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const { signup, error, setError } = useAuthStore();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    setError(null);
    setIsRegistered(false);
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (!email || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      setIsRegistered(true);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className={styles.authContainer}>
        <div className={`${styles.authCard} glass text-center`}>
          <div className={styles.authLogo}>
            <CheckCircle className={`${styles.logoIcon} text-success mb-4`} size={48} />
            <h2>Success!</h2>
            <p className={styles.authSubtitle}>Please verify your email address</p>
          </div>
          <div className="alert alert-success glass-alert mb-6">
            <span>A verification link has been sent to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.</span>
            <p style={{ marginTop: '10px', fontSize: '13px', opacity: 0.9, margin: '10px 0 0 0' }}>
              If you don't receive the email, please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="btn btn-primary btn-block btn-animate"
            onClick={() => setIsRegistered(false)}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass`}>
        <div className={styles.authLogo}>
          <CheckCircle className={`${styles.logoIcon} animate-pulse`} size={48} />
          <h2>To-Do List</h2>
          <p className={styles.authSubtitle}>Create, share, and manage your tasks</p>
        </div>

        <div className={styles.authTabs} role="tablist">
          <Link
            role="tab"
            aria-selected={false}
            className={styles.authTab}
            to={ROUTES.LOGIN}
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
          <Link
            role="tab"
            aria-selected={true}
            className={`${styles.authTab} ${styles.active}`}
            to={ROUTES.REGISTER}
          >
            <UserPlus size={18} />
            <span>Sign Up</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {(localError || error) && (
            <div className="alert alert-danger glass-alert">
              <span>{localError || error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-animate" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner">Loading...</span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
