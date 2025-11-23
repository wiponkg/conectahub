
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
import { doc, getDoc } from 'firebase/firestore';

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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                // User is signed in, fetch additional profile data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentUser({
                        name: userData.name || 'Usuário',
                        avatar: userData.avatar || DEFAULT_USER.avatar,
                        role: userData.role || 'Colaborador'
                    });
                } else {
                    // Fallback if no firestore doc exists
                    setCurrentUser({
                        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
                        avatar: firebaseUser.photoURL || DEFAULT_USER.avatar,
                        role: 'Colaborador'
                    });
                }
                // Only redirect to dashboard if we are on a public page
                if (['LANDING', 'LOGIN', 'REGISTER'].includes(currentView)) {
                    setCurrentView('DASHBOARD_HOME');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            // User is signed out
            setCurrentUser(null);
            // If on a private route, redirect to Landing
            if (!['LANDING', 'LOGIN', 'REGISTER'].includes(currentView)) {
                setCurrentView('LANDING');
            }
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
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
