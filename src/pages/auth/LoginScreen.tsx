import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  const theme = role === 'runner' ? 'green' : 'orange';
  const textColorClass = role === 'runner' ? 'text-[#2E8B57]' : 'text-[#FF6600]';

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-100 flex-col"><Onboarding isDesktopSidePanel={true} /></div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 text-center md:text-left">
             <img src="/logo.png" alt="ErrandKart Logo" className="h-12 w-auto mb-6 mx-auto md:mx-0 object-contain" />
             <h2 className="text-3xl font-black text-[#333333] mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
             <p className="text-gray-500 font-medium">{mode === 'login' ? 'Enter your details to access your account.' : 'Start your journey with ErrandKart.'}</p>
          </div>

          <form onSubmit={handleAuthAction}>
            <div className="flex gap-4 mb-6">
              <div onClick={() => setRole('customer')} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${role === 'customer' ? 'border-[#FF6600] bg-[#FFF0E5]' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className={`p-2 rounded-full transition-colors ${role === 'customer' ? 'bg-[#FF6600] text-white' : 'bg-gray-100 text-gray-400'}`}><User size={20} /></div>
                <div><p className="font-bold text-sm text-[#333333]">Customer</p><p className="text-[10px] text-gray-500 leading-tight mt-0.5">I need errands run</p></div>
              </div>
              <div onClick={() => setRole('runner')} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${role === 'runner' ? 'border-[#2E8B57] bg-[#EAF4ED]' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className={`p-2 rounded-full transition-colors ${role === 'runner' ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-400'}`}><Truck size={20} /></div>
                <div><p className="font-bold text-sm text-[#333333]">Runner</p><p className="text-[10px] text-gray-500 leading-tight mt-0.5">I want to run errands</p></div>
              </div>
            </div>

            {mode === 'register' && <Input label="Full Name" placeholder="John Doe" theme={theme} />}
            <Input label="Email Address" type="email" placeholder="john@example.com" theme={theme} />
            <Input label="Password" type="password" placeholder="••••••••" theme={theme} />
            
            {mode === 'login' && (
              <div className="flex justify-end mb-6"><button type="button" className={`text-sm font-bold hover:underline transition-colors ${textColorClass}`}>Forgot Password?</button></div>
            )}
            <div className={mode === 'register' ? 'mt-6' : ''}>
              <Button fullWidth onClick={() => {}} theme={theme}>{mode === 'login' ? 'Log In' : 'Create Account'}</Button>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span></div>
          </div>

          <Button variant="outline" fullWidth onClick={() => {}}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {mode === 'login' ? `Log in as ${role === 'runner' ? 'Runner' : 'Customer'} with Google` : `Sign up as ${role === 'runner' ? 'Runner' : 'Customer'} with Google`}
          </Button>

          <div className="mt-8 text-center">
            <span className="text-gray-500 text-sm">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className={`font-bold text-sm hover:underline transition-colors ${textColorClass}`}>
              {mode === 'login' ? 'Register' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
