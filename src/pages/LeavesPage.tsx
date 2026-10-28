import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Leave, LeaveType } from '../types/index.ts';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Send, 
  Plus, 
  Filter, 
  Check, 
  X 
} from 'lucide-react';

export const LeavesPage: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveBalance, setLeaveBalance] = useState({ annual: 15, sick: 10, casual: 7 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'annual' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Review comment modal
  const [reviewModalLeave, setReviewModalLeave] = useState<Leave | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewComment, setReviewComment] = useState('');

  const loadLeaves = async () => {
    try {
      setLoading(true);
      if (role === 'hr' || role === 'manager') {
        const res = await api.leaves.getAll(statusFilter || undefined);
        setLeaves(res.leaves || []);
      } else {
        const res = await api.leaves.getMyLeaves();
        setLeaves(res.leaves || []);
        if (res.leaveBalance) setLeaveBalance(res.leaveBalance);
      }
    } catch (err: any) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [role, statusFilter]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const calculatedDays = calculateDays(applyForm.startDate, applyForm.endDate);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.leaves.apply({
        leaveType: applyForm.leaveType,
        startDate: applyForm.startDate,
        endDate: applyForm.endDate,
        reason: applyForm.reason,
      });
      setIsApplyModalOpen(false);
      setApplyForm({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      await loadLeaves();
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave request');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalLeave) return;
    try {
      await api.leaves.updateStatus(reviewModalLeave._id, reviewAction, reviewComment);
      setReviewModalLeave(null);
      setReviewComment('');
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Failed to update leave status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'hr' || role === 'manager'
              ? 'Review workforce time-off requests, calibrate schedules, and manage approvals.'
              : 'Submit time-off requests, monitor approval status, and check your remaining balance.'}
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Annual Vacation</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {user?.leaveBalance?.annual ?? leaveBalance.annual} <span className="text-xs font-medium text-slate-400">days left</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Medical / Sick</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {user?.leaveBalance?.sick ?? leaveBalance.sick} <span className="text-xs font-medium text-slate-400">days left</span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Casual / Personal</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {user?.leaveBalance?.casual ?? leaveBalance.casual} <span className="text-xs font-medium text-slate-400">days left</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {(role === 'hr' || role === 'manager') && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: '', label: 'All Requests' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Leaves List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Type & Duration</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                {(role === 'hr' || role === 'manager') && (
                  <th className="py-3 px-4 text-right">Decision</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const empName = typeof leave.employee === 'object' ? leave.employee?.name : user?.name;
                  const empDept = typeof leave.employee === 'object' ? leave.employee?.department : user?.department;
                  const empAvatar = typeof leave.employee === 'object' ? leave.employee?.avatar : user?.avatar;

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/60 transition">
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
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-bold text-slate-800">{leave.leaveType}</span>
                        <div className="text-[11px] text-slate-500 font-semibold">{leave.totalDays} day(s) total</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600">{leave.reason}</p>
                        {leave.reviewComments && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            Note: &quot;{leave.reviewComments}&quot;
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          leave.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          leave.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {leave.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {leave.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {leave.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>
                      {(role === 'hr' || role === 'manager') && (
                        <td className="py-3.5 px-4 text-right">
                          {leave.status === 'pending' ? (
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setReviewModalLeave(leave);
                                  setReviewAction('approved');
                                  setReviewComment('Approved. Enjoy your time off!');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition shadow-2xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setReviewModalLeave(leave);
                                  setReviewAction('rejected');
                                  setReviewComment('Unable to approve due to critical sprint deadline.');
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-md text-[11px] font-bold transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Decided</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply Leave */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Submit Leave Application
              </h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value as LeaveType })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="annual">Annual Leave (Balance: {user?.leaveBalance?.annual ?? 15} days)</option>
                  <option value="sick">Medical / Sick Leave (Balance: {user?.leaveBalance?.sick ?? 10} days)</option>
                  <option value="casual">Casual / Personal (Balance: {user?.leaveBalance?.casual ?? 7} days)</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {calculatedDays > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs text-blue-800">
                  <span className="font-semibold">Calculated Leave Duration:</span>
                  <span className="font-black text-sm">{calculatedDays} day(s)</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide brief context for management..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review & Decide Leave */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {reviewAction === 'approved' ? 'Approve Leave Application' : 'Reject Leave Application'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              For: {typeof reviewModalLeave.employee === 'object' ? reviewModalLeave.employee?.name : 'Employee'} ({reviewModalLeave.totalDays} days)
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Management Comment</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add feedback or notes visible to the employee..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalLeave(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                    reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
