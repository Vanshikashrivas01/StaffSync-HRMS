const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('staffsync_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('staffsync_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('staffsync_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<{ success: boolean; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<{ success: boolean; user: any }>('/auth/me'),
    updateProfile: (profileData: any) =>
      request<{ success: boolean; user: any; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    getDemoAccounts: () =>
      request<{ success: boolean; accounts: any[] }>('/auth/demo-accounts'),
  },

  // Employees
  employees: {
    getAll: (params?: { department?: string; role?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.department) searchParams.append('department', params.department);
      if (params?.role) searchParams.append('role', params.role);
      if (params?.search) searchParams.append('search', params.search);
      const query = searchParams.toString();
      return request<{ success: boolean; count: number; employees: any[] }>(`/employees${query ? `?${query}` : ''}`);
    },
    getStats: () => request<{ success: boolean; stats: any }>('/employees/stats/summary'),
    getById: (id: string) => request<{ success: boolean; employee: any }>(`/employees/${id}`),
    create: (data: any) =>
      request<{ success: boolean; employee: any; message: string }>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean; employee: any; message: string }>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/employees/${id}`, {
        method: 'DELETE',
      }),
  },

  // Leaves
  leaves: {
    apply: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
      request<{ success: boolean; leave: any; message: string }>('/leaves', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyLeaves: () =>
      request<{ success: boolean; leaveBalance: any; leaves: any[] }>('/leaves/my'),
    getAll: (status?: string) =>
      request<{ success: boolean; count: number; leaves: any[] }>(
        `/leaves${status ? `?status=${encodeURIComponent(status)}` : ''}`
      ),
    updateStatus: (id: string, status: 'approved' | 'rejected', reviewComments?: string) =>
      request<{ success: boolean; leave: any; message: string }>(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reviewComments }),
      }),
  },

  // Attendance
  attendance: {
    checkIn: (data?: { workMode?: string; notes?: string }) =>
      request<{ success: boolean; message: string; attendance: any }>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    checkOut: () =>
      request<{ success: boolean; message: string; attendance: any }>('/attendance/check-out', {
        method: 'POST',
      }),
    getToday: () =>
      request<{ success: boolean; attendance: any; isCheckedIn: boolean; isCheckedOut: boolean }>(
        '/attendance/today'
      ),
    getAll: (date?: string) =>
      request<{ success: boolean; summary: any; records: any[] }>(
        `/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`
      ),
  },

  // Announcements
  announcements: {
    getAll: () =>
      request<{ success: boolean; count: number; announcements: any[] }>('/announcements'),
    create: (data: { title: string; content: string; priority?: string; category?: string; pinned?: boolean }) =>
      request<{ success: boolean; announcement: any; message: string }>('/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/announcements/${id}`, {
        method: 'DELETE',
      }),
  },

  // Training
  trainings: {
    getAll: () =>
      request<{ success: boolean; count: number; trainings: any[] }>('/trainings'),
    create: (data: any) =>
      request<{ success: boolean; training: any; message: string }>('/trainings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    assign: (trainingId: string, employeeIds: string[]) =>
      request<{ success: boolean; training: any; message: string }>(`/trainings/${trainingId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ employeeIds }),
      }),
    updateProgress: (trainingId: string, progressPercent: number, employeeId?: string, score?: number) =>
      request<{ success: boolean; training: any; message: string }>(`/trainings/${trainingId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ employeeId, progressPercent, score }),
      }),
  },

  // Health & Info
  system: {
    getHealth: () => request<any>('/health'),
  },
};
