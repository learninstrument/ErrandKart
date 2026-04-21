import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBasket, PackageCheck, MapPin } from 'lucide-react';
import { Button } from '../components/UI/Button';

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'You make the list',
    description: 'Skip market traffic. Request groceries, pharmacy pickups, and daily essentials in minutes.',
    icon: <ShoppingBasket size={56} strokeWidth={1.8} className="text-kart-orange" />,
  },
  {
    id: 2,
    title: 'We run the miles',
    description: 'Trusted runners handle your errands with clear pricing, live updates, and quick turnaround.',
    icon: <PackageCheck size={56} strokeWidth={1.8} className="text-kart-orange" />,
  },
  {
    id: 3,
    title: 'Track every step',
    description: 'From pickup to dropoff, watch progress in real time and pay only when the job is completed.',
    icon: <MapPin size={56} strokeWidth={1.8} className="text-kart-orange" />,
  },
];

interface OnboardingProps {
  isDesktopSidePanel?: boolean;
}

export const Onboarding = ({ isDesktopSidePanel = false }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < ONBOARDING_DATA.length - 1) setCurrentSlide(prev => prev + 1);
    else if (isDesktopSidePanel) setCurrentSlide(0);
    else navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0d1117] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(46,139,87,0.18),transparent_48%)]" />

      <header className="relative z-20 flex items-center justify-between px-8 pt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1">
            <img src="/logo.png" alt="ErrandKart" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight">
            Errand<span className="text-kart-orange">Kart</span>
          </span>
        </div>
        {!isDesktopSidePanel && (
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            Skip
          </button>
        )}
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md text-center"
          >
            <div className="mx-auto mb-8 flex h-56 w-56 items-center justify-center rounded-[2.5rem] border border-white/10 bg-[#111822] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 text-kart-orange">
                {ONBOARDING_DATA[currentSlide].icon}
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-black text-white">{ONBOARDING_DATA[currentSlide].title}</h2>
            <p className="mx-auto max-w-xs leading-relaxed text-slate-400">
              {ONBOARDING_DATA[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-8 pb-12">
        <div className="flex gap-2">
          {ONBOARDING_DATA.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-10 bg-kart-orange' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
        <div className="w-full max-w-xs">
          <Button fullWidth onClick={handleNext}>
            {currentSlide === ONBOARDING_DATA.length - 1
              ? isDesktopSidePanel
                ? 'Start Over'
                : 'Get Started'
              : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
