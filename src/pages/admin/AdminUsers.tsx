import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserCheck, UserPlus } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { ADMIN_USER_PROFILES } from './adminData';

type UserRole = 'customer' | 'runner' | 'admin';
//type UserStatus = 'active' | 'inactive' | 'suspended';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filteredUsers = useMemo(() => {
    return ADMIN_USER_PROFILES.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.id.toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter]);

  const totalUsers = ADMIN_USER_PROFILES.length;
  const activeUsers = ADMIN_USER_PROFILES.filter(user => user.status === 'active').length;
  const newToday = 5;

  return (
    <AdminLayout title="User Monitoring" active="users">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <Users size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Total users</p>
          <p className="mt-2 text-2xl font-black text-white">{totalUsers.toLocaleString()}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
            <UserCheck size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Active now</p>
          <p className="mt-2 text-2xl font-black text-white">{activeUsers.toLocaleString()}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
            <UserPlus size={18} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">New today</p>
          <p className="mt-2 text-2xl font-black text-white">{newToday}</p>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full rounded-2xl border border-white/10 bg-[#121212] py-3 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-kart-orange/25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'customer', 'runner', 'admin'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  roleFilter === role
                    ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {filteredUsers.map(user => (
          <button
            key={user.id}
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{user.id}</p>
                <p className="mt-2 text-base font-bold text-white">{user.fullName}</p>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
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
                <span className="text-xs text-white/50">Joined {user.joinedAt}</span>
                <span className="text-xs text-white/50">Last seen {user.lastSeen}</span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </AdminLayout>
  );
};
