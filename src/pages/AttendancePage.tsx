import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Attendance, WorkMode } from '../types/index.ts';
import { 
  Clock, 
  MapPin, 
  Laptop, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  LogOut,
  Users
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user, role } = useAuth();
  const [todayData, setTodayData] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workMode, setWorkMode] = useState<WorkMode>('office');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayRes, listRes] = await Promise.all([
        api.attendance.getToday(),
        (role === 'hr' || role === 'manager')
          ? api.attendance.getAll(selectedDate)
          : api.attendance.getAll(), // Returns records
      ]);
      setTodayData(todayRes);
      setAttendanceList(listRes.records || []);
      setSummary(listRes.summary || null);
    } catch (err: any) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, selectedDate]);

  const handleCheckIn = async () => {
    try {
      await api.attendance.checkIn({ workMode, notes });
      setNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.attendance.checkOut();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Tracking & Daily Timesheets
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time check-in/out station, automated duration calculation, and workforce roll-call.
        </p>
      </div>

      {/* Main Check-In Console Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Live Clock Display */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Live Work Station Clock
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900 mt-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* User Today Status */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Status &bull; {user?.name}
            </span>

            {todayData?.isCheckedIn ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {todayData.isCheckedOut ? 'Shift Completed' : 'Currently On Clock'}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px]">
                    {todayData?.attendance?.workMode}
                  </span>
                </div>
                <div className="text-xs text-emerald-700">
                  Check-in: <span className="font-mono font-bold">{new Date(todayData.attendance.checkInTime).toLocaleTimeString()}</span>
                  {todayData.isCheckedOut && (
                    <span> &bull; Out: <span className="font-mono font-bold">{new Date(todayData.attendance.checkOutTime).toLocaleTimeString()}</span></span>
                  )}
                </div>
                {todayData.isCheckedOut && (
                  <div className="text-[11px] font-semibold text-emerald-900">
                    Total Hours Worked: {todayData.attendance.workHours} hrs
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You have not marked attendance for today yet. Standard start: 9:00 AM.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center space-y-3">
            {!todayData?.isCheckedIn ? (
              <div className="space-y-2">
                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
                  <button
                    onClick={() => setWorkMode('office')}
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition ${
                      workMode === 'office' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" /> In-Office
                  </button>
                  <button
                    onClick={() => setWorkMode('remote')}
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition ${
                      workMode === 'remote' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Remote
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Optional shift notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleCheckIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clock In Now</span>
                </button>
              </div>
            ) : !todayData.isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-500/20 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Clock Out for the Day</span>
              </button>
            ) : (
              <div className="text-center py-2 text-xs font-semibold text-slate-400">
                You are all set for today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Row for HR/Manager */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.totalRecords}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Present Today</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.totalPresent}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Late Arrivals</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{summary.totalLate}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">Remote Workforce</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.remoteWorkers}</div>
          </div>
        </div>
      )}

      {/* Date Filter & Roll-Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Workforce Daily Attendance Log
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Work Mode</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No attendance records logged for {selectedDate}.
                  </td>
                </tr>
              ) : (
                attendanceList.map((att) => {
                  const empName = typeof att.employee === 'object' ? att.employee?.name : user?.name;
                  const empDept = typeof att.employee === 'object' ? att.employee?.department : user?.department;
                  const empAvatar = typeof att.employee === 'object' ? att.employee?.avatar : user?.avatar;

                  return (
                    <tr key={att._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={empAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${empName}`}
                            alt={empName}
                            className="w-8 h-8 rounded-full ring-1 ring-slate-200 object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{empName}</div>
                            <div className="text-[11px] text-slate-500">{empDept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {att.workHours > 0 ? `${att.workHours} hrs` : '-'}
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {att.workMode === 'office' ? <Building className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                          {att.workMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                          att.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
