import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { User, UserRole } from '../types/index.ts';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  Trash2, 
  Edit, 
  Check, 
  X,
  ShieldAlert
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+1 (555) 000-0000',
    annualLeave: 15,
    sickLeave: 10,
    casualLeave: 7,
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        api.employees.getAll({
          department: departmentFilter || undefined,
          role: roleFilter || undefined,
          search: searchTerm || undefined,
        }),
        api.employees.getStats(),
      ]);
      setEmployees(listRes.employees || []);
      setStats(statsRes.stats);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [departmentFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.employees.create({
        name: formData.name,
        email: formData.email,
        password: formData.password || 'StaffSync@123',
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        leaveBalance: {
          annual: Number(formData.annualLeave),
          sick: Number(formData.sickLeave),
          casual: Number(formData.casualLeave),
        },
      });
      setIsAddModalOpen(false);
      resetForm();
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Error creating employee');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await api.employees.update(editingEmployee._id, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        leaveBalance: {
          annual: Number(formData.annualLeave),
          sick: Number(formData.sickLeave),
          casual: Number(formData.casualLeave),
        },
      });
      setEditingEmployee(null);
      resetForm();
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Error updating employee');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the profile of ${name}?`)) {
      return;
    }
    try {
      await api.employees.delete(id);
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Error deleting employee');
    }
  };

  const startEdit = (emp: User) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone || '+1 (555) 000-0000',
      annualLeave: emp.leaveBalance?.annual ?? 15,
      sickLeave: emp.leaveBalance?.sick ?? 10,
      casualLeave: emp.leaveBalance?.casual ?? 7,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '+1 (555) 000-0000',
      annualLeave: 15,
      sickLeave: 10,
      casualLeave: 7,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory & Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company workforce, roles, departmental assignments, and leave allowances.
          </p>
        </div>

        {role === 'hr' && (
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Headcount Stat Chips */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Headcount</span>
            <div className="text-xl font-bold text-slate-900">{stats.totalEmployees}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">HR Admins</span>
            <div className="text-xl font-bold text-emerald-600">{stats.byRole?.hr || 1}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Managers</span>
            <div className="text-xl font-bold text-indigo-600">{stats.byRole?.manager || 1}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Employees</span>
            <div className="text-xl font-bold text-blue-600">{stats.byRole?.employee || 3}</div>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Leave Balances</th>
                <th className="py-3.5 px-4">Status</th>
                {role === 'hr' && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No employees found matching the filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full ring-1 ring-slate-200 object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-500">{emp.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.department}</div>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        emp.role === 'hr' ? 'bg-emerald-100 text-emerald-800' :
                        emp.role === 'manager' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {emp.role === 'hr' ? 'HR Admin' : emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {emp.leaveBalance?.annual ?? 15}A
                        </span>
                        <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          {emp.leaveBalance?.sick ?? 10}S
                        </span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {emp.leaveBalance?.casual ?? 7}C
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    {role === 'hr' && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => startEdit(emp)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Employee */}
      {(isAddModalOpen || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee Profile'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Maya Lin"
                  />
                </div>

                {!editingEmployee && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="maya@staffsync.io"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Default Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
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
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Lead Frontend Architect"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Initial Leave Entitlement (Days)</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Annual</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.annualLeave}
                        onChange={(e) => setFormData({ ...formData, annualLeave: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-xs border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Sick</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sickLeave}
                        onChange={(e) => setFormData({ ...formData, sickLeave: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-xs border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Casual</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.casualLeave}
                        onChange={(e) => setFormData({ ...formData, casualLeave: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-xs border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  {editingEmployee ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
