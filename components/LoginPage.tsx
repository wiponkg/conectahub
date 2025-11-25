
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon, Loader2, Eye, EyeOff, MailWarning, Send } from 'lucide-react';
import { useTheme } from '../App';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string) => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States for Email Verification logic
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

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
                // Se Google tiver foto, usa. Se não, string vazia para ativar iniciais.
                avatar: user.photoURL || "", 
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
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
      if (!email || !password) {
          setError("Digite seu email e senha para reenviar.");
          return;
      }
      
      setResendLoading(true);
      setError('');
      setResendSuccess('');

      try {
          // Precisamos fazer login temporariamente para ter permissão de enviar o email
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          if (user.emailVerified) {
              setResendSuccess("Seu email já está verificado! Tente entrar novamente.");
              setShowResend(false);
              await signOut(auth);
          } else {
              const actionCodeSettings = {
                  url: window.location.origin,
                  handleCodeInApp: true,
              };

              try {
                  await sendEmailVerification(user, actionCodeSettings);
              } catch (innerErr: any) {
                  // Fallback: Se o domínio não estiver na whitelist, tenta enviar sem a URL de redirecionamento
                  if (innerErr.code === 'auth/unauthorized-continue-uri') {
                      console.warn("Domínio não autorizado. Enviando email sem link de retorno.");
                      await sendEmailVerification(user);
                  } else {
                      throw innerErr;
                  }
              }

              await signOut(auth); // Desloga imediatamente
              setResendSuccess("Email reenviado! Verifique sua caixa de entrada e spam.");
              setShowResend(false);
          }
      } catch (err: any) {
          console.error("Resend error:", err);
          if (err.code === 'auth/unauthorized-continue-uri') {
              // Fallback para o erro específico na chamada principal (caso ocorra antes do inner try)
               try {
                  const user = auth.currentUser;
                  if (user) {
                      await sendEmailVerification(user);
                      await signOut(auth);
                      setResendSuccess("Email reenviado (modo compatibilidade)! Verifique spam.");
                      setShowResend(false);
                      return; 
                  }
               } catch (e) {}
          }

          if (err.code === 'auth/too-many-requests') {
              setError("Muitas tentativas. Aguarde um pouco.");
          } else if (err.code === 'auth/invalid-credential') {
              setError("Email ou senha incorretos.");
          } else {
              setError("Erro ao reenviar. Verifique seus dados.");
          }
      } finally {
          // Garante limpeza de sessão se algo falhar mas o login tiver ocorrido
          if (auth.currentUser) {
              try { await signOut(auth); } catch (e) {}
          }
          setResendLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setShowResend(false);
    setResendSuccess('');

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check Email Verification
        if (!user.emailVerified) {
            await signOut(auth); // Impede que o App.tsx redirecione para dashboard
            setError('Email não verificado. Verifique sua caixa de entrada e spam.');
            setShowResend(true);
            setIsLoading(false);
            return;
        }

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
                    <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full border bg-transparent rounded px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 transition-colors ${isDarkMode ? 'border-slate-700 focus:ring-blue-900 text-white' : 'border-gray-300 focus:ring-blue-100'}`} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 animate-pulse">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium justify-center">
                            <MailWarning size={16} />
                            {error}
                        </div>
                        {showResend && (
                             <button 
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendLoading}
                                className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                             >
                                 {resendLoading ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                                 {resendLoading ? 'Enviando...' : 'Reenviar email de verificação'}
                             </button>
                        )}
                    </div>
                )}
                
                {resendSuccess && (
                    <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded border border-green-100 dark:bg-green-900/20 dark:border-green-800">
                        {resendSuccess}
                    </p>
                )}

                <div className="flex justify-center pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading || resendLoading}
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
