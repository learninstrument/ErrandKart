import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Truck, Store } from 'lucide-react';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Onboarding } from '../Onboarding';

const resolveNextPath = (targetRole?: string | null) => {
  switch (targetRole) {
    case 'runner': return '/runner/dashboard';
    case 'admin': return '/admin/dashboard';
    case 'supermarket': return '/supermarket/register';
    case 'customer':
    default: return '/customer/dashboard';
  }
};

export const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [role, setRole] = useState<'customer' | 'runner'>('customer');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:4000');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('oauth_error');
    const oauthErrorDescription = params.get('oauth_error_description');
    const oauthProvider = params.get('oauth_provider');
    const nextPath = params.get('next_path');

    if (oauthError) {
      setErrorMessage(oauthErrorDescription || 'Authentication failed. Please try again.');
      window.history.replaceState({}, '', '/login');
    } else if (oauthProvider && nextPath) {
      navigate(nextPath);
    }
  }, [location, navigate]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' 
        ? { email, password, full_name: fullName, phone_number: phoneNumber, role, gender }
        : { email, password, role };

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.message ?? 'Authentication failed');

      const resolvedRole = data.user?.role ?? role;
      navigate(resolveNextPath(resolvedRole));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    sessionStorage.setItem('errandkart_oauth_role', role);
    window.location.href = `${apiBaseUrl}/api/auth/google/start?role=${role}`;
  };

  const theme = role === 'runner' ? 'green' : 'orange';
  const activeColor = role === 'runner' ? 'text-market-green border-market-green/50 bg-market-green/10' : 'text-kart-orange border-kart-orange/50 bg-kart-orange/10';
  const inactiveColor = 'text-white/40 border-white/5 bg-white/5 hover:border-white/20';

  return (
    <div className="flex min-h-[100dvh] w-full bg-black text-white selection:bg-kart-orange selection:text-white">
      {/* Desktop: Left side - Reusing the beautiful animated Onboarding component! */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[50%] lg:flex-col border-r border-white/10 bg-black">
        <Onboarding isDesktopSidePanel={true} />
      </div>

      {/* Right side - Auth form */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto px-4 sm:px-6 py-8 sm:py-12 lg:w-[55%] xl:w-[50%] lg:px-16 bg-black">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-kart-orange/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-market-green/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-[440px]"
        >
          {/* Card Glass Container */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-black p-6 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center flex flex-col items-center">
              <img src="/logo.png" alt="ErrandKart" className="h-10 w-10 sm:h-14 sm:w-14 object-contain brightness-0 invert mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white mb-1.5 sm:mb-2">
                {mode === 'login' ? 'Welcome Back.' : mode === 'register' ? 'Join the Network.' : 'Reset Password.'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-white/50 px-2">
                {mode === 'login' ? 'Enter your credentials to continue.' : 'Create your account to start moving.'}
              </p>
            </div>

            <form onSubmit={handleAuthAction}>
              {/* Custom Animated Pill Role Switcher */}
              {mode !== 'forgot_password' && (
                <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-2 sm:gap-3 p-1 rounded-2xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 sm:py-3 transition-all duration-300 border ${role === 'customer' ? activeColor : inactiveColor}`}
                  >
                    <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('runner')}
                    className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 sm:py-3 transition-all duration-300 border ${role === 'runner' ? activeColor : inactiveColor}`}
                  >
                    <Truck className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Runner</span>
                  </button>
                </div>
              )}

              {/* Form Fields */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 sm:space-y-4 mb-3 sm:mb-4"
                  >
                    <Input label="Full Name" placeholder="John Doe" theme={theme} value={fullName} onChange={e => setFullName(e.target.value)} required />
                    <Input label="Phone Number" placeholder="+234 80..." theme={theme} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/[^\d+]/g, '').slice(0, 12))} />
                    <div className="mb-4">
                      <label className="mb-1.5 sm:mb-2 ml-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} required className="w-full appearance-none rounded-xl sm:rounded-2xl border border-white/20 bg-black px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] text-white outline-none transition-all focus:ring-1 focus:border-white/40">
                        <option value="" disabled className="text-black bg-white">Select Gender</option>
                        <option value="Male" className="text-black bg-white">Male</option>
                        <option value="Female" className="text-black bg-white">Female</option>
                        <option value="Prefer not to say" className="text-black bg-white">Prefer not to say</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 sm:space-y-4">
                <Input label="Email Address" type="email" placeholder="john@example.com" theme={theme} value={email} onChange={e => setEmail(e.target.value)} required />
                
                {mode !== 'forgot_password' && (
                  <div>
                    <Input label="Password" type="password" placeholder="••••••••" theme={theme} value={password} onChange={e => setPassword(e.target.value)} required />
                    {mode === 'register' && password.length > 0 && (
                      <div className="-mt-1 mb-2 px-1 flex flex-wrap gap-x-3 gap-y-1">
                        {[
                          { label: '8+ chars', pass: password.length >= 8 },
                          { label: 'Uppercase', pass: /[A-Z]/.test(password) },
                          { label: 'Lowercase', pass: /[a-z]/.test(password) },
                          { label: 'Number', pass: /[0-9]/.test(password) },
                        ].map(rule => (
                          <span key={rule.label} className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${ rule.pass ? 'text-market-green' : 'text-white/30' }`}>
                            <span>{rule.pass ? '✓' : '○'}</span>{rule.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="mt-3 sm:mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4 text-xs sm:text-sm font-medium text-red-400">
                  {errorMessage}
                </div>
              )}

              {mode === 'login' && (
                <div className="mt-3 sm:mt-4 flex justify-end">
                  <button type="button" onClick={() => setMode('forgot_password')} className={`text-[11px] sm:text-xs font-bold transition-colors hover:underline ${role === 'runner' ? 'text-market-green' : 'text-kart-orange'}`}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button fullWidth type="submit" theme={theme} disabled={isSubmitting} className="mt-6 sm:mt-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-widest uppercase rounded-xl">
                {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Footer / Social Auth */}
            {mode === 'forgot_password' ? (
              <div className="mt-6 sm:mt-8 text-center">
                <button onClick={() => setMode('login')} className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/40 hover:text-white transition-colors">
                  <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back to login
                </button>
              </div>
            ) : (
              <>
                <div className="my-6 sm:my-8 flex items-center gap-3 sm:gap-4">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/30">Or continue with</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <button type="button" onClick={handleGoogleAuth} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl border border-white/20 bg-white/5 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign in with Google
                </button>

                <div className="mt-6 sm:mt-8 text-center">
                  <span className="text-xs sm:text-sm font-medium text-white/40">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
                  <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMessage(null); }} className={`text-xs sm:text-sm font-bold hover:underline ${role === 'runner' ? 'text-market-green' : 'text-kart-orange'}`}>
                    {mode === 'login' ? 'Register' : 'Log in'}
                  </button>
                </div>
                
                {/* Supermarket Banner */}
                <button onClick={() => navigate('/supermarket/register')} className="mt-6 sm:mt-8 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] p-3 sm:p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/5 text-white/60">
                      <Store className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">Register Supermarket</p>
                      <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5">Apply for a verified merchant account</p>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
