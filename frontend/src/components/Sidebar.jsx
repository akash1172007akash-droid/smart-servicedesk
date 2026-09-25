import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  FolderTree,
  UserCheck,
  Headphones,
  X,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['EMPLOYEE', 'SUPPORT_AGENT', 'ADMIN'],
    },
    {
      to: '/tickets',
      label: 'Tickets',
      icon: Ticket,
      roles: ['EMPLOYEE', 'SUPPORT_AGENT', 'ADMIN'],
    },
    {
      to: '/tickets/new',
      label: 'Create Ticket',
      icon: PlusCircle,
      roles: ['EMPLOYEE', 'SUPPORT_AGENT', 'ADMIN'],
    },
    {
      to: '/users',
      label: 'User Management',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: FolderTree,
      roles: ['ADMIN'],
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: UserCheck,
      roles: ['EMPLOYEE', 'SUPPORT_AGENT', 'ADMIN'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight leading-tight block">
                Smart Desk
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Enterprise IT
              </span>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                Role: {user?.role}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Status: {user?.status}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
