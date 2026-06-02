import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, FileCheck2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';

export const SupermarketRegister: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Supermarket Registration</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-6 md:px-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kart-orange/15 text-kart-orange">
              <Store size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Business onboarding</p>
              <h3 className="text-xl font-black text-white">Register as a verified supermarket</h3>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/70">
            Verified supermarkets can dispatch errands directly to runners with trust badges visible in admin and tracking.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">BUSINESS DETAILS</h3>
            <Input label="Business Name" placeholder="e.g., Shoprite Lekki" />
            <Input label="CAC / RC Number" placeholder="e.g., RC-9987611" />
            <Input label="Tax ID (TIN)" placeholder="e.g., TIN-445-118-09" />
            <Input label="Manager Name" placeholder="e.g., Amina Yusuf" />
            <Input label="Business Email" type="email" placeholder="dispatch@store.com" />
            <Input label="Business Phone" placeholder="+234 80..." />
            <Input label="Store Address" placeholder="Full store location for verification" />
            <TextArea label="Dispatch Operations Note" placeholder="Tell us how your dispatch team works..." rows={4} />
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">REQUIRED DOCUMENTS</h3>
              <div className="space-y-3 text-sm text-white/75">
                <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">CAC Certificate</div>
                <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">Government ID (manager)</div>
                <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">Storefront photo</div>
              </div>
              <Button variant="outline" className="mt-4 w-full gap-2">
                <FileCheck2 size={16} className="text-white/70" /> Upload documents
              </Button>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-2 text-market-green">
                <ShieldCheck size={16} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Verification flow</p>
              </div>
              <p className="mt-3 text-sm text-white/70">
                After submission, admin reviews your documents in the Supermarket Verification queue. Approved stores get a
                verified dispatch badge.
              </p>
              <Button className="mt-5 w-full" onClick={() => navigate('/login')}>
                Submit registration
              </Button>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};
