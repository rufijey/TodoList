import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../../entities/user/api';
import { CheckCircle, AlertTriangle, Loader2, LogIn } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const verifyStarted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    if (verifyStarted.current) return;
    verifyStarted.current = true;
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;
    try {
      await verifyEmail(token);
      setStatus('success');
      setMessage('Your email address has been successfully verified! You can now log in to your account.');
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.data?.message || 'Verification link is invalid or has expired.';
      setMessage(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass text-center flex flex-col items-center justify-center py-12">
        <div className="auth-logo">
          {status === 'loading' && (
            <Loader2 className="logo-icon animate-spin mb-4 text-primary" size={64} />
          )}
          {status === 'success' && (
            <CheckCircle className="logo-icon text-success mb-4" size={64} />
          )}
          {status === 'error' && (
            <AlertTriangle className="logo-icon text-danger mb-4" size={64} />
          )}
          
          <h2>{status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}</h2>
          <p className="auth-subtitle mb-8 px-4" style={{ whiteSpace: 'pre-line' }}>{message}</p>
        </div>

        {status !== 'loading' && (
          <Link to="/login" className="btn btn-primary btn-block btn-animate mt-6 flex items-center justify-center gap-2">
            <LogIn size={18} />
            <span>Go to Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};
