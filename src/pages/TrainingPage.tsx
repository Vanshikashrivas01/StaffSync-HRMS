import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Training, User } from '../types/index.ts';
import { 
  GraduationCap, 
  Plus, 
  Users, 
  UserCheck, 
  Award, 
  Calendar, 
  Clock, 
  X, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const TrainingPage: React.FC = () => {
  const { user, role } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignTraining, setAssignTraining] = useState<Training | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  // Update progress modal
  const [progressModal, setProgressModal] = useState<{ trainingId: string; empId: string; currentPercent: number } | null>(null);
  const [newProgress, setNewProgress] = useState(50);
  const [newScore, setNewScore] = useState<number | undefined>(undefined);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    instructor: 'StaffSync Learning Academy',
    startDate: '',
    endDate: '',
    durationHours: 12,
  });

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const [trnRes, empRes] = await Promise.all([
        api.trainings.getAll(),
        (role === 'manager' || role === 'hr') ? api.employees.getAll() : Promise.resolve({ employees: [] }),
      ]);
      setTrainings(trnRes.trainings || []);
      setAllEmployees(empRes.employees || []);
    } catch (err: any) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, [role]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.trainings.create(form);
      setIsCreateModalOpen(false);
      setForm({
        title: '',
        description: '',
        category: 'Engineering',
        instructor: 'StaffSync Learning Academy',
        startDate: '',
        endDate: '',
        durationHours: 12,
      });
      await loadTrainings();
    } catch (err: any) {
      alert(err.message || 'Error creating training');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTraining || selectedEmployeeIds.length === 0) return;
    try {
      await api.trainings.assign(assignTraining._id, selectedEmployeeIds);
      setAssignTraining(null);
      setSelectedEmployeeIds([]);
      await loadTrainings();
    } catch (err: any) {
      alert(err.message || 'Error assigning employees');
    }
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModal) return;
    try {
      await api.trainings.updateProgress(
        progressModal.trainingId,
        newProgress,
        progressModal.empId,
        newScore
      );
      setProgressModal(null);
      await loadTrainings();
    } catch (err: any) {
      alert(err.message || 'Error updating progress');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Training & Workforce Skill Development
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'manager' || role === 'hr'
              ? 'Organize development curricula, assign team participants, and track skill mastery.'
              : 'Upskill with company training workshops and track your completion progress.'}
          </p>
        </div>

        {(role === 'manager' || role === 'hr') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {/* Training Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainings.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No training programs configured.
          </div>
        ) : (
          trainings.map((trn) => {
            const participants = trn.participants || [];
            const myEnrollment = participants.find((p) => {
              const pId = typeof p.employee === 'object' ? (p.employee as any)._id : p.employee;
              return pId === user?._id;
            });

            return (
              <div key={trn._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                      {trn.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-100 text-emerald-800">
                      {trn.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {trn.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {trn.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">Instructor:</span> {trn.instructor}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Duration:</span> {trn.durationHours} hours
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold text-slate-700">Schedule:</span>{' '}
                      {new Date(trn.startDate).toLocaleDateString()} &ndash; {new Date(trn.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Enrolled Team Participants */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Enrolled Participants ({participants.length})
                      </span>

                      {(role === 'manager' || role === 'hr') && (
                        <button
                          onClick={() => {
                            setAssignTraining(trn);
                            setSelectedEmployeeIds([]);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                        >
                          + Assign Staff
                        </button>
                      )}
                    </div>

                    {participants.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No employees assigned yet.</div>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {participants.map((p, idx) => {
                          const pName = typeof p.employee === 'object' ? (p.employee as any).name : 'Employee';
                          const isCurrentUser = typeof p.employee === 'object' ? (p.employee as any)._id === user?._id : p.employee === user?._id;

                          return (
                            <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">
                                    {pName} {isCurrentUser && <span className="text-[10px] text-blue-600 font-normal">(You)</span>}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    {p.progressPercent}% &bull; {p.status}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      p.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${p.progressPercent}%` }}
                                  />
                                </div>
                              </div>

                              {(isCurrentUser || role === 'manager' || role === 'hr') && (
                                <button
                                  onClick={() => {
                                    const empId = typeof p.employee === 'object' ? (p.employee as any)._id : p.employee;
                                    setProgressModal({
                                      trainingId: trn._id,
                                      empId,
                                      currentPercent: p.progressPercent,
                                    });
                                    setNewProgress(p.progressPercent);
                                    setNewScore(p.score);
                                  }}
                                  className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-md shrink-0"
                                >
                                  Update
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Training Program */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Training Program</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Next-Gen DevOps and CI/CD pipelines"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Compliance">Compliance & Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durationHours}
                    onChange={(e) => setForm({ ...form, durationHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Provider</label>
                <input
                  type="text"
                  required
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Learning Outcomes</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Publish Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Employees */}
      {assignTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Assign Staff to &quot;{assignTraining.title}&quot;
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select team members to enroll into this curriculum.
            </p>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-3">
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2">
                {allEmployees.map((emp) => {
                  const isChecked = selectedEmployeeIds.includes(emp._id);
                  return (
                    <label
                      key={emp._id}
                      className="flex items-center space-x-3 py-2 px-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployeeIds([...selectedEmployeeIds, emp._id]);
                          } else {
                            setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== emp._id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-500">{emp.designation} &bull; {emp.department}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignTraining(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedEmployeeIds.length === 0}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  Enroll {selectedEmployeeIds.length} Staff Member(s)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Progress */}
      {progressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Update Course Completion</h3>

            <form onSubmit={handleProgressSubmit} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Completion Percentage:</span>
                  <span className="font-bold text-blue-600">{newProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam / Assessment Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Optional score..."
                  value={newScore ?? ''}
                  onChange={(e) => setNewScore(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProgressModal(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
