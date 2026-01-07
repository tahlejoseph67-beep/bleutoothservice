
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { AuthService } from './services/mockDatabase';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import ClientDashboard from './pages/client/ClientDashboard';
import Deposit from './pages/client/Deposit';
import Transfer from './pages/client/Transfer';
import AdminDashboard from './pages/admin/AdminDashboard';
import IdentityVerification from './pages/client/IdentityVerification';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentPage(storedUser.role === UserRole.ADMIN ? 'admin-dashboard' : 'dashboard');
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentPage(newUser.role === UserRole.ADMIN ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (user.role === UserRole.ADMIN) {
        switch (currentPage) {
            case 'admin-dashboard': return <AdminDashboard />;
            default: return <AdminDashboard />;
        }
    } else {
        switch (currentPage) {
            case 'dashboard': return <ClientDashboard user={user} />;
            case 'deposit': return <Deposit onSuccess={() => setCurrentPage('dashboard')} />;
            case 'transfer': return <Transfer onSuccess={() => setCurrentPage('dashboard')} onNavigateToVerify={() => setCurrentPage('verify')} />;
            case 'verify': return <IdentityVerification onComplete={() => {
                // Refresh local user state
                setUser(AuthService.getCurrentUser());
                setCurrentPage('dashboard');
            }} />;
            default: return <ClientDashboard user={user} />;
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar 
        user={user} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8 transition-all">
        <div className="max-w-6xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
