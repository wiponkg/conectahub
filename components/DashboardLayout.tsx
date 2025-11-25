
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, User } from '../types';
import { Logo } from './Logo';
import { Home, Calendar, Trophy, MessageSquare, HelpCircle, LogOut, UserCog, Camera, Sun, Moon, Menu, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../App';
import { OnboardingTour } from './OnboardingTour';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentView, onNavigate, user }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile sidebar
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State for logout modal
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Initialize local avatar state from the user prop
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarError, setAvatarError] = useState(false); // Controla erro de carregamento da imagem

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

  const handleLogoutClick = () => {
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
      setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
      setShowLogoutConfirm(false);
      onNavigate('LANDING');
  };
  
  // Update local avatar if the user prop changes
  useEffect(() => {
    setAvatar(user.avatar);
    setAvatarError(false); // Reset error when user changes
  }, [user.avatar]);

  const menuItems = [
    { icon: Home, label: 'Página inicial', view: 'DASHBOARD_HOME' as ViewState },
    { icon: Calendar, label: 'Calendário', view: 'DASHBOARD_CALENDAR' as ViewState },
    { icon: Trophy, label: 'Ranking', view: 'DASHBOARD_RANKING' as ViewState },
    { icon: MessageSquare, label: 'Chat', view: 'DASHBOARD_CHAT' as ViewState },
    { icon: HelpCircle, label: 'Pontos', view: 'DASHBOARD_POINTS' as ViewState },
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // 1. Optimistic UI update
        setAvatar(base64String);
        setAvatarError(false); // Assume new image works
        
        // 2. Persist to Firestore
        if (auth.currentUser) {
            try {
                const userDocRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(userDocRef, {
                    avatar: base64String
                });
                console.log("Avatar updated successfully in Firestore");
            } catch (error) {
                console.error("Error updating avatar:", error);
            }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNavigateMobile = (view: ViewState) => {
      onNavigate(view);
      setIsMobileMenuOpen(false);
  }

  const getInitials = (name: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderAvatar = (wClass: string, hClass: string, fontSizeClass: string = 'text-2xl') => {
      // Robust check for invalid avatar strings
      const isValidAvatar = avatar && 
                            avatar.trim() !== "" && 
                            avatar !== "undefined" && 
                            !avatar.includes("ui-avatars.com") &&
                            !avatarError;

      if (isValidAvatar) {
          return (
              <img 
                src={avatar} 
                alt={user.name} 
                className={`${wClass} ${hClass} rounded-full object-cover`}
                onError={() => setAvatarError(true)}
              />
          );
      }
      return (
          <div className={`${wClass} ${hClass} rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold tracking-wider shadow-inner ${fontSizeClass}`}>
              {getInitials(user.name)}
          </div>
      );
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      
      <OnboardingTour isOpen={isTourOpen} onClose={handleCloseTour} />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 animate-pop-in ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                        <LogOut size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Sair da conta?</h3>
                    <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Você precisará fazer login novamente para acessar a plataforma.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowLogoutConfirm(false)} 
                            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmLogout} 
                            className="flex-1 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MOBILE TOP BAR (Visible only on mobile) */}
      <div className={`md:hidden flex items-center justify-between p-4 sticky top-0 z-40 border-b shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <Logo onClick={() => onNavigate('LANDING')} isDark={isDarkMode} />
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
              <Menu size={24} />
          </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      )}

      {/* SIDEBAR (Drawer on mobile, Fixed on Desktop) */}
      <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 flex flex-col py-8 px-6 shadow-xl 
            transform transition-transform duration-300 ease-in-out
            md:translate-x-0 md:static md:h-screen md:rounded-r-3xl md:border-r
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}
      `}>
        
        {/* Mobile Close Button & Logo */}
        <div className="flex items-center justify-between mb-10 px-2">
            <div className="md:hidden">
                <Logo isDark={isDarkMode} />
            </div>
            <div className="hidden md:block">
                <Logo onClick={() => onNavigate('LANDING')} isDark={isDarkMode} />
            </div>
            <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <X size={24} />
            </button>
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
                    {renderAvatar('w-20', 'h-20')}
                </div>
            </button>
            
            <span className={`text-xl font-bold relative z-10 text-center transition-colors ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>
                {user.name}
            </span>

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
                    {/* Botão de Alterar foto REMOVIDO conforme solicitado */}
                    <button 
                        className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${isDarkMode ? 'hover:bg-slate-700 hover:text-blue-400 text-gray-300' : 'hover:bg-gray-50 hover:text-blue-600 text-gray-600'}`}
                        onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigate('DASHBOARD_PROFILE');
                        }}
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
                        onClick={handleLogoutClick}
                        className={`flex items-center gap-3 px-4 py-3 text-red-600 w-full text-left transition-colors border-t mt-1 ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-50 hover:bg-red-50'}`}
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            )}
        </div>

        <nav id="sidebar-nav" className="space-y-2 flex-1 relative z-10 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
                <button
                    key={item.label}
                    onClick={() => handleNavigateMobile(item.view)}
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

             <button onClick={handleLogoutClick} className={`flex items-center gap-4 w-full px-4 py-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:scale-[1.02]'}`}>
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* ml-0 on mobile, ml-64 on desktop (matching sidebar width) */}
      <main className={`flex-1 min-h-screen overflow-y-auto relative transition-colors duration-300 w-full md:ml-0 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {children}
      </main>
    </div>
  );
};
