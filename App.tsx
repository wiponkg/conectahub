
import React, { useState, createContext, useContext, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { RankingPage } from './components/RankingPage';
import { CalendarPage } from './components/CalendarPage';
import { QuizPage } from './components/QuizPage';
import { ProfilePage } from './components/ProfilePage';
import { ViewState, User, DEFAULT_USER } from './types';
import { auth, db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut, applyActionCode, User as FirebaseUser } from 'firebase/auth';
import { Logo } from './components/Logo';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

// Theme Context Definition
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | null>(null);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Helper to construct user object
  const constructUser = (firebaseUser: FirebaseUser, firestoreData: any = {}) => {
      let newAvatar = firestoreData.avatar !== undefined ? firestoreData.avatar : (firebaseUser.photoURL || DEFAULT_USER.avatar);
      if (newAvatar && (newAvatar.includes("ui-avatars.com") || newAvatar === "undefined")) {
          newAvatar = "";
      }
      return {
          uid: firebaseUser.uid,
          name: firestoreData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          email: firestoreData.email || firebaseUser.email || '',
          avatar: newAvatar,
          role: firestoreData.role || 'Colaborador',
          bio: firestoreData.bio || '',
          jobTitle: firestoreData.jobTitle || '',
          department: firestoreData.department || '',
          phone: firestoreData.phone || '',
          points: firestoreData.points || 0,
          completedMissions: firestoreData.completedMissions || [],
          hasSeenTour: firestoreData.hasSeenTour || false
      };
  };

  // Handle Firebase Action Links (Verify Email)
  useEffect(() => {
    const handleEmailVerification = async () => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            setVerificationStatus('verifying');
            try {
                // 1. Apply the verification code using modular auth
                await applyActionCode(auth, oobCode);
                
                // 2. Refresh the current user token to reflect the change
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    
                    // 3. Force update application state immediately
                    const updatedUser = auth.currentUser;
                    if (updatedUser?.emailVerified) {
                         setVerificationStatus('success');
                    }
                } else {
                     setVerificationStatus('success');
                }

                setTimeout(() => {
                    setVerificationStatus(null);
                    // Remove query params to clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // If we have a user, ensure they are on Dashboard
                    if (auth.currentUser) {
                        setCurrentView('DASHBOARD_HOME');
                    } else {
                        setCurrentView('LOGIN');
                    }
                }, 3000);
            } catch (error) {
                console.error("Verification error:", error);
                setVerificationStatus('error');
            }
        }
    };

    handleEmailVerification();
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // Cleanup previous user listener if it exists
        if (userUnsubscribe) {
            userUnsubscribe();
            userUnsubscribe = null;
        }

        if (firebaseUser) {
            // Check if we are currently in a verification flow
            const isVerifyingURL = window.location.search.includes('oobCode');

            // Force reload to get the latest emailVerified status
            try { await firebaseUser.reload(); } catch(e) {}

            // SECURITY CHECK: Email Verification
            // IMPORTANT: If we are actively verifying (isVerifyingURL is true), DO NOT log out yet.
            if (!firebaseUser.emailVerified && !isVerifyingURL) {
                setCurrentUser(null);
                setIsLoading(false);
                return;
            }

            // 1. Set basic user immediately using Auth data to unblock UI
            const initialUser = constructUser(firebaseUser);
            setCurrentUser(initialUser);

            // Redirect logic - Only redirect if we are verified
            if (firebaseUser.emailVerified) {
                setCurrentView((prevView) => {
                    if (['LANDING', 'LOGIN', 'REGISTER'].includes(prevView)) {
                        return 'DASHBOARD_HOME';
                    }
                    return prevView;
                });
            }

            // Stop global loading immediately so user sees the dashboard
            setIsLoading(false);

            // 2. Listen to Firestore updates
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setCurrentUser(prev => {
                            if (!prev) return null;
                            return constructUser(firebaseUser, userData);
                        });
                    } 
                });
            } catch (error) {
                console.error("Error setting up Firestore listener:", error);
            }

        } else {
            setCurrentUser(null);
            setCurrentView((prevView) => {
                if (!['LANDING', 'LOGIN', 'REGISTER'].includes(prevView)) {
                    return 'LANDING';
                }
                return prevView;
            });
            setIsLoading(false);
        }
    });

    return () => {
        authUnsubscribe();
        if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const navigateTo = (view: ViewState) => {
    window.scrollTo(0, 0);
    if (view.startsWith('DASHBOARD') && !currentUser && !isLoading) {
        setCurrentView('LOGIN');
        return;
    }
    if (view === 'LANDING' && currentUser) {
        signOut(auth);
        setCurrentUser(null);
    }
    setCurrentView(view);
  };

  const renderView = () => {
    if (isLoading || verificationStatus === 'verifying') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center gap-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div className="scale-125 mb-4">
                    <Logo isDark={isDarkMode} />
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2 animate-pulse">
                         <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                             {verificationStatus === 'verifying' ? 'Validando E-mail' : 'Carregando ConectaHub'}
                         </h2>
                         <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                             Isso vai levar apenas um momento...
                         </p>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'success') {
         return (
             <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                 <div className="mb-8 scale-110">
                    <Logo isDark={isDarkMode} />
                 </div>
                 <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl text-center animate-pop-in relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                     
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[popIn_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
                         <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={3} />
                     </div>
                     
                     <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                         E-mail Verificado!
                     </h2>
                     <p className={`text-sm md:text-base mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         Sua conta foi ativada com sucesso. Você já faz parte da nossa comunidade.
                     </p>
                     
                     <div className="space-y-3">
                         <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                             Redirecionando para o sistema
                         </p>
                         <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <div className="h-full bg-gradient-to-r from-blue-500 to-green-400 animate-[width_3s_ease-in-out_forwards]" style={{width: '0%'}}></div>
                         </div>
                     </div>
                 </div>
             </div>
         );
    }

    if (verificationStatus === 'error') {
         return (
             <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                 <div className="mb-8 scale-110">
                    <Logo isDark={isDarkMode} />
                 </div>
                 <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl text-center animate-pop-in relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

                     <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <XCircle className="w-10 h-10 text-red-500" strokeWidth={2} />
                     </div>

                     <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                         Link Expirado ou Inválido
                     </h2>
                     <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         Não foi possível verificar seu e-mail. O link pode já ter sido utilizado ou o tempo limite expirou.
                     </p>

                     <button 
                        onClick={() => { setVerificationStatus(null); navigateTo('LOGIN'); }} 
                        className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                     >
                        Voltar para Login <ArrowRight size={18} />
                     </button>
                 </div>
             </div>
         );
    }

    switch (currentView) {
      case 'LANDING':
        return <LandingPage onNavigate={navigateTo} />;
      case 'LOGIN':
        return <LoginPage onNavigate={navigateTo} />;
      case 'REGISTER':
        return <RegisterPage onNavigate={navigateTo} />;
      case 'DASHBOARD_HOME':
        return currentUser ? (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <DashboardHome user={currentUser} />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_RANKING':
        return currentUser ? (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <RankingPage />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_CALENDAR':
        return currentUser ? (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <CalendarPage />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_POINTS':
        return currentUser ? (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <QuizPage user={currentUser} onNavigate={navigateTo} />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_PROFILE':
        return currentUser ? (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
             <ProfilePage user={currentUser} />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_CHAT':
         return currentUser ? (
            <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">🚧</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Chat em Desenvolvimento</h2>
                    <p className="text-gray-500 max-w-md">Em breve você poderá conversar com seus colegas de equipe em tempo real por aqui.</p>
                </div>
            </DashboardLayout>
         ) : <LoginPage onNavigate={navigateTo} />;
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen w-full ${isDarkMode ? 'bg-brand-dark' : 'bg-white'}`}>
        {renderView()}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
