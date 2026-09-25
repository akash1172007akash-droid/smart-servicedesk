import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, LogOut, User as UserIcon, Menu } from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-purple-200">Admin</span>;
      case 'SUPPORT_AGENT':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">Support Agent</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Employee</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Environment:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live ServiceDesk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Ticket</span>
          </Link>

          <div className="h-6 w-px bg-slate-200" />

          {/* User profile info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              {user?.fullName?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.fullName}
                </span>
                {getRoleBadge(user?.role)}
              </div>
              <span className="text-[11px] text-slate-500">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
