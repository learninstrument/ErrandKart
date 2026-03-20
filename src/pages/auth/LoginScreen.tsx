import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck } from 'lucide-react';

// FIXED: Using uppercase 'UI'
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

  const theme = role === 'runner' ? 'green' : 'orange';
  const textColorClass = role === 'runner' ? 'text-[#2E8B57]' : 'text-[#FF6600]';
  const primaryColorClass = role === 'runner' ? 'bg-[#2E8B57]' : 'bg-[#FF6600]';

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-100 flex-col"><Onboarding isDesktopSidePanel={true} /></div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 text-center md:text-left">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center transform -rotate-6 mb-6 mx-auto md:mx-0 shadow-lg transition-colors duration-300 ${primaryColorClass}`}>
                <div className="relative w-6 h-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white rounded-md"></div>
                  <div className="absolute right-0 top-0 w-4 h-1.5 bg-white rounded-md origin-bottom-left rotate-[-35deg] translate-y-0.5 translate-x-0.5"></div>
                  <div className="absolute right-0 bottom-1.5 w-4 h-1.5 bg-white rounded-md origin-top-left rotate-[35deg] translate-y-0.5 translate-x-0.5"></div>
                </div>
             </div>
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
