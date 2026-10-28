import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { 
  Users, 
  CalendarClock, 
  CheckCircle2, 
  GraduationCap, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Laptop
} from 'lucide-react';

export const DashboardPage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [activeTrainings, setActiveTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time state for live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Load Today Attendance status
      try {
        const attRes = await api.attendance.getToday();
        setTodayAttendance(attRes);
      } catch (e) {
        console.error('Attendance fetch error:', e);
      }

      // 2. Load Announcements
      try {
        const annRes = await api.announcements.getAll();
        setRecentAnnouncements(annRes.announcements?.slice(0, 3) || []);
      } catch (e) {
        console.error('Announcements fetch error:', e);
      }

      // 3. Load Trainings
      try {
        const trnRes = await api.trainings.getAll();
        setActiveTrainings(trnRes.trainings?.slice(0, 3) || []);
      } catch (e) {
        console.error('Trainings fetch error:', e);
      }

      // 4. Role-specific stats
      if (role === 'hr' || role === 'manager') {
        const [statsRes, leavesRes] = await Promise.all([
          api.employees.getStats().catch(() => ({ stats: null })),
          api.leaves.getAll('pending').catch(() => ({ leaves: [] })),
        ]);
        setStats(statsRes.stats);
        setPendingLeaves(leavesRes.leaves || []);
      } else {
        // Employee leaves
        const leavesRes = await api.leaves.getMyLeaves().catch(() => ({ leaves: [] }));
        setPendingLeaves(leavesRes.leaves?.slice(0, 3) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const handleQuickCheckIn = async (mode: 'office' | 'remote') => {
    try {
      await api.attendance.checkIn({ workMode: mode, notes: 'Quick check-in from Overview' });
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      await api.attendance.checkOut();
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Workspace Active &bull; Role: {role?.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {role === 'hr'
                ? 'Welcome to the StaffSync HR Management Command. Review workforce metrics, employee profiles, and pending leave requests below.'
                : role === 'manager'
                ? 'Manage your team development, track leaves, and review daily engineering attendance.'
                : 'Welcome to your employee self-service hub. Clock in for the day, submit leave applications, and view ongoing training.'}
            </p>
          </div>

          {/* Quick Action Widget for Attendance Clock */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl flex flex-col items-center justify-center shrink-0 min-w-[220px]">
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Current Time
            </div>
            <div className="text-2xl font-mono font-bold tracking-wider text-white">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs text-blue-200 mb-3">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            {todayAttendance?.isCheckedIn ? (
              todayAttendance?.isCheckedOut ? (
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Shift Completed ({todayAttendance?.attendance?.workHours || 8} hrs)
                </div>
              ) : (
                <button
                  onClick={handleQuickCheckOut}
                  className="w-full py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm transition"
                >
                  Clock Out Now
                </button>
              )
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleQuickCheckIn('office')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <MapPin className="w-3 h-3" /> Office
                </button>
                <button
                  onClick={() => handleQuickCheckIn('remote')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <Laptop className="w-3 h-3" /> Remote
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {role === 'hr' || role === 'manager' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Headcount
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats?.totalEmployees || 5}
              </h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {stats?.activeEmployees || 5} Active Status
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Leave Queue
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {pendingLeaves.length}
              </h3>
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> Requires Decision
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarClock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Programs
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {activeTrainings.length}
              </h3>
              <p className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1">
                Engineering & Design
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today Check-Ins
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {todayAttendance?.isCheckedIn ? 'Checked In' : 'Ready'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Office & Remote Tracking
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : (
        /* Employee metrics: Leave Balances */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                Annual Vacation
              </span>
              <CalendarClock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {user?.leaveBalance?.annual || 15} <span className="text-sm font-normal text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Available balance for 2026</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
                Sick Leave
              </span>
              <CalendarClock className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {user?.leaveBalance?.sick || 10} <span className="text-sm font-normal text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Medical certificate needed for &gt; 2 days</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                Casual / Personal
              </span>
              <CalendarClock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {user?.leaveBalance?.casual || 7} <span className="text-sm font-normal text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Short notice personal emergencies</p>
          </div>
        </div>
      )}

      {/* Main Grid: Pending Approvals & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leave Management Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {role === 'hr' || role === 'manager' ? 'Pending Leave Requests Queue' : 'My Recent Leave Applications'}
              </h2>
              <p className="text-xs text-slate-500">
                {role === 'hr' || role === 'manager' ? 'Requires approval from management' : 'Track current application review status'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('leaves')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No pending leave applications at this time.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingLeaves.map((leave) => {
                const empName = typeof leave.employee === 'object' ? leave.employee?.name : 'Employee';
                const empRole = typeof leave.employee === 'object' ? leave.employee?.designation : 'Staff';
                return (
                  <div key={leave._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">
                          {role === 'employee' ? `Leave Request (${leave.leaveType})` : empName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                          {leave.leaveType} &bull; {leave.totalDays} day(s)
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} &bull; Reason: &quot;{leave.reason}&quot;
                      </p>
                    </div>

                    {(role === 'hr' || role === 'manager') && leave.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            await api.leaves.updateStatus(leave._id, 'approved', 'Approved from Overview dashboard');
                            loadDashboardData();
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            await api.leaves.updateStatus(leave._id, 'rejected', 'Declined due to team schedule overlap');
                            loadDashboardData();
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Company Announcements Bulletin */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Notice Board
              </h2>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                More <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div key={ann._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      ann.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      ann.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to test REST APIs?</span>
            <button
              onClick={() => setActiveTab('postman')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Open Postman Runner &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
