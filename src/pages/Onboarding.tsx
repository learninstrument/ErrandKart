import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Map, ShieldCheck } from 'lucide-react';

const SLIDES = [
  {
    id: 'request',
    title: 'Errands on Autopilot.',
    subtitle: 'From market runs to pharmacy pickups. Enter your list, and our elite runner network handles the rest instantly.',
    icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-kart-orange" />,
    accent: 'bg-kart-orange',
    accentLight: 'bg-kart-orange/20',
  },
  {
    id: 'track',
    title: 'Surgical Precision.',
    subtitle: 'Watch your delivery unfold in real-time on our high-fidelity map. No guessing, just perfect ETA tracking.',
    icon: <Map className="w-5 h-5 sm:w-6 sm:h-6 text-market-green" />,
    accent: 'bg-market-green',
    accentLight: 'bg-market-green/20',
  },
  {
    id: 'secure',
    title: 'Absolute Security.',
    subtitle: 'Payments are held securely in escrow. Funds are only released when your items are safely in your hands.',
    icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />,
    accent: 'bg-sky-400',
    accentLight: 'bg-sky-400/20',
  }
];

export const Onboarding = ({ isDesktopSidePanel = false }: { isDesktopSidePanel?: boolean }) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className={`relative flex flex-col items-center overflow-x-hidden bg-black text-white ${isDesktopSidePanel ? 'h-full w-full justify-center' : 'min-h-[100dvh] w-full'}`}>
      {/* Background Environment */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 ${slide.accentLight} blur-[100px] lg:blur-[150px] pointer-events-none`}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      </div>

      {/* Top Header (Mobile, iPad, & Standalone Desktop) */}
      {!isDesktopSidePanel && (
        <header className="absolute top-6 sm:top-8 left-4 right-4 sm:left-6 sm:right-6 lg:left-12 lg:right-12 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 brightness-0 invert" />
            <span className="text-lg sm:text-xl font-black tracking-tight text-white hidden sm:block">ErrandKart</span>
          </div>
          <button onClick={() => navigate('/login')} className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Skip to Login
          </button>
        </header>
      )}

      {/* Main Content Area - Shifted breakpoint to `lg` for true tablet optimization */}
      <div className={`relative z-10 w-full max-w-7xl flex-1 px-4 sm:px-6 py-20 sm:py-24 lg:py-12 lg:px-12 
        ${isDesktopSidePanel 
          ? 'flex flex-col items-center justify-center gap-6 sm:gap-8' 
          : 'grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center lg:h-full lg:min-h-[80vh]'}`}>
        
        {/* Mobile App Mockup/Visualizer */}
        <div className={`flex w-full items-center justify-center ${isDesktopSidePanel ? 'order-1' : 'lg:order-2 order-1'} mt-4 sm:mt-0`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 40, opacity: 0, rotateX: 20 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -40, opacity: 0, rotateX: -20 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              className="relative aspect-[9/16] w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] rounded-[2rem] sm:rounded-[2.5rem] border-[4px] sm:border-[6px] border-[#1a1a1a] bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)] lg:shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{ transformPerspective: 1000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black">
                <div className="absolute top-0 w-full px-4 sm:px-6 pt-6 sm:pt-10 pb-3 sm:pb-4 border-b border-white/10">
                  <div className="h-3 sm:h-4 w-1/3 bg-white/20 rounded-full"></div>
                </div>
                
                <div className="absolute top-16 sm:top-24 bottom-4 sm:bottom-6 left-3 sm:left-4 right-3 sm:right-4 flex flex-col gap-3 sm:gap-4">
                  {active === 0 && (
                    <>
                      <div className="h-20 sm:h-28 lg:h-32 w-full rounded-xl sm:rounded-2xl bg-kart-orange/10 border border-kart-orange/30 flex flex-col justify-end p-3 sm:p-4">
                         <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-kart-orange mb-1.5 sm:mb-2"></div>
                         <div className="h-1.5 sm:h-2 w-1/2 bg-white/60 rounded-full"></div>
                      </div>
                      <div className="h-12 sm:h-16 w-full rounded-xl sm:rounded-2xl bg-white/10 flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
                         <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white/20"></div>
                         <div className="h-1.5 sm:h-2 w-1/3 bg-white/40 rounded-full"></div>
                      </div>
                      <div className="h-12 sm:h-16 w-full rounded-xl sm:rounded-2xl bg-white/10"></div>
                    </>
                  )}
                  {active === 1 && (
                    <div className="relative h-full w-full rounded-xl sm:rounded-2xl bg-[#111] border border-white/10 overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M10,80 Q30,20 50,50 T90,20" fill="none" stroke="#2e8b57" strokeWidth="2"></path></svg>
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-market-green rounded-full shadow-[0_0_15px_#2e8b57]"></div>
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 h-12 sm:h-16 bg-black/90 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10"></div>
                    </div>
                  )}
                  {active === 2 && (
                    <div className="flex h-full flex-col items-center justify-center gap-4 sm:gap-6">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-sky-400/10 border border-sky-400/30 flex items-center justify-center">
                        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-sky-400 shadow-[0_0_20px_#38bdf8] sm:shadow-[0_0_30px_#38bdf8]"></div>
                      </div>
                      <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/40 rounded-full"></div>
                      <div className="h-12 sm:h-16 w-full bg-white/10 rounded-lg sm:rounded-xl border border-white/20 mt-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text & Controls */}
        <div className={`flex w-full flex-col z-20 
          ${isDesktopSidePanel 
            ? 'order-2 items-center text-center mt-4 sm:mt-6' 
            : 'order-2 lg:order-1 items-center text-center lg:items-start lg:text-left mt-6 sm:mt-8 lg:mt-0'}`}>
          
          {/* Constrain height to prevent layout jumps. Taller on mobile to fit long text */}
          <div className="relative h-[200px] sm:h-[180px] lg:h-[220px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-0 flex flex-col w-full 
                  ${isDesktopSidePanel ? 'items-center' : 'items-center lg:items-start'}`}
              >
                <div className={`mb-4 sm:mb-6 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-[14px] sm:rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl`}>
                  {slide.icon}
                </div>
                <h2 className="mb-2 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight">
                  {slide.title}
                </h2>
                <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-white/50 leading-relaxed 
                  ${isDesktopSidePanel ? 'max-w-xs sm:max-w-md mx-auto' : 'max-w-[16rem] sm:max-w-md md:max-w-lg mx-auto lg:mx-0'}`}>
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className={`mt-4 sm:mt-8 flex items-center justify-between w-full 
            ${isDesktopSidePanel ? 'flex-col gap-4 sm:gap-6 justify-center' : 'flex-row lg:justify-start px-4 sm:px-0'}`}>
            
            <div className={`flex gap-2 sm:gap-3 ${isDesktopSidePanel ? 'justify-center' : 'justify-center lg:justify-start'}`}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                    i === active ? `w-8 sm:w-12 ${SLIDES[i].accent}` : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Mobile Only Next Button */}
            {!isDesktopSidePanel && (
              <button
                onClick={() => {
                  if (active === SLIDES.length - 1) {
                    navigate('/login');
                  } else {
                    setActive((prev) => (prev + 1) % SLIDES.length);
                  }
                }}
                className="group flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 active:scale-95 lg:hidden"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
