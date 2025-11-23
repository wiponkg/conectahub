
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { RankingPage } from './components/RankingPage';
import { CalendarPage } from './components/CalendarPage';
import { QuizPage } from './components/QuizPage';
import { ViewState, User, DEFAULT_USER } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);

  const navigateTo = (view: ViewState) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  const handleLogin = (email: string) => {
    // Mock login logic
    // If it's the demo user, keep 'Ana', otherwise use the email name part or a generic one
    const name = email.split('@')[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    
    // For demonstration, if they use a specific email, we could mock it, 
    // but let's just stick to the requested "Functional" flow.
    // We'll default to "Ana" if it looks like the demo flow, or the parsed name.
    if (email.includes('ana')) {
        setCurrentUser(DEFAULT_USER);
    } else {
        setCurrentUser({
            name: capitalized,
            avatar: `https://ui-avatars.com/api/?name=${capitalized}&background=random`,
            role: 'Colaborador'
        });
    }
    navigateTo('DASHBOARD_HOME');
  };

  const handleRegister = (name: string) => {
    setCurrentUser({
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        role: 'Colaborador'
    });
    navigateTo('DASHBOARD_HOME');
  };

  const renderView = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage onNavigate={navigateTo} />;
      case 'LOGIN':
        return <LoginPage onNavigate={navigateTo} onLogin={handleLogin} />;
      case 'REGISTER':
        return <RegisterPage onNavigate={navigateTo} onRegister={handleRegister} />;
      case 'DASHBOARD_HOME':
        return (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <DashboardHome user={currentUser} />
          </DashboardLayout>
        );
      case 'DASHBOARD_RANKING':
        return (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <RankingPage />
          </DashboardLayout>
        );
      case 'DASHBOARD_CALENDAR':
        return (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <CalendarPage />
          </DashboardLayout>
        );
      case 'DASHBOARD_POINTS':
        return (
          <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
            <QuizPage />
          </DashboardLayout>
        );
      case 'DASHBOARD_CHAT':
         return (
            <DashboardLayout currentView={currentView} onNavigate={navigateTo} user={currentUser}>
                <div className="flex items-center justify-center h-full text-gray-500">Funcionalidade de Chat em desenvolvimento</div>
            </DashboardLayout>
         );
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {renderView()}
    </div>
  );
};

export default App;
