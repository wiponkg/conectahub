
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string) => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setEmailError('');

    if (!email) {
      setEmailError('O campo de email é obrigatório.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um email válido.');
      return;
    }

    // Proceed with Login
    if (onLogin) {
        onLogin(email);
    } else {
        onNavigate('DASHBOARD_HOME');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
        <Logo onClick={() => onNavigate('LANDING')} />
        <div className="space-x-4 text-sm font-medium">
          <button className="text-gray-900" onClick={() => onNavigate('LOGIN')}>Entrar</button>
          <button 
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => onNavigate('REGISTER')}
          >
            Cadastre-se
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl text-gray-700 font-medium transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="Apple" className="w-5 h-5" />
                    Entrar com a apple
                </button>
                 <button className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl text-gray-700 font-medium transition-colors">
                   {/* Simulating Google G Logo */}
                   <span className="font-bold text-lg text-blue-500">G</span>
                    Entrar com o google
                </button>
            </div>

            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-600 text-lg">Ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 transition-colors bg-transparent ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Senha</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 bg-transparent rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" 
                    />
                </div>

                <div className="flex justify-center pt-4">
                    <button type="submit" className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-colors shadow-lg active:scale-95 transform">
                        Entrar
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};
