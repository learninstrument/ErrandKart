import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to onboarding after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kart-orange overflow-hidden relative">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* The Geometric 'K/Cart' Logo representation */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center transform -rotate-6 mb-6 shadow-2xl"
        >
          <div className="relative w-12 h-12">
            <div className="absolute left-1 top-1 bottom-1 w-2.5 bg-kart-orange rounded-md"></div>
            <div className="absolute right-1 top-1 w-8 h-2.5 bg-kart-orange rounded-md origin-bottom-left rotate-[-35deg] translate-y-1.5 translate-x-1"></div>
            <div className="absolute right-1 bottom-3 w-8 h-2.5 bg-kart-orange rounded-md origin-top-left rotate-[35deg] translate-y-1 translate-x-1"></div>
            {/* Wheels */}
            <div className="absolute -bottom-2 right-1 w-3.5 h-3.5 bg-asphalt-grey rounded-full border-2 border-white"></div>
            <div className="absolute -bottom-2 left-3 w-3.5 h-3.5 bg-asphalt-grey rounded-full border-2 border-white"></div>
          </div>
        </motion.div>

        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
          Errand<span className="text-asphalt-grey">Kart</span>
        </h1>
        <p className="text-white/80 font-medium tracking-wide">Your Life, Delivered.</p>
      </motion.div>
    </div>
  );
};