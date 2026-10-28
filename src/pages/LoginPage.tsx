import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, quickSwitchRole, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('hr@staffsync.io');
  const [password, setPassword] = useState('StaffSync@123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await register({
          name,
          email,
          password,
          role,
          department,
          designation,
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (targetRole: UserRole) => {
    setError(null);
    try {
      await quickSwitchRole(targetRole);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          StaffSync
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Modern Human Resource Management Solution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 space-y-6">
          {/* Quick 1-Click Role Login Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Click Instant Demo Login
              </span>
              <span className="text-[10px] text-slate-400 font-medium">No typing required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('hr')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase">
                    HR
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">HR Admin</div>
                <div className="text-[10px] text-slate-500 truncate">hr@staffsync.io</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('manager')}
                className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 uppercase">
                    MGR
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Team Manager</div>
                <div className="text-[10px] text-slate-500 truncate">manager@staffsync.io</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('employee')}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 uppercase">
                    EMP
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Staff Employee</div>
                <div className="text-[10px] text-slate-500 truncate">alex@staffsync.io</div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or sign in manually</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Reed"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="employee">Staff Employee</option>
                      <option value="manager">Team Manager</option>
                      <option value="hr">HR Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Product Analyst"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isRegistering ? 'Register Employee Account' : 'Sign in to StaffSync'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register new employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
