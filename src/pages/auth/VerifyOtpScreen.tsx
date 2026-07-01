import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

const resolveNextPath = (targetRole?: string | null) => {
  switch (targetRole) {
    case 'runner':
      return '/runner/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'supermarket':
      return '/supermarket/register';
    case 'customer':
    default:
      return '/customer/dashboard';
  }
};

export const VerifyOtpScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email and role passed from the LoginScreen router state
  const email = location.state?.email as string | undefined;
  const role = location.state?.role as 'customer' | 'runner' | undefined;
  const initialVerifier = location.state?.codeVerifier as string | undefined;
  const initialVerifierKey = location.state?.verifierKey as string | undefined;

  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes cooldown
  const [currentVerifier, setCurrentVerifier] = useState(initialVerifier);
  const [currentVerifierKey, setCurrentVerifierKey] = useState(initialVerifierKey);
  
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:4000');

  // Redirect back to login if someone accesses this page directly without an email
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendTimer]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          code: otpCode, 
          token: otpCode, 
          type: 'signup',
          codeVerifier: currentVerifier,
          verifierKey: currentVerifierKey
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message ?? 'Verification failed. Please check your code.');
      }
      
      const resolvedRole = data.user?.role ?? role ?? 'customer';
      navigate(data.nextPath ?? resolveNextPath(resolvedRole));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendTimer > 0) return;
    
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpCode('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, type: 'signup' }),
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to resend verification email');
      }
      
      if (data.codeVerifier && data.verifierKey) {
        setCurrentVerifier(data.codeVerifier);
        setCurrentVerifierKey(data.verifierKey);
      }

      setSuccessMessage('A new verification code has been sent to your email.');
      setResendTimer(120); // Reset timer back to 2 minutes
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend email';
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  const theme = role === 'runner' ? 'green' : 'orange';
  const accentText = role === 'runner' ? 'text-market-green' : 'text-kart-orange';
  const accentBg = role === 'runner' ? 'bg-market-green/15' : 'bg-kart-orange/15';

  if (!email) return null; // Wait for redirect

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0c0f14] px-6 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111822] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        
        <button 
          onClick={() => navigate('/login')}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div className="mb-8 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${accentBg} ${accentText}`}>
            <Mail size={32} />
          </div>
          <h2 className="mb-2 text-3xl font-black text-white">Check your email</h2>
          <p className="font-medium text-slate-400">
            We sent a 6-digit verification code to <br/>
            <span className="font-bold text-white">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp}>
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            theme={theme}
            value={otpCode}
            onChange={event => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-2xl border border-market-green/40 bg-market-green/10 px-4 py-3 text-sm text-market-green">
              {successMessage}
            </div>
          )}

          <div className="mt-6">
            <Button fullWidth type="submit" theme={theme} disabled={isSubmitting || otpCode.length < 6}>
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <span className="text-slate-400 text-sm">Didn't receive the code? </span>
          {resendTimer > 0 ? (
            <span className="text-sm font-bold text-slate-500">
              Resend in {formatTime(resendTimer)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className={`text-sm font-bold transition-colors hover:underline ${accentText}`}
            >
              {isResending ? 'Sending...' : 'Click to resend'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};