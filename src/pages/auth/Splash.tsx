import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-black selection:bg-kart-orange selection:text-white">
      {/* Dynamic Aurora / Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-kart-orange/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[20%] -right-[10%] h-[80vh] w-[80vw] rounded-full bg-market-green/15 blur-[150px]"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px] sm:bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Animated Brand Emblem */}
        <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
            className="absolute inset-0 rounded-full border border-kart-orange/50"
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1.5 }}
            className="absolute inset-0 rounded-full border border-market-green/30"
          />
          
          {/* Center Orb */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
            className="relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl sm:rounded-[2rem] bg-black shadow-[0_0_30px_rgba(255,102,0,0.3)] sm:shadow-[0_0_40px_rgba(255,102,0,0.3)] border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-kart-orange/20 to-transparent"></div>
            <img src="/logo.png" alt="ErrandKart Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-20 brightness-0 invert" />
          </motion.div>
        </div>

        {/* Typography Sequence */}
        <div className="mt-6 sm:mt-8 overflow-hidden w-full max-w-[90vw]">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="text-center text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white"
          >
            Errand<span className="text-transparent bg-clip-text bg-gradient-to-r from-kart-orange to-[#ff8c33]">Kart</span>
          </motion.h1>
        </div>
        
        <div className="mt-3 sm:mt-4 overflow-hidden">
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            className="text-center text-xs sm:text-sm md:text-lg font-medium tracking-wide text-white/50 uppercase"
          >
            Logistics, Reimagined.
          </motion.p>
        </div>

        {/* Modern Loading Line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 150, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="mt-12 sm:mt-16 h-[2px] rounded-full bg-white/10 relative overflow-hidden sm:!w-[200px]"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-kart-orange to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};
