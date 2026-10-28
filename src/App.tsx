import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EmployeesPage } from './pages/EmployeesPage.tsx';
import { LeavesPage } from './pages/LeavesPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { TrainingPage } from './pages/TrainingPage.tsx';
import { PostmanExplorerPage } from './pages/PostmanExplorerPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-700">Initializing StaffSync Session...</p>
        <p className="text-[11px] text-slate-400 mt-1">Connecting to REST server and validating JWT tokens</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'employees' && <EmployeesPage />}
          {activeTab === 'leaves' && <LeavesPage />}
          {activeTab === 'attendance' && <AttendancePage />}
          {activeTab === 'announcements' && <AnnouncementsPage />}
          {activeTab === 'training' && <TrainingPage />}
          {activeTab === 'postman' && <PostmanExplorerPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
