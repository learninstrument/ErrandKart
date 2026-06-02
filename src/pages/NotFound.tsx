import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/UI/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent px-6 py-12">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111722] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-kart-orange/15 text-kart-orange">
          <AlertTriangle size={28} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="ErrandKart" className="h-9 w-9 rounded-xl border border-white/10 bg-white/10 p-1" />
          <h1 className="text-2xl font-black text-white">Page not found</h1>
        </div>
        <p className="mt-3 text-sm text-white/70">
          The page you’re looking for doesn’t exist or was moved. Use the buttons below to continue.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" onClick={() => navigate('/')}>
            Go to Home
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="text-white/70" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
