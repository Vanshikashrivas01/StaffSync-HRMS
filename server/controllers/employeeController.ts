import { Response } from 'express';
import { DataService } from '../services/dataService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

/**
 * @desc    Get all employees with optional department/role filters
 * @route   GET /api/employees
 * @access  Private (HR, Manager)
 */
export const getAllEmployees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await DataService.getAllUsers();
    const department = req.query.department as string;
    const role = req.query.role as string;
    const search = (req.query.search as string || '').toLowerCase();

    let filtered = users;
    if (department) {
      filtered = filtered.filter(u => u.department.toLowerCase() === department.toLowerCase());
    }
    if (role) {
      filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search) ||
        u.designation.toLowerCase().includes(search)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      employees: filtered,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching employees list.',
    });
  }
};

/**
 * @desc    Get single employee details
 * @route   GET /api/employees/:id
 * @access  Private
 */
export const getEmployeeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await DataService.findUserById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }
    res.status(200).json({ success: true, employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new employee profile
 * @route   POST /api/employees
 * @access  Private (HR only)
 */
export const createEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, designation, phone, joiningDate, leaveBalance } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existing = await DataService.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ success: false, message: 'Employee with this email already exists.' });
      return;
    }

    const newEmp = await DataService.createUser({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || 'Engineering',
      designation: designation || 'Associate',
      phone: phone || '+1 (555) 000-0000',
      joiningDate: joiningDate || new Date(),
      leaveBalance: leaveBalance || { annual: 15, sick: 10, casual: 7 },
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      employee: newEmp,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (HR only)
 */
export const updateEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await DataService.updateUser(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Employee record not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      employee: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete employee record
 * @route   DELETE /api/employees/:id
 * @access  Private (HR only)
 */
export const deleteEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await DataService.deleteUser(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Employee record not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Employee record deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get departmental headcount and stats
 * @route   GET /api/employees/stats/summary
 * @access  Private (HR, Manager)
 */
export const getEmployeeStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await DataService.getAllUsers();
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const byRole = {
      hr: users.filter(u => u.role === 'hr').length,
      manager: users.filter(u => u.role === 'manager').length,
      employee: users.filter(u => u.role === 'employee').length,
    };

    const departmentMap: Record<string, number> = {};
    users.forEach(u => {
      departmentMap[u.department] = (departmentMap[u.department] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: total,
        activeEmployees: active,
        byRole,
        byDepartment: departmentMap,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
