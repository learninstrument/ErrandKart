import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, ShieldCheck, UploadCloud } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';

export const SupermarketRegister: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-black text-white selection:bg-kart-orange selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kart-orange/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-market-green/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 px-4 sm:px-8 py-4 sm:py-5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 transition-colors group-hover:text-white" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="ErrandKart" className="h-6 w-6 sm:h-8 sm:w-8 brightness-0 invert" />
            <span className="text-lg sm:text-xl font-black tracking-tight text-white hidden sm:block">ErrandKart</span>
          </div>

          <div className="w-10 sm:w-12" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 sm:gap-12 px-4 sm:px-8 pb-24 pt-8 sm:pt-12">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-8 sm:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >


          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-kart-orange/10 border border-kart-orange/30 text-kart-orange shadow-[0_0_30px_rgba(255,102,0,0.2)]">
              <Store className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <p className="mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-kart-orange">Business Onboarding</p>
            <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight">
              Register as a Verified Merchant.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed max-w-xl">
              Verified supermarkets can directly request elite runners for bulk dispatches, track orders via the admin dashboard, and earn the exclusive "Verified Merchant" badge.
            </p>
          </div>
        </motion.section>

        {/* Form Layout */}
        <section className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column: Business Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-6 sm:gap-8 rounded-[2rem] border border-white/10 bg-black/50 p-6 sm:p-10 backdrop-blur-md"
          >
            <div>
              <h3 className="text-sm font-black tracking-widest text-white/40 uppercase mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                Business Details
              </h3>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input label="Registered Business Name" placeholder="e.g., Shoprite Lekki Ltd." theme="orange" />
                </div>
                <Input label="CAC / RC Number" placeholder="e.g., RC-9987611" theme="orange" />
                <Input label="Tax ID (TIN)" placeholder="e.g., TIN-445-118-09" theme="orange" />
                <Input label="Store Manager Name" placeholder="e.g., Amina Yusuf" theme="orange" />
                <Input label="Business Phone" placeholder="+234 80..." theme="orange" />
                <div className="sm:col-span-2">
                  <Input label="Corporate Email Address" type="email" placeholder="dispatch@store.com" theme="orange" />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Full Store Address" placeholder="Block 14, Admiralty Way, Lekki Phase 1" theme="orange" />
                </div>
                <div className="sm:col-span-2">
                  <TextArea label="Dispatch Operations Summary" placeholder="Briefly describe your average daily order volume and what goods you'll be dispatching most often..." rows={4} theme="orange" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Documents & Submission */}
          <div className="flex flex-col gap-6 sm:gap-8">
            
            {/* Documents Upload */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="rounded-[2rem] border border-white/10 bg-black/50 p-6 sm:p-8 backdrop-blur-md"
            >
              <h3 className="text-sm font-black tracking-widest text-white/40 uppercase mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                Required Documents
              </h3>

              <div className="space-y-3 mb-6">
                {[
                  { name: 'CAC Certificate', status: 'pending' },
                  { name: 'Government ID (Manager)', status: 'pending' },
                  { name: 'Clear Storefront Photo', status: 'pending' }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm font-medium text-white/70">{doc.name}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-kart-orange/50 animate-pulse" />
                  </div>
                ))}
              </div>

              <button className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-8 transition-all hover:border-kart-orange/50 hover:bg-kart-orange/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors group-hover:bg-kart-orange/10 group-hover:text-kart-orange">
                  <UploadCloud size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-bold text-white">Click to upload files</p>
                  <p className="text-[10px] sm:text-xs text-white/40 mt-1">PDF, JPG or PNG (max 5MB)</p>
                </div>
              </button>
            </motion.div>

            {/* Submit Action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="rounded-[2rem] border border-white/10 bg-black/50 p-6 sm:p-8 backdrop-blur-md"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-market-green/10 border border-market-green/30 text-market-green">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-market-green">Verification Flow</p>
                  <p className="text-xs text-white/50 mt-0.5">Admin approval takes 24-48hrs</p>
                </div>
              </div>
              
              <Button 
                theme="orange" 
                fullWidth 
                className="py-4 text-sm font-black tracking-widest uppercase rounded-xl"
                onClick={() => navigate('/login')}
              >
                Submit Application
              </Button>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
};
