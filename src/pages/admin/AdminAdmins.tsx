import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

const ADMINS = [
  { id: 1, name: 'Super Admin', email: 'admin@errandkart.com', role: 'Owner', status: 'Active' },
  { id: 2, name: 'Ops Lead', email: 'ops@errandkart.com', role: 'Operations', status: 'Active' },
  { id: 3, name: 'Finance', email: 'finance@errandkart.com', role: 'Finance', status: 'Pending' },
];

export const AdminAdmins: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Admin Management" active="admins">
      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ACTIVE ADMINS</h3>
            <Button variant="outline" className="gap-2 text-xs" onClick={() => navigate('/admin/activity')}>
              View activity
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {ADMINS.map(admin => (
              <div
                key={admin.id}
                className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{admin.name}</p>
                    <p className="text-xs text-white/50">{admin.email}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    {admin.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                  <ShieldCheck size={12} className="text-market-green" /> {admin.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Invite admin</p>
              <p className="text-lg font-bold text-white">Create new access</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Input label="Full Name" placeholder="Jane Doe" />
            <Input label="Email Address" type="email" placeholder="jane@errandkart.com" />
            <div>
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Role</label>
              <select className="mt-2 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25">
                <option>Operations</option>
                <option>Support</option>
                <option>Finance</option>
                <option>Compliance</option>
              </select>
            </div>
            <Button fullWidth className="gap-2">
              <UserPlus size={16} /> Send invite
            </Button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};
