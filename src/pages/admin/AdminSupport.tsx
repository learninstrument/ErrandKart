import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, PhoneCall, ShieldAlert, Star, LifeBuoy, ChevronRight, User, Bike } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { AdminLayout } from './AdminLayout';
import { ADMIN_ORDER_RATINGS, ADMIN_SUPPORT_TICKETS, ADMIN_USER_PROFILES } from './adminData';
import type { AdminSupportTicket, SupportTicketStatus } from './adminData';

const renderStars = (value: number) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={13}
        className={index < value ? 'text-kart-orange fill-kart-orange' : 'text-white/20'}
      />
    ))}
  </div>
);

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: 'border-kart-orange/40 bg-kart-orange/10 text-kart-orange',
  'in-progress': 'border-blue-400/40 bg-blue-400/10 text-blue-300',
  resolved: 'border-market-green/40 bg-market-green/10 text-market-green',
  escalated: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const getChannelMeta = (channel: AdminSupportTicket['channel']) => {
  if (channel === 'live-chat') return { label: 'Live chat', icon: <MessageCircle size={13} /> };
  if (channel === 'email') return { label: 'Email', icon: <Mail size={13} /> };
  return { label: 'Phone', icon: <PhoneCall size={13} /> };
};

export const AdminSupport: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'runner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicketStatus>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'attention'>('all');

  const userLookup = useMemo(() => new Map(ADMIN_USER_PROFILES.map(user => [user.id, user])), []);

  const filteredTickets = useMemo(() => {
    return ADMIN_SUPPORT_TICKETS.filter(ticket => {
      const matchesRole = roleFilter === 'all' || ticket.requesterRole === roleFilter;
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        ticket.id.toLowerCase().includes(query.toLowerCase()) ||
        ticket.requesterName.toLowerCase().includes(query.toLowerCase()) ||
        ticket.summary.toLowerCase().includes(query.toLowerCase()) ||
        ticket.category.toLowerCase().includes(query.toLowerCase()) ||
        (ticket.orderId ?? '').toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [query, roleFilter, statusFilter]);

  const openTickets = ADMIN_SUPPORT_TICKETS.filter(ticket => ticket.status !== 'resolved').length;
  const escalatedTickets = ADMIN_SUPPORT_TICKETS.filter(ticket => ticket.status === 'escalated').length;
  const customerTickets = ADMIN_SUPPORT_TICKETS.filter(ticket => ticket.requesterRole === 'customer').length;
  const runnerTickets = ADMIN_SUPPORT_TICKETS.filter(ticket => ticket.requesterRole === 'runner').length;
  const avgRating = useMemo(() => {
    const values = ADMIN_ORDER_RATINGS.flatMap(item => [item.customerToRunnerRating, item.runnerToCustomerRating]);
    const total = values.reduce((sum, value) => sum + value, 0);
    return values.length === 0 ? 0 : total / values.length;
  }, []);

  const ratingItems = useMemo(() => {
    return ADMIN_ORDER_RATINGS.filter(item => {
      if (ratingFilter === 'all') return true;
      return item.customerToRunnerRating <= 3 || item.runnerToCustomerRating <= 3;
    });
  }, [ratingFilter]);

  return (
    <AdminLayout title="Support & Ratings" active="support">
      <section className="mb-4 rounded-2xl border border-white/10 bg-[#111722] px-4 py-3 text-sm text-white/75">
        This queue contains support requests from both <span className="font-semibold text-white">customers</span> and{' '}
        <span className="font-semibold text-white">runners</span>.
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <LifeBuoy size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Open tickets</p>
          <p className="mt-2 text-2xl font-black text-white">{openTickets}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
            <ShieldAlert size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Escalated</p>
          <p className="mt-2 text-2xl font-black text-white">{escalatedTickets}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/15 text-blue-300">
            <User size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Customer tickets</p>
          <p className="mt-2 text-2xl font-black text-white">{customerTickets}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
            <Bike size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Runner tickets</p>
          <p className="mt-2 text-2xl font-black text-white">{runnerTickets}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <Star size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Avg order rating</p>
          <p className="mt-2 text-2xl font-black text-white">{avgRating.toFixed(1)}/5</p>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search tickets by ID, order, user, category..."
              className="w-full rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-kart-orange/25"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'customer', 'runner'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  roleFilter === role
                    ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {role === 'all' ? 'All requests' : role}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['all', 'open', 'in-progress', 'resolved', 'escalated'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                statusFilter === status
                  ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All status' : status}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {filteredTickets.map(ticket => {
          const channel = getChannelMeta(ticket.channel);
          const requester = userLookup.get(ticket.requesterUserId);
          const rating = ticket.orderId
            ? ADMIN_ORDER_RATINGS.find(item => item.orderId === ticket.orderId) ?? null
            : null;

          return (
            <div
              key={ticket.id}
              className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{ticket.id}</p>
                    {ticket.orderId && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                        {ticket.orderId}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[ticket.status]}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-bold text-white">{ticket.category}</p>
                  <p className="mt-2 text-sm text-white/60">{ticket.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.18em]">
                      {ticket.requesterRole}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.18em]">
                      Priority: {ticket.priority}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      SLA {ticket.slaTarget}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {channel.icon} {channel.label}
                    </span>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-[#0f141f] p-3 md:w-[280px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Requester</p>
                  <p className="mt-2 text-sm font-bold text-white">{ticket.requesterName}</p>
                  <p className="text-xs text-white/60">{requester?.email ?? 'no email'}</p>
                  <p className="text-xs text-white/60">{requester?.phone ?? 'no phone'}</p>
                  <p className="mt-2 text-xs text-white/50">Last update: {ticket.updatedAt}</p>
                  <p className="text-xs text-white/50">{ticket.lastMessage}</p>
                </div>
              </div>

              {rating && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Order rating</p>
                    <span className="text-xs text-white/50">{rating.submittedAt}</span>
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-white/70 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-[#111722] px-3 py-2">
                      <p className="text-xs text-white/50">Customer → Runner</p>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(rating.customerToRunnerRating)}
                        <span className="text-white">{rating.customerToRunnerRating}/5</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#111722] px-3 py-2">
                      <p className="text-xs text-white/50">Runner → Customer</p>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(rating.runnerToCustomerRating)}
                        <span className="text-white">{rating.runnerToCustomerRating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <Button variant="outline" className="gap-2 text-xs" onClick={() => navigate(`/admin/users/${ticket.requesterUserId}`)}>
                  Open profile <ChevronRight size={14} className="text-white/70" />
                </Button>
                {ticket.orderId && (
                  <Button variant="outline" className="gap-2 text-xs" onClick={() => navigate('/admin/tracking')}>
                    Open live tracking <ChevronRight size={14} className="text-white/70" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ORDER RATINGS</h3>
          <div className="flex gap-2">
            {(['all', 'attention'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setRatingFilter(mode)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  ratingFilter === mode
                    ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All ratings' : 'Needs attention'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {ratingItems.map(item => {
            const linkedTicket = item.linkedSupportTicketId
              ? ADMIN_SUPPORT_TICKETS.find(ticket => ticket.id === item.linkedSupportTicketId) ?? null
              : null;

            return (
              <div key={item.orderId} className="rounded-2xl border border-white/10 bg-[#0f141f] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-bold text-white">{item.orderId}</p>
                  <span className="text-xs text-white/50">{item.submittedAt}</span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#111722] p-3">
                    <p className="text-xs text-white/50">
                      {item.customerName} rated {item.runnerName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {renderStars(item.customerToRunnerRating)}
                      <span className="text-sm font-semibold text-white">{item.customerToRunnerRating}/5</span>
                    </div>
                    <p className="mt-2 text-sm text-white/65">{item.customerComment}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#111722] p-3">
                    <p className="text-xs text-white/50">
                      {item.runnerName} rated {item.customerName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {renderStars(item.runnerToCustomerRating)}
                      <span className="text-sm font-semibold text-white">{item.runnerToCustomerRating}/5</span>
                    </div>
                    <p className="mt-2 text-sm text-white/65">{item.runnerComment}</p>
                  </div>
                </div>

                {linkedTicket && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-[#111722] px-3 py-2 text-xs text-white/65">
                    Linked ticket: {linkedTicket.id} · {linkedTicket.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </AdminLayout>
  );
};
