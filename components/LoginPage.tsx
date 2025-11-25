
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon, Loader2, Eye, EyeOff, MailWarning, Send, Copy, Clock } from 'lucide-react';
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
  const [resendCooldown, setResendCooldown] = useState(0);

  const { isDarkMode, toggleTheme } = useTheme();

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || 'Usuário Google',
                email: user.email,
                role: 'Colaborador',
                avatar: user.photoURL || "", 
                createdAt: new Date().toISOString()
            });
        }
    } catch (err: any) {
        console.error("Google Login Error:", err);
        if (err.code === 'auth/popup-closed-by-user') {
            setError('O login foi cancelado.');
        } else if (err.code === 'auth/unauthorized-domain') {
            const currentDomain = window.location.hostname;
            setError(`Domínio não autorizado: ${currentDomain}`);
        } else {
            setError('Erro ao conectar com Google. Tente novamente.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
      if (resendCooldown > 0) return;

      setResendLoading(true);
      setError('');
      setResendSuccess('');

      try {
          // 1. Try to use existing user session first
          let user = auth.currentUser;
          
          // 2. If no session, try to re-login with credentials from form
          if (!user) {
              if (!email || !password) {
                  setError("Digite email e senha novamente para reenviar.");
                  setResendLoading(false);
                  return;
              }
              const cred = await signInWithEmailAndPassword(auth, email, password);
              user = cred.user;
          }

          if (user.emailVerified) {
              setResendSuccess("Seu email já está verificado! Recarregando...");
              setTimeout(() => window.location.reload(), 1500);
              return;
          }

          const actionCodeSettings = {
              url: window.location.origin,
              handleCodeInApp: true,
          };

          try {
              await sendEmailVerification(user, actionCodeSettings);
          } catch (innerErr: any) {
              // Fallback for unauthorized domains
              if (innerErr.code === 'auth/unauthorized-continue-uri') {
                  console.warn("Domínio não autorizado. Enviando email sem link de retorno.");
                  await sendEmailVerification(user);
              } else {
                  throw innerErr;
              }
          }

          setResendSuccess("Email reenviado! Verifique Caixa de Entrada e SPAM.");
          setResendCooldown(60); // Start 60s cooldown
          setShowResend(false);

      } catch (err: any) {
          console.error("Resend error:", err);
          
          // GRACEFUL HANDLING OF TOO MANY REQUESTS
          if (err.code === 'auth/too-many-requests') {
              setResendSuccess("Email já enviado recentemente. Verifique seu SPAM.");
              setResendCooldown(60); // Assume success to prevent spamming
              setShowResend(false);
          } else if (err.code === 'auth/unauthorized-continue-uri') {
               // Should be caught above, but double safety
               setResendSuccess("Email enviado (modo compatibilidade). Verifique SPAM.");
               setResendCooldown(60);
          } else if (err.code === 'auth/invalid-credential') {
              setError("Sessão expirada. Digite a senha novamente.");
          } else {
              setError("Erro ao reenviar. Tente novamente em alguns minutos.");
          }
      } finally {
          setResendLoading(false);
          // Note: We do NOT signOut here intentionally to allow user to try again
          // if they failed, or to keep session ready for 'check verified' reload.
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

        // Force refresh to get latest status
        await user.reload();

        if (!user.emailVerified) {
            // IMPORTANT: Do NOT signOut(auth) here. 
            // Keeping the user "technically" logged in allows handleResendVerification 
            // to work without asking for password again, and avoids rate limit loops.
            // App.tsx handles blocking access to Dashboard.
            
            setError('Email não verificado. Verifique sua caixa de entrada e spam.');
            setShowResend(true);
            setIsLoading(false);
            return;
        }

        // If verified, App.tsx will redirect automatically
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/invalid-credential') {
            setError('Email ou senha incorretos.');
        } else if (err.code === 'auth/user-not-found') {
            setError('Email não cadastrado. Redirecionando para o cadastro...');
            setTimeout(() => {
                onNavigate('REGISTER');
            }, 1500);
            return;
        } else if (err.code === 'auth/too-many-requests') {
            setError('Muitas tentativas. Aguarde alguns instantes.');
        } else if (err.message === "Firebase não configurado.") {
             setError("Erro de configuração: Adicione suas chaves do Firebase em lib/firebase.ts");
        } else {
            setError('Erro ao fazer login. Tente novamente.');
        }
        setIsLoading(false);
    }
  };

  const copyDomainToClipboard = () => {
      const domain = window.location.hostname;
      navigator.clipboard.writeText(domain);
      alert(`Domínio copiado: ${domain}\nAdicione-o em Firebase Console > Auth > Settings > Authorized Domains`);
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

                {/* Error Box */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 animate-pulse flex flex-col items-center">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium justify-center text-center">
                            <MailWarning size={16} className="shrink-0" />
                            {error}
                        </div>
                        {error.includes("Domínio não autorizado") && (
                            <button
                                type="button"
                                onClick={copyDomainToClipboard}
                                className="mt-2 flex items-center gap-1 text-xs bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                                <Copy size={12} /> Copiar Domínio
                            </button>
                        )}
                        
                        {/* Resend Logic */}
                        {(showResend || error.includes("não verificado")) && (
                             <div className="mt-3 w-full">
                                {resendCooldown > 0 ? (
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium bg-white/50 dark:bg-black/20 p-2 rounded">
                                        <Clock size={12} />
                                        Aguarde {resendCooldown}s para reenviar
                                    </div>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className="w-full flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                    >
                                        {resendLoading ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                                        {resendLoading ? 'Enviando...' : 'Reenviar email de verificação'}
                                    </button>
                                )}
                             </div>
                        )}
                    </div>
                )}
                
                {/* Success Message for Resend */}
                {resendSuccess && (
                    <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded border border-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                        <p className="font-bold mb-1">{resendSuccess}</p>
                        {resendCooldown > 0 && (
                            <p className="text-xs opacity-75">Próximo envio em: {resendCooldown}s</p>
                        )}
                    </div>
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
