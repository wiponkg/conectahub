
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, User } from '../types';
import { Logo } from './Logo';
import { Home, Calendar, Trophy, MessageSquare, HelpCircle, LogOut, UserCog, Camera } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentView, onNavigate, user }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  // Initialize local avatar state from the user prop
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update local avatar if the user prop changes (e.g. re-login)
  useEffect(() => {
    setAvatar(user.avatar);
  }, [user.avatar]);

  const menuItems = [
    { icon: Home, label: 'Página inicial', view: 'DASHBOARD_HOME' as ViewState },
    { icon: Calendar, label: 'Calendário', view: 'DASHBOARD_CALENDAR' as ViewState },
    { icon: Trophy, label: 'Ranking', view: 'DASHBOARD_RANKING' as ViewState },
    { icon: MessageSquare, label: 'Chat', view: 'DASHBOARD_CHAT' as ViewState },
    { icon: HelpCircle, label: 'Pontos', view: 'DASHBOARD_POINTS' as ViewState },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsProfileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col py-8 px-6 bg-white fixed h-full z-30 shadow-xl rounded-r-3xl">
        <div className="mb-10 px-2">
            <Logo onClick={() => onNavigate('LANDING')} />
        </div>

        <div className="flex flex-col items-center gap-3 mb-10 relative">
            <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative group focus:outline-none"
            >
                {/* Subtle Pulse Animation Layer */}
                <div className="absolute -inset-2 bg-blue-400 rounded-full opacity-40 blur-md animate-pulse group-hover:opacity-60 transition-opacity"></div>
                
                <div className="relative p-1 rounded-full border-2 border-blue-500 bg-white z-10 transition-transform group-hover:scale-105">
                    <img 
                        src={avatar} 
                        alt={user.name} 
                        className="w-20 h-20 rounded-full object-cover"
                    />
                </div>
            </button>
            
            <span className="text-xl font-bold text-slate-800 relative z-10">{user.name}</span>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
                <div className="absolute top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-sm font-medium text-gray-700 animate-fade-in origin-top">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-normal">Conectado como</p>
                        <p className="text-gray-900 truncate">{user.name}</p>
                    </div>
                    <button 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left transition-colors text-gray-600 hover:text-blue-600"
                        onClick={handleUploadClick}
                    >
                        <Camera size={18} /> Alterar foto
                    </button>
                    <button 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left transition-colors text-gray-600 hover:text-blue-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                    >
                        <UserCog size={18} /> Editar perfil
                    </button>
                    <button
                        onClick={() => onNavigate('LANDING')}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 w-full text-left transition-colors border-t border-gray-50 mt-1"
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            )}
        </div>

        <nav className="space-y-2 flex-1 relative z-10">
            {menuItems.map((item) => (
                <button
                    key={item.label}
                    onClick={() => onNavigate(item.view)}
                    className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                        currentView === item.view 
                        ? 'text-blue-700 bg-blue-50 font-bold shadow-sm' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                    <item.icon size={22} className={`transition-colors ${currentView === item.view ? "text-blue-700" : "text-gray-400 group-hover:text-blue-600"}`} />
                    <span className="text-sm">{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 relative z-10">
             <button onClick={() => onNavigate('LANDING')} className="flex items-center gap-4 text-gray-400 hover:text-red-500 transition-colors w-full px-4">
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto bg-brand-dark relative">
         {/* Subtle pattern overlay if desired, currently just solid brand-dark */}
        {children}
      </main>
    </div>
  );
};
