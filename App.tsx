
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
import { onAuthStateChanged, signOut, applyActionCode } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

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
  const constructUser = (firebaseUser: any, firestoreData: any = {}) => {
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
          completedMissions: firestoreData.completedMissions || []
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
                // 1. Apply the verification code to Firebase Auth
                await applyActionCode(auth, oobCode);
                
                // 2. Refresh the current user token to reflect the change
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    
                    // 3. Force update application state immediately
                    const updatedUser = auth.currentUser;
                    if (updatedUser?.emailVerified) {
                        // Fetch Firestore data to complete login
                        // This handles the "I clicked the link, now log me in" flow
                        // Note: actual user data loading happens in onAuthStateChanged mostly, 
                        // but we trigger a manual view update here for UX speed.
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
    if (!auth) {
        setIsLoading(false);
        return;
    }

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
            // Let the verification effect finish its job.
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
        if (auth) signOut(auth);
        setCurrentUser(null);
    }
    setCurrentView(view);
  };

  const renderView = () => {
    if (isLoading || verificationStatus === 'verifying') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                {verificationStatus === 'verifying' ? (
                     <p className="text-white animate-pulse">Validando seu email...</p>
                ) : (
                     <p className="text-white animate-pulse">Carregando...</p>
                )}
            </div>
        );
    }

    // Success/Error Overlay for Verification
    if (verificationStatus === 'success') {
         return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4 text-center">
                 <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-pop-in">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">✓</div>
                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verificado!</h2>
                     <p className="text-gray-600 mb-6">Sua conta foi ativada. Entrando no sistema...</p>
                     <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-[width_3s_ease-in-out_forwards]" style={{width: '0%'}}></div>
                     </div>
                 </div>
             </div>
         );
    }

    if (verificationStatus === 'error') {
         return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4 text-center">
                 <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-pop-in">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-3xl">!</div>
                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Inválido ou Expirado</h2>
                     <p className="text-gray-600 mb-6">Não foi possível verificar seu email. O link pode já ter sido usado ou expirou.</p>
                     <button onClick={() => { setVerificationStatus(null); navigateTo('LOGIN'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">Voltar para Login</button>
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
