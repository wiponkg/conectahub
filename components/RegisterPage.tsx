
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../App';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onRegister?: (name: string) => void;
}

export const RegisterPage: React.FC<AuthProps> = ({ onNavigate, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSocialRegister = (provider: 'apple' | 'google') => {
    // Simulate social registration
    const dummyName = provider === 'apple' ? 'Apple User' : 'Google User';
    if (onRegister) {
      onRegister(dummyName);
    } else {
      onNavigate('DASHBOARD_HOME');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, cpf, password, confirmPassword } = formData;

    if (!name || !cpf || !password || !confirmPassword) {
        setError('Todos os campos são obrigatórios.');
        return;
    }

    if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    // Success simulation
    if (onRegister) {
        onRegister(name);
    } else {
        onNavigate('DASHBOARD_HOME');
    }
  };

  const inputClass = `w-full border bg-transparent rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 transition-colors ${isDarkMode ? 'border-slate-700 focus:ring-blue-900 text-white' : 'border-gray-300 focus:ring-blue-100'}`;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-gray-900'}`}>
      <header className={`flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto`}>
        <Logo onClick={() => onNavigate('LANDING')} isDark={isDarkMode} />
        <div className="flex items-center gap-6 text-sm font-medium">
          <button 
             onClick={toggleTheme}
             className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-gray-100'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`hover:text-blue-600 ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`} onClick={() => onNavigate('LOGIN')}>Entrar</button>
          <button 
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => onNavigate('REGISTER')}
          >
            Cadastre-se
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8 hidden">Cadastro</h2>

            {/* Social Login Section */}
            <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => handleSocialRegister('apple')}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="Apple" className={`w-5 h-5 ${isDarkMode ? 'invert' : ''}`} />
                    Entrar com a Apple
                </button>
                 <button 
                  type="button"
                  onClick={() => handleSocialRegister('google')}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                   {/* Simulating Google G Logo */}
                   <span className="font-bold text-lg text-blue-500">G</span>
                    Entrar com o Google
                </button>
            </div>

            <div className="relative flex items-center py-4">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-300'}`}></div>
                <span className={`flex-shrink-0 mx-4 text-lg ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>Ou</span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-300'}`}></div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Nome</label>
                    <input 
                        name="name" 
                        type="text" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>CPF</label>
                    <input 
                        name="cpf" 
                        type="text" 
                        value={formData.cpf} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="000.000.000-00"
                    />
                </div>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Senha</label>
                    <input 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Confirmar senha</label>
                    <input 
                        name="confirmPassword" 
                        type="password" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}

                <div className="flex justify-center pt-6">
                    <button type="submit" className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-colors shadow-lg active:scale-95 transform">
                        Cadastrar
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};
