import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderHeart, ReceiptText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/BrandMark';

const TABS = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/campaigns', label: 'Campaigns', icon: FolderHeart },
  { to: '/admin/donations', label: 'Donations', icon: ReceiptText },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <BrandMark size={44} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Console</p>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Children Hope Foundation</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-slate-500 text-xs">
            Signed in as <strong className="text-slate-800">{user?.name}</strong>
          </span>
          <Link
            to="/"
            className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mt-6 flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm sm:mt-8 sm:gap-2">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }: { isActive: boolean }) =>
              `flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-[11px] font-bold transition-colors sm:flex-none sm:gap-2 sm:px-5 sm:text-xs ${
                isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
};
