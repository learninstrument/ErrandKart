import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Landmark } from 'lucide-react';

interface ApproveFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  errand: any;
  onSuccess: (updatedErrand: any) => void;
}

export const ApproveFundsModal: React.FC<ApproveFundsModalProps> = ({ isOpen, onClose, apiBaseUrl, errand, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !errand) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/errands/${errand.id}/pay-seller-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve funds');
      
      onSuccess(data.errand);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-md rounded-t-3xl bg-white dark:bg-[#111] p-6 shadow-2xl sm:rounded-3xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-market-green" /> Approve Transfer
            </h2>
            <button onClick={onClose} className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            <p className="text-sm text-black/70 dark:text-white/70 mb-4">
              Your runner has requested ₦{Number(errand.budget_item_cost).toLocaleString()} to pay the seller directly. Please verify the details below.
            </p>
            
            {/* Seller Bank Details */}
            <div className="p-4 rounded-2xl bg-kart-orange/5 border border-kart-orange/20 mb-4">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-kart-orange/20 flex items-center justify-center text-kart-orange">
                  <Landmark size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Recipient</p>
                  <p className="text-sm font-black text-black dark:text-white">{errand.seller_account_name}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-black/60 dark:text-white/60">Bank</span>
                <span className="font-bold text-black dark:text-white">{errand.seller_bank_code}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-black/60 dark:text-white/60">Account Number</span>
                <span className="font-bold text-black dark:text-white">{errand.seller_account_number}</span>
              </div>
            </div>

            {/* Photo Proof */}
            {errand.market_photo_url && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Photo Proof</p>
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 relative">
                  <img src={errand.market_photo_url} alt="Market Proof" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                    <CheckCircle2 size={12} className="text-market-green" />
                    <span className="text-xs font-bold text-white">Live Photo</span>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-xs font-bold text-red-500 mb-2">{error}</p>}

          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <button
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed bg-market-green text-white' : 'bg-market-green hover:bg-market-green/90 text-white shadow-[0_0_20px_rgba(46,139,87,0.4)]'
              }`}
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Transferring...' : `Send ₦${Number(errand.budget_item_cost).toLocaleString()} to Seller`}
            </button>
            <button
              className="w-full py-4 rounded-xl font-bold border border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Reject / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
