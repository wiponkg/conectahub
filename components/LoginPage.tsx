import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon, Loader2, Eye, EyeOff, MailWarning, Send, Copy, Clock, CheckCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { useTheme } from '../App';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string) => void;
}

type LoginViewState = 'LOGIN' | 'FORGOT_PASSWORD';

export const LoginPage: React.FC<AuthProps> = ({ onNavigate }) => {
  const [viewState, setViewState] = useState<LoginViewState>('LOGIN');
  
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

  // States for Password Reset logic
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState(''); // Separate email state for reset form

  const { isDarkMode, toggleTheme } = useTheme();

  // Initialize reset email with login email if available
  useEffect(() => {
    if (viewState === 'FORGOT_PASSWORD' && email) {
        setResetEmail(email);
    }
  }, [viewState, email]);

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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!resetEmail) {
          setError('Por favor, digite seu email.');
          return;
      }
      
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetEmail)) {
          setError('Email com formato inválido.');
          return;
      }

      setResetLoading(true);
      setError('');
      setResetSuccess(false);

      try {
          await sendPasswordResetEmail(auth, resetEmail);
          setResetSuccess(true);
      } catch (err: any) {
          console.error("Password reset error:", err);
          if (err.code === 'auth/user-not-found') {
              // Por segurança, às vezes é melhor não dizer que o email não existe, 
              // mas para UX interna vamos avisar
              setError('Não encontramos uma conta com este email.');
          } else if (err.code === 'auth/invalid-email') {
              setError('Email inválido.');
          } else {
              setError('Erro ao enviar email. Tente novamente mais tarde.');
          }
      } finally {
          setResetLoading(false);
      }
  };

  const handleResendVerification = async () => {
      if (resendCooldown > 0) return;

      setResendLoading(true);
      setError('');
      setResendSuccess('');

      try {
          let user = auth.currentUser;
          
          if (!user) {
              if (!email || !password) {
                  setError("Para reenviar, precisamos que tente logar novamente.");
                  setResendLoading(false);
                  return;
              }
              try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                user = cred.user;
              } catch (loginErr) {
                 setError("Erro ao autenticar para reenviar email.");
                 setResendLoading(false);
                 return;
              }
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

          await sendEmailVerification(user, actionCodeSettings);

          setResendSuccess("Email reenviado! Verifique Caixa de Entrada e SPAM.");
          setResendCooldown(60); 
          setShowResend(false);

      } catch (err: any) {
          console.error("Resend error:", err);
          setError("Erro ao reenviar. Tente novamente mais tarde.");
      } finally {
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

        await user.reload();

        if (!user.emailVerified) {
            // Customize error for verification needed
            setError('Email não verificado.'); 
            setShowResend(true);
            setIsLoading(false);
            return;
        }

        // If verified, App.tsx will redirect automatically
    } catch (err: any) {
        console.error(err);
        
        // --- INTELLIGENT ERROR HANDLING FOR GOOGLE ACCOUNTS ---
        // Se a senha estiver errada ou credencial inválida, verificamos se o email existe como conta Google
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
            try {
                // Tenta descobrir como esse email está cadastrado
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods && methods.includes('google.com')) {
                    setError('Esta conta foi criada com o Google. Por favor, clique no botão "Entrar com o Google" acima.');
                    setIsLoading(false);
                    return;
                }
            } catch (fetchErr) {
                // Se o Firebase bloquear a enumeração de emails (comum em produção), ignoramos esse check silenciosamente
                console.log("Enumeration protection enabled or error checking methods", fetchErr);
            }
        }
        // ------------------------------------------------------

        if (err.code === 'auth/invalid-credential') {
            setError('Email ou senha incorretos.');
        } else if (err.code === 'auth/user-not-found') {
            setError('Email não cadastrado.');
        } else if (err.code === 'auth/too-many-requests') {
            setError('Muitas tentativas. Aguarde alguns instantes.');
        } else {
            setError('Erro ao fazer login. Tente novamente.');
        }
        setIsLoading(false);
    }
  };

  const copyDomainToClipboard = () => {
      const domain = window.location.hostname;
      navigator.clipboard.writeText(domain);
      alert(`Domínio copiado: ${domain}`);
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

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md relative perspective-1000">
            
            {/* View State: LOGIN */}
            {viewState === 'LOGIN' && (
                <div className={`w-full space-y-8 animate-fade-in`}>
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
                              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors bg-transparent ${error ? 'border-red-500 focus:ring-red-200' : (isDarkMode ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-900 text-white' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100')}`}
                              placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Senha</label>
                            <div className="relative">
                                <input 
                                  type={showPassword ? "text" : "password"}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className={`w-full border bg-transparent rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 transition-colors ${isDarkMode ? 'border-slate-700 focus:ring-blue-900 text-white' : 'border-gray-300 focus:ring-blue-100'}`} 
                                  placeholder="Sua senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setViewState('FORGOT_PASSWORD');
                                        setError('');
                                    }}
                                    className={`text-sm font-medium hover:underline flex items-center gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                >
                                    Esqueceu sua senha?
                                </button>
                            </div>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <div className={`p-4 rounded-xl border animate-pop-in ${isDarkMode ? 'bg-red-900/10 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex items-center gap-3 text-sm font-medium justify-center text-center">
                                    <MailWarning size={18} className={`shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                                    <span className={isDarkMode ? 'text-red-300' : 'text-red-700'}>{error}</span>
                                </div>
                                
                                {error.includes("Domínio não autorizado") && (
                                    <button
                                        type="button"
                                        onClick={copyDomainToClipboard}
                                        className="mt-3 w-full flex items-center justify-center gap-1 text-xs bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 px-2 py-2 rounded hover:bg-red-200 transition-colors"
                                    >
                                        <Copy size={12} /> Copiar Domínio para Firebase
                                    </button>
                                )}
                                
                                {(showResend || error === "Email não verificado.") && (
                                     <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/50 w-full">
                                        <p className={`text-xs text-center mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Precisamos confirmar que você é real.
                                        </p>
                                        {resendCooldown > 0 ? (
                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium bg-white/50 dark:bg-black/20 p-2 rounded">
                                                <Clock size={12} />
                                                Reenviar em {resendCooldown}s
                                            </div>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={handleResendVerification}
                                                disabled={resendLoading}
                                                className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-bold transition-colors ${isDarkMode ? 'bg-red-800/40 hover:bg-red-800/60 text-red-200' : 'bg-white border border-red-200 hover:bg-red-50 text-red-700'}`}
                                            >
                                                {resendLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                                {resendLoading ? 'Enviando...' : 'Reenviar e-mail de verificação'}
                                            </button>
                                        )}
                                     </div>
                                )}
                            </div>
                        )}
                        
                        {/* Success Message for Resend */}
                        {resendSuccess && (
                            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-xl border border-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 animate-pop-in">
                                <p className="font-bold mb-1 flex items-center justify-center gap-2"><CheckCircle size={16}/> {resendSuccess}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isLoading || resendLoading}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20 active:scale-95 transform flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na Plataforma'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View State: FORGOT PASSWORD */}
            {viewState === 'FORGOT_PASSWORD' && (
                <div className={`w-full animate-pop-in ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'} p-1 rounded-3xl`}>
                    <div className={`relative p-8 rounded-3xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                        
                        {/* Header Decoration */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500`}></div>

                        <button 
                            onClick={() => {
                                setViewState('LOGIN');
                                setError('');
                                setResetSuccess(false);
                            }}
                            className={`absolute top-6 left-6 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-6 mb-8">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <KeyRound size={32} />
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recuperar Senha</h2>
                            <p className={`text-sm max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Digite o email associado à sua conta e enviaremos um link de redefinição.
                            </p>
                        </div>

                        {!resetSuccess ? (
                            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Seu Email</label>
                                    <div className="relative">
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                        <input 
                                            type="email" 
                                            value={resetEmail}
                                            onChange={(e) => {
                                                setResetEmail(e.target.value);
                                                if (error) setError('');
                                            }}
                                            placeholder="exemplo@empresa.com"
                                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900' : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 text-center font-medium animate-pulse">{error}</p>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={resetLoading}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 ${resetLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {resetLoading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Link de Recuperação'}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className={`w-full p-4 rounded-xl mb-6 text-center ${isDarkMode ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                    <p className="font-bold text-lg mb-1">E-mail Enviado!</p>
                                    <p className="text-sm opacity-90">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
                                </div>
                                <button 
                                    onClick={() => setViewState('LOGIN')}
                                    className={`w-full py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                                >
                                    Voltar para Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
        </div>
      </main>
    </div>
  );
};