import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Camera } from 'lucide-react';
import { Button } from '../UI/Button';

interface PaySellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  errandId: string;
  onSuccess: (updatedErrand: any) => void;
}

export const PaySellerModal: React.FC<PaySellerModalProps> = ({ isOpen, onClose, apiBaseUrl, errandId, onSuccess }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Bank Details, 2: Photo Upload
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && banks.length === 0) {
      fetch(`${apiBaseUrl}/api/wallet/banks`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.banks) setBanks(data.banks);
        })
        .catch(console.error);
    }
  }, [isOpen, apiBaseUrl, banks.length]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setIsResolving(true);
      setError('');
      setAccountName('');
      fetch(`${apiBaseUrl}/api/wallet/resolve-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account_number: accountNumber, bank_code: selectedBank.code })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to resolve account');
          setAccountName(data.account.account_name);
        })
        .catch(err => setError(err.message))
        .finally(() => setIsResolving(false));
    }
  }, [accountNumber, selectedBank, apiBaseUrl]);

  const handleSubmit = async () => {
    if (!accountName || !accountNumber || !selectedBank || !photoUrl) {
      setError('Please complete all fields and upload a photo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/errands/${errandId}/pay-seller-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bank_code: selectedBank.code,
          account_number: accountNumber,
          account_name: accountName,
          market_photo_url: photoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request funds');
      
      onSuccess(data.errand);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dummy upload for demo
  const handlePhotoUpload = () => {
    setPhotoUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-md rounded-t-3xl bg-white dark:bg-[#111] p-6 shadow-2xl sm:rounded-3xl h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-black dark:text-white">Pay Seller Directly</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                  Enter the seller's bank details or a POS agent's details to receive the item funds securely.
                </p>
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Select Bank</label>
                  <select 
                    className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium focus:ring-2 focus:ring-kart-orange outline-none"
                    onChange={(e) => setSelectedBank(banks.find(b => b.code === e.target.value))}
                    value={selectedBank?.code || ''}
                  >
                    <option value="">Choose a bank...</option>
                    {banks.map(bank => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Account Number</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium focus:ring-2 focus:ring-kart-orange outline-none"
                    placeholder="e.g. 0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {isResolving && <p className="text-xs font-bold text-kart-orange animate-pulse">Verifying account...</p>}
                
                {accountName && (
                  <div className="p-4 rounded-xl bg-market-green/10 border border-market-green/20 flex items-center gap-3 animate-fade-in-up">
                    <CheckCircle2 className="text-market-green" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-market-green uppercase tracking-wider">Verified Account Name</p>
                      <p className="text-sm font-black text-black dark:text-white">{accountName}</p>
                    </div>
                  </div>
                )}

                {error && <p className="text-xs font-bold text-red-500 mt-2">{error}</p>}
                
                <Button 
                  theme="orange" 
                  className="w-full mt-4" 
                  disabled={!accountName || !accountNumber || !selectedBank}
                  onClick={() => setStep(2)}
                >
                  Continue to Photo Proof
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                  Take a photo of the seller's items or shop. This will be sent to the customer for approval.
                </p>
                
                <div 
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors overflow-hidden"
                  onClick={handlePhotoUpload}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Market proof" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={32} className="text-black/40 dark:text-white/40" />
                      <span className="text-sm font-bold text-black/50 dark:text-white/50">Tap to Camera</span>
                    </>
                  )}
                </div>

                {error && <p className="text-xs font-bold text-red-500 mt-2">{error}</p>}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button theme="orange" className="flex-1" onClick={handleSubmit} isLoading={isSubmitting} disabled={!photoUrl}>
                    Send Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
