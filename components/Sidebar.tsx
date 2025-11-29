import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Send, Wallet, LogOut, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  user: User;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onNavigate, currentPage, onLogout }) => {
  const menuItems = user.role === UserRole.ADMIN 
    ? [
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'validation', label: 'Validations', icon: ShieldCheck },
      ]
    : [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'deposit', label: 'Dépôt (KKIAPAY)', icon: Wallet },
        { id: 'transfer', label: 'Transfert', icon: Send },
      ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          BLEUTOOTH
          <span className="block text-sm text-slate-400 font-normal">SERVICE</span>
        </h1>
      </div>

      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;