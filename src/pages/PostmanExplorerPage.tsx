import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { getAuthToken } from '../services/api.ts';
import { 
  Terminal, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Key, 
  ShieldCheck, 
  Globe, 
  Code2 
} from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  module: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  requiredRole?: string;
  defaultBody?: string;
}

const ENDPOINTS: EndpointConfig[] = [
  // 1. Auth Module
  {
    id: 'auth_demo',
    name: 'Get Demo Credentials',
    module: 'Authentication',
    method: 'GET',
    path: '/api/auth/demo-accounts',
    description: 'Retrieves pre-seeded credentials for HR, Manager, and Employee.',
    requiresAuth: false,
  },
  {
    id: 'auth_login_hr',
    name: 'Login as HR Admin',
    module: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticates HR account and generates JWT signed token.',
    requiresAuth: false,
    defaultBody: JSON.stringify({ email: 'hr@staffsync.io', password: 'StaffSync@123' }, null, 2),
  },
  {
    id: 'auth_login_mgr',
    name: 'Login as Team Manager',
    module: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticates Manager account and issues JWT token.',
    requiresAuth: false,
    defaultBody: JSON.stringify({ email: 'manager@staffsync.io', password: 'StaffSync@123' }, null, 2),
  },
  {
    id: 'auth_login_emp',
    name: 'Login as Staff Employee',
    module: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticates standard employee account.',
    requiresAuth: false,
    defaultBody: JSON.stringify({ email: 'alex@staffsync.io', password: 'StaffSync@123' }, null, 2),
  },
  {
    id: 'auth_register',
    name: 'Register New Employee',
    module: 'Authentication',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Registers a new user record with bcrypt password hashing and default leave balances.',
    requiresAuth: false,
    defaultBody: JSON.stringify(
      {
        name: 'Samantha Wright',
        email: 'samantha.w@staffsync.io',
        password: 'Password@2026',
        role: 'employee',
        department: 'Engineering',
        designation: 'QA Automation Engineer',
        phone: '+1 (555) 888-9999',
      },
      null,
      2
    ),
  },
  {
    id: 'auth_me',
    name: 'Verify Token & Get Profile',
    module: 'Authentication',
    method: 'GET',
    path: '/api/auth/me',
    description: 'Protected route that verifies JWT in Authorization Bearer header.',
    requiresAuth: true,
  },

  // 2. Employee Management
  {
    id: 'emp_all',
    name: 'Get All Employees (HR/Manager)',
    module: 'Employee Management',
    method: 'GET',
    path: '/api/employees',
    description: 'Returns employee directory with role and department filters.',
    requiresAuth: true,
    requiredRole: 'HR, Manager',
  },
  {
    id: 'emp_stats',
    name: 'Get Headcount & Department Stats',
    module: 'Employee Management',
    method: 'GET',
    path: '/api/employees/stats/summary',
    description: 'Aggregates headcount by role and department.',
    requiresAuth: true,
    requiredRole: 'HR, Manager',
  },

  // 3. Leaves
  {
    id: 'leave_my',
    name: 'Get My Leaves & Balance',
    module: 'Leave Management',
    method: 'GET',
    path: '/api/leaves/my',
    description: 'Returns personal leave records and remaining balances.',
    requiresAuth: true,
  },
  {
    id: 'leave_apply',
    name: 'Apply for Leave',
    module: 'Leave Management',
    method: 'POST',
    path: '/api/leaves',
    description: 'Submits a leave request with balance verification.',
    requiresAuth: true,
    defaultBody: JSON.stringify(
      {
        leaveType: 'annual',
        startDate: '2026-11-15',
        endDate: '2026-11-17',
        reason: 'Attending annual technology conference in Boston.',
      },
      null,
      2
    ),
  },

  // 4. Attendance
  {
    id: 'att_today',
    name: 'Get Today Attendance Status',
    module: 'Attendance',
    method: 'GET',
    path: '/api/attendance/today',
    description: 'Checks if current user is clocked in or out today.',
    requiresAuth: true,
  },
  {
    id: 'att_in',
    name: 'Check In for Workday',
    module: 'Attendance',
    method: 'POST',
    path: '/api/attendance/check-in',
    description: 'Marks arrival time and work mode (office/remote).',
    requiresAuth: true,
    defaultBody: JSON.stringify({ workMode: 'office', notes: 'Testing check-in API' }, null, 2),
  },

  // 5. Announcements
  {
    id: 'ann_list',
    name: 'Get All Announcements',
    module: 'Announcements',
    method: 'GET',
    path: '/api/announcements',
    description: 'Fetches company bulletin board notices.',
    requiresAuth: true,
  },

  // 6. Training
  {
    id: 'trn_list',
    name: 'Get All Training Programs',
    module: 'Training & Development',
    method: 'GET',
    path: '/api/trainings',
    description: 'Lists all available curricula and participant statuses.',
    requiresAuth: true,
  },
];

export const PostmanExplorerPage: React.FC = () => {
  const { user, role, token } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[1]); // Default to HR login
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('// Click "Send Request" to test this endpoint live');
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setResponseBody('// Ready to test');
    setResponseStatus(null);
    setResponseTimeMs(null);
  };

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setResponseBody('// Executing request...');
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const currentToken = getAuthToken();
      if (selectedEndpoint.requiresAuth && currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const headerObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headerObj[key] = val;
      });
      setResponseHeaders(headerObj);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: any) {
      setResponseBody(`Error executing request:\n${err.message}`);
      setResponseStatus(500);
    } finally {
      setIsExecuting(false);
    }
  };

  const currentToken = getAuthToken();
  const curlCommand = `curl -X ${selectedEndpoint.method} "${window.location.origin}${selectedEndpoint.path}" \\
  -H "Content-Type: application/json"${
    selectedEndpoint.requiresAuth && currentToken
      ? ` \\\n  -H "Authorization: Bearer ${currentToken}"`
      : ''
  }${
    ['POST', 'PUT'].includes(selectedEndpoint.method) && requestBody
      ? ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`
      : ''
  }`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Postman & REST API Test Runner
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
              Postman Tested
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test backend authentication, JWT Bearer tokens, role guards, and endpoints live against the Express server.
          </p>
        </div>

        <a
          href="/api/postman-collection"
          download="StaffSync_HRMS.postman_collection.json"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Postman Collection (.json)</span>
        </a>
      </div>

      {/* Active Auth Token Bar */}
      <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-300">Active Bearer Token:</span>
          <span className="font-mono text-[11px] text-amber-300 truncate max-w-xs md:max-w-md">
            {currentToken ? `${currentToken.substring(0, 36)}...` : 'None (Log in to attach token)'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Logged in as:</span>
          <span className="font-bold text-white capitalize">{user ? `${user.name} (${role})` : 'Guest'}</span>
        </div>
      </div>

      {/* Grid: Endpoints list & Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Selector Column */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Available API Endpoints
          </span>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              const methodBg =
                ep.method === 'GET'
                  ? 'bg-blue-100 text-blue-800'
                  : ep.method === 'POST'
                  ? 'bg-emerald-100 text-emerald-800'
                  : ep.method === 'PUT'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800';

              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl transition border text-xs ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200'
                      : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${methodBg}`}>
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{ep.module}</span>
                  </div>
                  <div className="font-bold text-slate-900 leading-snug">{ep.name}</div>
                  <div className="font-mono text-[10px] text-slate-500 truncate mt-0.5">{ep.path}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Console & Runner Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Request Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="px-2 py-1 rounded bg-slate-900 text-white font-bold">
                  {selectedEndpoint.method}
                </span>
                <span className="text-slate-800 font-bold">{selectedEndpoint.path}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyCurl}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                </button>

                <button
                  onClick={handleExecuteRequest}
                  disabled={isExecuting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600">
              {selectedEndpoint.description}{' '}
              {selectedEndpoint.requiredRole && (
                <span className="text-rose-600 font-semibold">(Requires: {selectedEndpoint.requiredRole})</span>
              )}
            </p>

            {/* Body Editor if POST / PUT */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Request JSON Body
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl focus:ring-2 focus:ring-blue-500 border border-slate-800"
                />
              </div>
            )}

            {/* Response Viewer */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Response Payload</span>
                {responseStatus !== null && (
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-mono text-slate-500">{responseTimeMs} ms</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Status: {responseStatus}
                    </span>
                  </div>
                )}
              </div>

              <pre className="font-mono text-xs p-4 bg-slate-950 text-slate-100 rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                {responseBody}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
