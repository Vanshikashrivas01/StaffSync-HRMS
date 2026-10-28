import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Megaphone,
  GraduationCap,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      roles: ['hr', 'manager', 'employee'],
      badge: 'Live',
    },
    {
      id: 'employees',
      label: 'Employee Directory',
      icon: Users,
      roles: ['hr', 'manager'],
      badge: role === 'hr' ? 'CRUD' : undefined,
    },
    {
      id: 'leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      id: 'attendance',
      label: 'Attendance Tracking',
      icon: Clock,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      id: 'announcements',
      label: 'Announcements & News',
      icon: Megaphone,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      id: 'training',
      label: 'Training & Development',
      icon: GraduationCap,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      id: 'postman',
      label: 'Postman & REST API',
      icon: Terminal,
      roles: ['hr', 'manager', 'employee'],
      highlight: true,
      badge: 'Testing',
    },
  ];

  const visibleItems = navigationItems.filter(item => 
    !role || item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Indicator Banner */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Active Workspace
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 capitalize">
            {role === 'hr' ? 'HR Operations Hub' : role === 'manager' ? 'Manager Command' : 'Employee Self-Service'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
            {role}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Modules & Workflows
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-blue-700/60 text-white'
                      : item.highlight
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Architecture Stack card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-2 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-1">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>MERN Architecture</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Express 4 + Mongoose schemas + JWT Bearer RBAC + React 19 UI.
        </p>
      </div>
    </aside>
  );
};
