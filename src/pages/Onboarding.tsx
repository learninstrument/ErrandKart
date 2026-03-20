import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBasket, PackageCheck, MapPin } from 'lucide-react';

// Inlined Button component to ensure successful compilation
const Button = ({ children, onClick, fullWidth }: { children: React.ReactNode, onClick: () => void, fullWidth?: boolean }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-[#FF6600] text-white hover:bg-[#E65C00] shadow-lg shadow-orange-200 inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 rounded-xl py-3 px-4 text-sm ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
};

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "You Make the List",
    description: "Skip the market traffic. We source the freshest items from local markets straight to your door.",
    icon: <ShoppingBasket size={80} strokeWidth={1.5} className="text-[#FF6600]" />
  },
  {
    id: 2,
    title: "We Run the Miles",
    description: "From grocery shopping to laundry pickup and pharmacy runs. Consider it done.",
    icon: <PackageCheck size={80} strokeWidth={1.5} className="text-[#FF6600]" />
  },
  {
    id: 3,
    title: "Track Every Step",
    description: "Real-time updates and secure escrow payments. You only pay when the job is done.",
    icon: <MapPin size={80} strokeWidth={1.5} className="text-[#FF6600]" />
  }
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < ONBOARDING_DATA.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Top Bar / Skip Button */}
      <div className="flex justify-end p-6 absolute top-0 w-full z-20">
        <button 
          onClick={handleSkip}
          className="text-gray-400 font-medium text-sm hover:text-[#FF6600] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Carousel Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Graphic Circle */}
            <div className="w-64 h-64 bg-[#FFF0E5] rounded-full flex items-center justify-center mb-10 relative">
               <div className="absolute inset-0 bg-[#FF6600] opacity-5 rounded-full animate-ping"></div>
               {ONBOARDING_DATA[currentSlide].icon}
            </div>
            
            <h2 className="text-3xl font-black text-[#333333] mb-4">
              {ONBOARDING_DATA[currentSlide].title}
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
              {ONBOARDING_DATA[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 pb-12 w-full flex flex-col items-center gap-8">
        {/* Dot Indicators */}
        <div className="flex gap-2">
          {ONBOARDING_DATA.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-[#FF6600]' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full">
          <Button fullWidth onClick={handleNext}>
            {currentSlide === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};