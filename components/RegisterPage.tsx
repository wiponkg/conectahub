
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
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

  const inputClass = "w-full border border-gray-300 bg-transparent rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors";

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
        <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 hidden">Cadastro</h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Nome</label>
                    <input 
                        name="name" 
                        type="text" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">CPF</label>
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
                    <label className="block text-base font-medium text-gray-700 mb-1">Senha</label>
                    <input 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Confirmar senha</label>
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
                        Entrar
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};
