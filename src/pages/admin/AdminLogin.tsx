import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f14] px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111822] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 p-2">
            <img src="/logo.png" alt="ErrandKart" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Sign In</h1>
          <p className="mt-2 text-sm text-white/60">
            Secure access to the ErrandKart operations console.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input label="Admin Email" type="email" placeholder="admin@errandkart.com" />
          <Input label="Password" type="password" placeholder="••••••••" />

          <div className="mt-6 flex items-center justify-between text-sm text-white/60">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded accent-kart-orange" />
              Remember me
            </label>
            <button type="button" className="text-kart-orange hover:underline">
              Forgot password?
            </button>
          </div>

          <Button fullWidth className="mt-6 gap-2" type="submit">
            <ShieldCheck size={16} /> Access Admin
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f141f] p-4 text-xs text-white/60">
          Only authorized admins can access this portal. If you need access, contact a super admin.
        </div>
      </div>
    </div>
  );
};
