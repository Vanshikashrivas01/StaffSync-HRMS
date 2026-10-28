import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  LogOut,
  RefreshCw
} from 'lucide-react';

export const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = () => {
  const { user, role, quickSwitchRole, logout, isLoading } = useAuth();

  const roleConfigs: Record<UserRole, { label: string; bg: string; text: string; icon: any }> = {
    hr: {
      label: 'HR Administrator',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-700',
      icon: ShieldCheck,
    },
    manager: {
      label: 'Team Manager',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      text: 'text-indigo-700',
      icon: UserCheck,
    },
    employee: {
      label: 'Staff Employee',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'text-blue-700',
      icon: Briefcase,
    },
  };

  const currentRoleMeta = role ? roleConfigs[role] : roleConfigs.employee;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  StaffSync
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 uppercase tracking-wider">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Modern Human Resource Management Solution
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Role Switcher:
            </span>
            {(['hr', 'manager', 'employee'] as UserRole[]).map((r) => {
              const isSelected = role === r;
              return (
                <button
                  key={r}
                  onClick={() => quickSwitchRole(r)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span className="capitalize">{r === 'hr' ? 'HR Admin' : r}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-sm font-bold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRoleMeta.bg}`}>
                      {role?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {user.designation} &bull; {user.department}
                  </span>
                </div>

                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-slate-200 object-cover"
                />

                <button
                  onClick={logout}
                  title="Log out of StaffSync"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                Authenticating...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
