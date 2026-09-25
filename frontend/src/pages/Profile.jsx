import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  Key,
  HelpCircle,
  Headphones,
} from 'lucide-react';

const Profile = () => {
  const { user, isAdmin, isAgent, isEmployee, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          title: 'System Administrator',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          desc: 'Full administrative access across tickets, user accounts, service catalog, and system dashboards.',
        };
      case 'SUPPORT_AGENT':
        return {
          title: 'IT Support Specialist',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          desc: 'Responsible for diagnosing, investigating, managing priority, updating status, and resolving technical service tickets.',
        };
      default:
        return {
          title: 'Corporate Employee',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          desc: 'Can raise incident and service requests, attach diagnostic screenshots, comment on inquiries, and verify issue resolution.',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your corporate identity, role privileges, and authentication attributes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-2xl border-2 border-indigo-200 mb-4 shadow-inner">
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <h2 className="text-base font-bold text-slate-900">{user?.fullName}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

          <span
            className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.badge}`}
          >
            {roleInfo.title}
          </span>

          <div className="w-full border-t border-slate-100 mt-6 pt-5 flex flex-col gap-2.5">
            <button
              onClick={logout}
              className="w-full py-2 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
            >
              Sign Out of Session
            </button>
          </div>
        </div>

        {/* Account Details & Permissions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              Account Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Corporate ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">
                  USR-{String(user?.id || 1).padStart(5, '0')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {user?.status || 'ACTIVE'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Security Protocol
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 mt-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  JWT Bearer / BCrypt Hashing
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Service Access Tier
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 mt-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  {user?.role} Level
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              Role Permissions Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {roleInfo.desc}
            </p>

            <ul className="text-xs text-slate-600 space-y-2 mt-3 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Submit incident reports and service requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Attach screenshots and log files</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Post threaded comments and view ticket audit history</span>
              </li>
              {isAgent && (
                <>
                  <li className="flex items-center gap-2 font-medium text-indigo-700">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Triage unassigned tickets and self-assign incidents</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-indigo-700">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Advance ticket workflow and record resolution notes</span>
                  </li>
                </>
              )}
              {isAdmin && (
                <>
                  <li className="flex items-center gap-2 font-medium text-purple-700">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Full user account administration (create, edit, activate/deactivate)</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-purple-700">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Manage service catalog categories and global operational analytics</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
