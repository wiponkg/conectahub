
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '../App';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string) => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSocialLogin = async (providerName: 'apple' | 'google') => {
    if (providerName === 'apple') {
        alert("Login com Apple requer configuração adicional de certificado.");
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Verificar se o usuário já tem perfil no Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Se for o primeiro acesso via Google, cria o perfil básico
            await setDoc(userDocRef, {
                name: user.displayName || 'Usuário Google',
                email: user.email,
                role: 'Colaborador',
                avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'G'}&background=random`,
                createdAt: new Date().toISOString()
            });
        }

        // O redirecionamento é tratado automaticamente pelo onAuthStateChanged no App.tsx
    } catch (err: any) {
        console.error("Google Login Error:", err);
        if (err.code === 'auth/popup-closed-by-user') {
            setError('O login foi cancelado.');
        } else {
            setError('Erro ao conectar com Google. Tente novamente.');
        }
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');

    if (!email) {
      setError('O campo de email é obrigatório.');
      return;
    }

    if (!password) {
        setError('O campo de senha é obrigatório.');
        return;
    }

    setIsLoading(true);

    try {
        if (!auth) throw new Error("Firebase não configurado.");
        await signInWithEmailAndPassword(auth, email, password);
        // Navigation is handled by App.tsx's onAuthStateChanged listener
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/invalid-credential') {
            setError('Email ou senha incorretos.');
        } else if (err.code === 'auth/user-not-found') {
            // Se o usuário não existe, redireciona para o cadastro
            setError('Email não cadastrado. Redirecionando para o cadastro...');
            setTimeout(() => {
                onNavigate('REGISTER');
            }, 1500);
            setIsLoading(false);
            return;
        } else if (err.code === 'auth/too-many-requests') {
            setError('Muitas tentativas. Tente novamente mais tarde.');
        } else if (err.message === "Firebase não configurado.") {
             setError("Erro de configuração: Adicione suas chaves do Firebase em lib/firebase.ts");
        } else {
            setError('Erro ao fazer login. Tente novamente.');
        }
        setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="Apple" className={`w-5 h-5 ${isDarkMode ? 'invert' : ''}`} />
                    Entrar com a Apple
                </button>
                 <button 
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                   <span className="font-bold text-lg text-blue-500">G</span>
                    Entrar com o Google
                </button>
            </div>

            <div className="relative flex items-center py-4">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-300'}`}></div>
                <span className={`flex-shrink-0 mx-4 text-lg ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>Ou</span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-300'}`}></div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 transition-colors bg-transparent ${error ? 'border-red-500 focus:ring-red-200' : (isDarkMode ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-900 text-white' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100')}`}
                    />
                </div>
                <div>
                    <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Senha</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border bg-transparent rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 transition-colors ${isDarkMode ? 'border-slate-700 focus:ring-blue-900 text-white' : 'border-gray-300 focus:ring-blue-100'}`} 
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center animate-pulse bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/20 dark:border-red-800">{error}</p>}

                <div className="flex justify-center pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-40 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-colors shadow-lg active:scale-95 transform flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};
