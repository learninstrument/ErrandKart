import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, ShieldCheck, Timer, MapPin } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Onboarding } from '../Onboarding';

export const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'runner'>('customer');
  const navigate = useNavigate();

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'customer') navigate('/customer/dashboard');
    else navigate('/runner/dashboard');
  };

  const handleGoogleAuth = () => {
    if (role === 'customer') navigate('/customer/dashboard');
    else navigate('/runner/dashboard');
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

            {mode === 'register' && <Input label="Full Name" placeholder="John Doe" theme={theme} />}
            <Input label="Email Address" type="email" placeholder="john@example.com" theme={theme} />
            <Input label="Password" type="password" placeholder="••••••••" theme={theme} />

            {mode === 'login' && (
              <div className="mb-6 flex justify-end">
                <button type="button" className={`text-sm font-semibold transition-colors hover:underline ${accent}`}>
                  Forgot Password?
                </button>
              </div>
            )}

            <div className={mode === 'register' ? 'mt-6' : undefined}>
              <Button fullWidth type="submit" theme={theme}>
                {mode === 'login' ? 'Log In' : 'Create Account'}
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

          <Button variant="outline" fullWidth type="button" onClick={handleGoogleAuth}>
            {mode === 'login'
              ? `Log in as ${role === 'runner' ? 'Runner' : 'Customer'} with Google`
              : `Sign up as ${role === 'runner' ? 'Runner' : 'Customer'} with Google`}
          </Button>

          <div className="mt-8 text-center">
            <span className="text-slate-400 text-sm">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
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
