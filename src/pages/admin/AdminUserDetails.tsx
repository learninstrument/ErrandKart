import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, ShieldCheck, FileText, Truck, Navigation } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { AdminLayout } from './AdminLayout';
import { ADMIN_ACTIVE_ERRANDS, ADMIN_USER_PROFILES } from './adminData';

export const AdminUserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { userId = '' } = useParams();
  const user = ADMIN_USER_PROFILES.find(item => item.id === userId) ?? null;

  if (!user) {
    return (
      <AdminLayout title="User Details" active="users">
        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6 text-white/70">
          User not found.
          <Button className="mt-4" onClick={() => navigate('/admin/users')}>
            Back to users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const activeErrands = ADMIN_ACTIVE_ERRANDS.filter(
    errand => errand.customerUserId === user.id || errand.runnerUserId === user.id
  );

  return (
    <AdminLayout title="Full User Profile" active="users">
      <div className="mb-6">
        <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/users')}>
          <ArrowLeft size={16} className="text-white/70" /> Back to users
        </Button>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatarUrl} alt={user.fullName} className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{user.id}</p>
              <h2 className="mt-1 text-2xl font-black text-white">{user.fullName}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {user.role}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    user.status === 'active'
                      ? 'border-market-green/40 bg-market-green/15 text-market-green'
                      : user.status === 'inactive'
                        ? 'border-white/20 bg-white/10 text-white/70'
                        : 'border-red-500/40 bg-red-500/10 text-red-300'
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-kart-orange" /> {user.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-kart-orange" /> {user.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-kart-orange" /> {user.address}, {user.city}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PROFILE INFORMATION</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Gender</span>
              <span className="font-semibold text-white">{user.gender}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Date of birth</span>
              <span className="font-semibold text-white">{user.dateOfBirth}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>State / Country</span>
              <span className="font-semibold text-white">{user.state}, {user.country}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Joined</span>
              <span className="font-semibold text-white">{user.joinedAt}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Last seen</span>
              <span className="font-semibold text-white">{user.lastSeen}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ACCOUNT SNAPSHOT</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Total errands</span>
              <span className="font-semibold text-white">{user.totalErrands}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Spend / earnings</span>
              <span className="font-semibold text-white">{user.totalSpendOrEarnings}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Wallet balance</span>
              <span className="font-semibold text-white">{user.walletBalance}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
              <span>Rating</span>
              <span className="font-semibold text-white">{user.rating}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-market-green" />
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">KYC / IDENTITY DOCUMENTS</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 text-sm text-white/70">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">NIN</p>
            <p className="mt-2 font-semibold text-white">{user.ninNumber}</p>
            <p className="mt-1 text-xs text-market-green">{user.ninStatus}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 text-sm text-white/70">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Government ID</p>
            <p className="mt-2 font-semibold text-white">{user.govIdType}</p>
            <p className="mt-1">{user.govIdNumber}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
            <img src={user.govIdFrontImage} alt="Government ID front" className="h-40 w-full object-cover" />
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">ID Front</div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
            <img src={user.govIdBackImage} alt="Government ID back" className="h-40 w-full object-cover" />
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">ID Back</div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
            <img src={user.selfieImage} alt="KYC selfie" className="h-40 w-full object-cover" />
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Selfie</div>
          </div>
        </div>
      </section>

      {user.runnerInfo && (
        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-2">
            <Truck size={16} className="text-market-green" />
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">RUNNER OPERATION DETAILS</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
              <span className="text-white/50">Vehicle Type</span>
              <p className="mt-1 font-semibold text-white">{user.runnerInfo.vehicleType}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
              <span className="text-white/50">License Plate</span>
              <p className="mt-1 font-semibold text-white">{user.runnerInfo.licensePlate}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
              <span className="text-white/50">Bank Name</span>
              <p className="mt-1 font-semibold text-white">{user.runnerInfo.bankName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
              <span className="text-white/50">Account Number</span>
              <p className="mt-1 font-semibold text-white">{user.runnerInfo.accountNumber}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center gap-2">
          <Navigation size={16} className="text-kart-orange" />
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ACTIVE ERRAND TRACKING LINKS</h3>
        </div>
        {activeErrands.length === 0 ? (
          <p className="text-sm text-white/60">No active errands for this profile right now.</p>
        ) : (
          <div className="space-y-3">
            {activeErrands.map(errand => (
              <div key={errand.orderId} className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{errand.orderId} · {errand.status}</p>
                    <p className="text-xs text-white/60">{errand.pickupAddress} → {errand.dropoffAddress}</p>
                  </div>
                  <Button variant="outline" className="text-xs" onClick={() => navigate('/admin/tracking')}>
                    Open live tracking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={16} className="text-kart-orange" />
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">EMERGENCY CONTACT</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
            <span className="text-white/50">Name</span>
            <p className="mt-1 font-semibold text-white">{user.emergencyContactName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
            <span className="text-white/50">Phone</span>
            <p className="mt-1 font-semibold text-white">{user.emergencyContactPhone}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3">
            <span className="text-white/50">Relation</span>
            <p className="mt-1 font-semibold text-white">{user.emergencyContactRelation}</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};
