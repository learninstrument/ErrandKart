import React, { useEffect, useMemo, useState } from 'react';
import { Store, ShieldCheck, Clock3, Search, MapPin, Phone, Mail, FileCheck2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { AdminLayout } from './AdminLayout';
import type { AdminSupermarketProfile, SupermarketVerificationStatus } from './adminData';
import { buildAuthHeaders } from '../../utils/auth';

const STATUS_STYLES: Record<SupermarketVerificationStatus, string> = {
  pending: 'border-kart-orange/40 bg-kart-orange/10 text-kart-orange',
  verified: 'border-market-green/40 bg-market-green/10 text-market-green',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-300',
  suspended: 'border-white/20 bg-white/10 text-white/70',
};

export const AdminSupermarkets: React.FC = () => {
  const [supermarkets, setSupermarkets] = useState<AdminSupermarketProfile[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupermarketVerificationStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadSupermarkets = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/supermarkets`, {
          signal: controller.signal,
          headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message ?? 'Failed to load supermarkets');
        }

        const items = Array.isArray(data) ? data : (data.supermarkets ?? []);
        const mapped = items.map(mapSupermarket);
        if (mounted) {
          setSupermarkets(mapped);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        const message = error instanceof Error ? error.message : 'Failed to load supermarkets';
        if (mounted) {
          setErrorMessage(message);
          setSupermarkets([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSupermarkets();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiBaseUrl]);

  const filteredSupermarkets = useMemo(() => {
    return supermarkets.filter(store => {
      const matchesStatus = statusFilter === 'all' || store.verificationStatus === statusFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        store.businessName.toLowerCase().includes(query.toLowerCase()) ||
        store.managerName.toLowerCase().includes(query.toLowerCase()) ||
        store.id.toLowerCase().includes(query.toLowerCase()) ||
        store.cacNumber.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, supermarkets]);

  const pendingCount = supermarkets.filter(store => store.verificationStatus === 'pending').length;
  const verifiedCount = supermarkets.filter(store => store.verificationStatus === 'verified').length;
  const suspendedCount = supermarkets.filter(store => store.verificationStatus === 'suspended').length;

  return (
    <AdminLayout title="Supermarket Verification" active="supermarkets">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <Store size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Registered stores</p>
          <p className="mt-2 text-2xl font-black text-white">{supermarkets.length}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <Clock3 size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Pending verification</p>
          <p className="mt-2 text-2xl font-black text-white">{pendingCount}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
            <ShieldCheck size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Verified stores</p>
          <p className="mt-2 text-2xl font-black text-white">{verifiedCount}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">
            <FileCheck2 size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Suspended</p>
          <p className="mt-2 text-2xl font-black text-white">{suspendedCount}</p>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search store, manager, or CAC..."
              className="w-full rounded-2xl border border-white/10 bg-[#0f141f] py-3 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-kart-orange/25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'verified', 'rejected', 'suspended'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  statusFilter === status
                    ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 text-sm text-white/70">
            Loading supermarkets...
          </div>
        ) : errorMessage ? (
          <div className="rounded-[24px] border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : (
          filteredSupermarkets.map(store => (
            <div
              key={store.id}
              className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{store.id}</p>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[store.verificationStatus]}`}
                    >
                      {store.verificationStatus}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-white">{store.businessName}</h3>
                  <p className="text-sm text-white/60">Manager: {store.managerName}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} className="text-kart-orange" /> {store.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} className="text-kart-orange" /> {store.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-market-green" /> {store.address}, {store.city}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/65">
                  <div className="rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <p className="text-white/50">CAC Number</p>
                    <p className="mt-1 font-semibold text-white">{store.cacNumber}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <p className="text-white/50">Tax ID</p>
                    <p className="mt-1 font-semibold text-white">{store.taxId}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <p className="text-white/50">Dispatch Orders</p>
                    <p className="mt-1 font-semibold text-white">{store.dispatchOrders}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <p className="text-white/50">Active Runners</p>
                    <p className="mt-1 font-semibold text-white">{store.activeRunners}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {renderDocument(store.documents.cacCertificateImage, `${store.businessName} CAC`, 'CAC Certificate')}
                {renderDocument(store.documents.governmentIdImage, `${store.businessName} ID`, 'Government ID')}
                {renderDocument(store.documents.storefrontImage, `${store.businessName} storefront`, 'Storefront')}
              </div>

              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <Button variant="outline" className="text-xs">
                  Review documents
                </Button>
                <Button className="text-xs">
                  Approve supermarket
                </Button>
                <Button variant="outline" className="text-xs">
                  Reject / Suspend
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </AdminLayout>
  );
};

type SupermarketApi = {
  id: string;
  business_name: string;
  manager_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cac_number: string;
  tax_id: string | null;
  verification_status: SupermarketVerificationStatus;
  dispatch_orders_count: number | null;
  active_runners_count: number | null;
  cac_certificate_url: string | null;
  government_id_url: string | null;
  storefront_image_url: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
};

const mapSupermarket = (store: SupermarketApi): AdminSupermarketProfile => {
  return {
    id: store.id,
    businessName: store.business_name,
    managerName: store.manager_name,
    email: store.email,
    phone: store.phone,
    address: store.address,
    city: store.city,
    verificationStatus: store.verification_status,
    cacNumber: store.cac_number,
    taxId: store.tax_id ?? 'N/A',
    submittedAt: formatDate(store.submitted_at),
    lastUpdated: formatDate(store.reviewed_at),
    dispatchOrders: store.dispatch_orders_count ?? 0,
    activeRunners: store.active_runners_count ?? 0,
    documents: {
      cacCertificateImage: store.cac_certificate_url ?? '',
      governmentIdImage: store.government_id_url ?? '',
      storefrontImage: store.storefront_image_url ?? '',
    },
  };
};

const formatDate = (value: string | null) => {
  if (!value) return 'Pending';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const renderDocument = (url: string, alt: string, label: string) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f141f]">
    {url ? (
      <img src={url} alt={alt} className="h-28 w-full object-cover" />
    ) : (
      <div className="flex h-28 w-full items-center justify-center text-xs text-white/50">No document</div>
    )}
    <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">{label}</div>
  </div>
);
