import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0e13]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.3),transparent_46%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(46,139,87,0.2),transparent_48%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center px-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
        >
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-2xl border border-kart-orange/30"></div>
            <div className="absolute inset-2 rounded-xl bg-kart-orange"></div>
            <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white"></div>
            <div className="absolute right-2 top-2 h-3 w-3 rounded-full border border-white/70"></div>
          </div>
        </motion.div>

        <h1 className="mb-2 text-5xl font-black tracking-tight text-white md:text-6xl">
          Errand<span className="text-kart-orange">Kart</span>
        </h1>
        <p className="max-w-sm font-medium tracking-wide text-white/75">
          Premium errand fulfillment with trusted runners on demand.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          <span className="h-2 w-2 animate-pulse rounded-full bg-market-green"></span>
          Always on, always moving
        </div>
      </motion.div>
    </div>
  );
};