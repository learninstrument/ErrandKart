import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Truck, ShieldCheck, Timer, MapPin, Store } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Onboarding } from '../Onboarding';

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

export const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'runner'>('customer');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

  const fallbackNextPath = resolveNextPath(role);

  const persistSession = (accessToken: string, refreshToken: string, expiresAt?: number | null) => {
    localStorage.setItem(
      'errandkart_session',
      JSON.stringify({
        accessToken,
        refreshToken,
        expiresAt: expiresAt ?? null,
      })
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    if (verified) {
      setSuccessMessage('Email verified. Please log in.');
    }
    const oauthError = params.get('oauth_error') ?? params.get('error');
    const oauthErrorDescription = params.get('oauth_error_description') ?? params.get('error_description');
    if (oauthError) {
      setErrorMessage(oauthErrorDescription ?? 'Google authentication failed. Please try again.');
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresAtParam = params.get('expires_at');
    const oauthProvider = params.get('oauth_provider');
    const nextPath = params.get('next_path');
    const oauthRole = params.get('role') ?? sessionStorage.getItem('errandkart_oauth_role');
    const expiresAt = expiresAtParam ? Number(expiresAtParam) : null;

    if (oauthProvider === 'google' && accessToken && refreshToken) {
      persistSession(accessToken, refreshToken, Number.isNaN(expiresAt) ? null : expiresAt);
      sessionStorage.removeItem('errandkart_oauth_role');
      navigate(nextPath ?? resolveNextPath(oauthRole) ?? fallbackNextPath, { replace: true });
    }
  }, [location.search, navigate, fallbackNextPath]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setVerificationMessage(null);

    if (mode === 'register' && fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          mode === 'register'
            ? {
                email,
                password,
                full_name: fullName,
                phone_number: phoneNumber || undefined,
                role,
              }
            : {
                email,
                password,
              }
        ),
      });

      const data = await response.json().catch(() => ({}));

      if (data.verificationRequired) {
        setVerificationEmail(data.email ?? email);
        setVerificationMessage('Check your email for a verification link before logging in.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Authentication failed');
      }

      const session = data.session ?? {};
      const accessToken = session.accessToken ?? session.access_token;
      const refreshToken = session.refreshToken ?? session.refresh_token;
      const expiresAt = session.expiresAt ?? session.expires_at ?? null;
      if (accessToken && refreshToken) {
        persistSession(accessToken, refreshToken, expiresAt);
      }

      const resolvedRole = data.user?.role ?? role;
      navigate(data.nextPath ?? resolveNextPath(resolvedRole) ?? fallbackNextPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = verificationEmail ?? email;
    if (!targetEmail) {
      setErrorMessage('Please enter your email address first.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to resend verification email');
      }
      setVerificationMessage('Verification email sent. Check your inbox.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleAuth = () => {
    setErrorMessage(null);
    sessionStorage.setItem('errandkart_oauth_role', role);
    window.location.href = `${apiBaseUrl}/api/auth/google/start?role=${role}`;
  };

  const theme = role === 'runner' ? 'green' : 'orange';
  const accent = role === 'runner' ? 'text-market-green' : 'text-kart-orange';
  const cardAccent = role === 'runner' ? 'bg-market-green' : 'bg-kart-orange';
  const accentIcon = role === 'runner' ? 'text-market-green' : 'text-kart-orange';

  return (
    <div className="flex min-h-screen w-full bg-[#0c0f14]">
      <div className="relative hidden md:flex md:w-1/2 md:flex-col">
        <Onboarding isDesktopSidePanel={true} />
      </div>

      <div className="flex w-full items-center justify-center overflow-y-auto px-6 py-10 md:w-1/2">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111822] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="mb-8 text-center md:text-left">
            <div
              className={`mx-auto mb-6 flex h-12 w-12 -rotate-6 items-center justify-center rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition-colors duration-300 md:mx-0 ${cardAccent}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 p-1 shadow-sm">
                <img src="/logo.png" alt="ErrandKart" className="h-full w-full object-contain" />
              </div>
            </div>
            <h2 className="mb-2 text-3xl font-black text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="font-medium text-slate-400">
              {mode === 'login'
                ? 'Sign in to continue with ErrandKart.'
                : 'Start your errand journey in under a minute.'}
            </p>
          </div>

          <form onSubmit={handleAuthAction}>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  role === 'customer'
                    ? 'border-kart-orange bg-kart-orange/15'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div
                  className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                    role === 'customer' ? 'bg-kart-orange text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <User size={18} />
                </div>
                <p className="text-sm font-bold text-white">Customer</p>
                <p className="mt-0.5 text-[11px] text-slate-400">I need errands run</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('runner')}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  role === 'runner'
                    ? 'border-market-green bg-market-green/15'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div
                  className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                    role === 'runner' ? 'bg-market-green text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <Truck size={18} />
                </div>
                <p className="text-sm font-bold text-white">Runner</p>
                <p className="mt-0.5 text-[11px] text-slate-400">I want to run errands</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/supermarket/register')}
              className="mb-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                  <Store size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Register Supermarket Business</p>
                  <p className="text-[11px] text-slate-400">Apply for verified dispatch account</p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-kart-orange">Apply</span>
            </button>

            {mode === 'register' && (
              <>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  theme={theme}
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+234 80..."
                  theme={theme}
                  value={phoneNumber}
                  onChange={event => setPhoneNumber(event.target.value)}
                />
              </>
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              theme={theme}
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              theme={theme}
              value={password}
              onChange={event => setPassword(event.target.value)}
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

            {verificationMessage && (
              <div className="mb-4 rounded-2xl border border-kart-orange/40 bg-kart-orange/10 px-4 py-3 text-sm text-kart-orange">
                <p>{verificationMessage}</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="mb-6 flex justify-end">
                <button type="button" className={`text-sm font-semibold transition-colors hover:underline ${accent}`}>
                  Forgot Password?
                </button>
              </div>
            )}

            <div className={mode === 'register' ? 'mt-6' : undefined}>
              <Button fullWidth type="submit" theme={theme} disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f141f] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Why ErrandKart</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Live tracking', icon: <MapPin size={16} className={accentIcon} /> },
                { label: 'Secure payments', icon: <ShieldCheck size={16} className={accentIcon} /> },
                { label: 'Fast matching', icon: <Timer size={16} className={accentIcon} /> },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#111822] px-3 py-3 text-xs font-semibold text-white/70"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#111822] px-4 font-medium text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" fullWidth type="button" onClick={handleGoogleAuth} disabled={isSubmitting}>
            {mode === 'login'
              ? `Log in as ${role === 'runner' ? 'Runner' : 'Customer'} with Google`
              : `Sign up as ${role === 'runner' ? 'Runner' : 'Customer'} with Google`}
          </Button>

          <div className="mt-8 text-center">
            <span className="text-slate-400 text-sm">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
                setVerificationEmail(null);
                setVerificationMessage(null);
                setSuccessMessage(null);
              }}
              className={`text-sm font-bold transition-colors hover:underline ${accent}`}
            >
              {mode === 'login' ? 'Register' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
