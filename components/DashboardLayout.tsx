
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, User } from '../types';
import { Logo } from './Logo';
import { Home, Calendar, Trophy, MessageSquare, HelpCircle, LogOut, UserCog, Camera, Sun, Moon } from 'lucide-react';
import { useTheme } from '../App';
import { OnboardingTour } from './OnboardingTour';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentView, onNavigate, user }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Initialize local avatar state from the user prop
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check for first-time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('conectahub_tour_completed');
    if (!hasSeenTour) {
        // Small delay to allow rendering
        setTimeout(() => setIsTourOpen(true), 1000);
    }
  }, []);

  const handleCloseTour = () => {
      setIsTourOpen(false);
      localStorage.setItem('conectahub_tour_completed', 'true');
  };

  const handleRestartTour = () => {
      setIsProfileMenuOpen(false);
      setIsTourOpen(true);
  };
  
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
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      
      <OnboardingTour isOpen={isTourOpen} onClose={handleCloseTour} />

      {/* Sidebar */}
      <aside className={`w-64 flex flex-col py-8 px-6 fixed h-full z-30 shadow-xl rounded-r-3xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-100'}`}>
        <div className="mb-10 px-2">
            <Logo onClick={() => onNavigate('LANDING')} isDark={isDarkMode} />
        </div>

        <div className="flex flex-col items-center gap-3 mb-10 relative">
            <button 
                id="user-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative group focus:outline-none"
            >
                {/* Subtle Pulse Animation Layer */}
                <div className={`absolute -inset-2 rounded-full opacity-40 blur-md animate-pulse group-hover:opacity-60 transition-opacity ${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                
                <div className={`relative p-1 rounded-full border-2 transition-transform group-hover:scale-105 z-10 ${isDarkMode ? 'bg-slate-800 border-blue-400' : 'bg-white border-blue-500'}`}>
                    <img 
                        src={avatar} 
                        alt={user.name} 
                        className="w-20 h-20 rounded-full object-cover"
                    />
                </div>
            </button>
            
            <span className={`text-xl font-bold relative z-10 transition-colors ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>{user.name}</span>

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
                <div className={`absolute top-full mt-2 w-56 rounded-xl shadow-2xl border py-2 z-50 text-sm font-medium animate-fade-in origin-top transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-white border-gray-100 text-gray-700'}`}>
                    <div className={`px-4 py-2 border-b mb-1 ${isDarkMode ? 'border-slate-700' : 'border-gray-50'}`}>
                        <p className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Conectado como</p>
                        <p className={`truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    </div>
                    <button 
                        className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${isDarkMode ? 'hover:bg-slate-700 hover:text-blue-400 text-gray-300' : 'hover:bg-gray-50 hover:text-blue-600 text-gray-600'}`}
                        onClick={handleUploadClick}
                    >
                        <Camera size={18} /> Alterar foto
                    </button>
                    <button 
                        className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${isDarkMode ? 'hover:bg-slate-700 hover:text-blue-400 text-gray-300' : 'hover:bg-gray-50 hover:text-blue-600 text-gray-600'}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                    >
                        <UserCog size={18} /> Editar perfil
                    </button>
                    <button
                        className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${isDarkMode ? 'hover:bg-slate-700 hover:text-blue-400 text-gray-300' : 'hover:bg-gray-50 hover:text-blue-600 text-gray-600'}`}
                        onClick={handleRestartTour}
                    >
                        <HelpCircle size={18} /> Reiniciar Tour
                    </button>
                    <button
                        onClick={() => onNavigate('LANDING')}
                        className={`flex items-center gap-3 px-4 py-3 text-red-600 w-full text-left transition-colors border-t mt-1 ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-50 hover:bg-red-50'}`}
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            )}
        </div>

        <nav id="sidebar-nav" className="space-y-2 flex-1 relative z-10">
            {menuItems.map((item) => (
                <button
                    key={item.label}
                    onClick={() => onNavigate(item.view)}
                    className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300 group ${
                        currentView === item.view 
                        ? (isDarkMode 
                            ? 'text-blue-400 bg-blue-900/20 font-bold shadow-sm border border-blue-900/30' 
                            : 'text-blue-700 bg-blue-50 font-bold shadow-sm scale-[1.02]') 
                        : (isDarkMode 
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-[1.02]')
                    }`}
                >
                    <item.icon size={22} className={`transition-colors ${
                        currentView === item.view 
                        ? (isDarkMode ? "text-blue-400" : "text-blue-700") 
                        : (isDarkMode ? "text-slate-500 group-hover:text-blue-400" : "text-gray-400 group-hover:text-blue-600")
                    }`} />
                    <span className="text-sm">{item.label}</span>
                </button>
            ))}
        </nav>

        <div className={`mt-auto pt-6 border-t relative z-10 flex flex-col gap-2 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
             <button 
                onClick={toggleTheme}
                className={`flex items-center gap-4 w-full px-4 py-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'text-slate-400 hover:text-yellow-400 hover:bg-slate-800' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-sm font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
             </button>

             <button onClick={() => onNavigate('LANDING')} className={`flex items-center gap-4 w-full px-4 py-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:scale-[1.02]'}`}>
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 min-h-screen overflow-y-auto relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {children}
      </main>
    </div>
  );
};
