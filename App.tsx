import React, { useState, createContext, useContext, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { RankingPage } from './components/RankingPage';
import { CalendarPage } from './components/CalendarPage';
import { QuizPage } from './components/QuizPage';
import { ViewState, User, DEFAULT_USER } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!auth) {
        setIsLoading(false);
        return;
    }

    let userUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        // Cleanup previous user listener if it exists
        if (userUnsubscribe) {
            userUnsubscribe();
            userUnsubscribe = null;
        }

        if (firebaseUser) {
            // 1. Set basic user immediately using Auth data to unblock UI
            const userProfile: User = {
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
                avatar: firebaseUser.photoURL || DEFAULT_USER.avatar,
                role: 'Colaborador'
            };

            setCurrentUser(userProfile);

            // Redirect logic
            setCurrentView((prevView) => {
                // Do not auto-redirect if on REGISTER to allow registration flow to complete
                if (prevView === 'REGISTER') {
                    return prevView;
                }
                if (['LANDING', 'LOGIN'].includes(prevView)) {
                    return 'DASHBOARD_HOME';
                }
                return prevView;
            });

            // Stop global loading immediately so user sees the dashboard
            setIsLoading(false);

            // 2. Listen to Firestore updates (Robust against offline/network issues)
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setCurrentUser(prev => {
                            if (!prev) return null; // Safety check
                            return {
                                ...prev,
                                name: userData.name || prev.name,
                                avatar: userData.avatar || prev.avatar,
                                role: userData.role || prev.role
                            };
                        });
                    } 
                }, (error) => {
                    // Quietly log error, user still has basic Auth profile
                    console.warn("Firestore sync warning:", error.message);
                });
            } catch (error) {
                console.error("Error setting up Firestore listener:", error);
            }

        } else {
            // User is signed out
            setCurrentUser(null);
            
            // Redirect to Landing if on a private route
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
  }, []); // Only run once on mount

  const navigateTo = (view: ViewState) => {
    window.scrollTo(0, 0);
    
    // Simple protection: Prevent accessing dashboard if not logged in
    if (view.startsWith('DASHBOARD') && !currentUser && !isLoading) {
        setCurrentView('LOGIN');
        return;
    }

    // Handle Logout
    if (view === 'LANDING' && currentUser) {
        if (auth) signOut(auth);
        setCurrentUser(null);
    }

    setCurrentView(view);
  };

  const renderView = () => {
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
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
            <QuizPage />
          </DashboardLayout>
        ) : <LoginPage onNavigate={navigateTo} />;
      case 'DASHBOARD_CHAT':
         return currentUser ? (
            <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
                <div className="flex items-center justify-center h-full text-gray-500">Funcionalidade de Chat em desenvolvimento</div>
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