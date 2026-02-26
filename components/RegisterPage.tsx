
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Sun, Moon, Loader2, CheckCircle, Mail, ArrowRight, AlertTriangle, Inbox } from 'lucide-react';
import { useTheme } from '../App';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification, signOut } from 'firebase/auth';

interface AuthProps {
  onNavigate: (view: ViewState) => void;
  onRegister?: (name: string) => void;
}

export const RegisterPage: React.FC<AuthProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSentStatus, setEmailSentStatus] = useState<'sent' | 'failed' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const validateField = (name: string, value: string, allData: typeof formData) => {
      let errorMsg = '';
      switch (name) {
          case 'name':
              if (!value.trim()) errorMsg = 'O nome é obrigatório.';
              else if (value.trim().length < 3) errorMsg = 'O nome deve ter pelo menos 3 caracteres.';
              break;
          case 'email':
              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              if (!value.trim()) errorMsg = 'O email é obrigatório.';
              else if (!emailRegex.test(value)) errorMsg = 'Formato inválido. Use: nome@exemplo.com';
              break;
          case 'password':
              if (!value) errorMsg = 'A senha é obrigatória.';
              else if (value.length < 6) errorMsg = 'Mínimo de 6 caracteres.';
              break;
          case 'confirmPassword':
              if (!value) errorMsg = 'A confirmação é obrigatória.';
              else if (value !== allData.password) errorMsg = 'As senhas não conferem.';
              break;
      }
      return errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);
    
    if (error) setError(''); 

    const errorMsg = validateField(name, value, nextFormData);

    setFieldErrors(prev => {
        const newErrors = { ...prev, [name]: errorMsg };
        if (name === 'password' && nextFormData.confirmPassword) {
            newErrors.confirmPassword = nextFormData.confirmPassword !== value ? 'As senhas não conferem.' : '';
        }
        return newErrors;
    });
  };

  const handleSocialRegister = async (providerName: 'apple' | 'google') => {
    if (providerName === 'apple') {
        setError("Login com Apple requer configuração adicional de certificado.");
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                 await setDoc(userDocRef, {
                    name: user.displayName || 'Usuário Google',
                    email: user.email,
                    role: 'Colaborador',
                    avatar: user.photoURL || "", 
                    points: 0,
                    completedMissions: [],
                    createdAt: new Date().toISOString()
                });
            }
        }
    } catch (err: any) {
        console.error("Google Register Error:", err);
        if (err.code === 'auth/popup-closed-by-user') {
            setError('O cadastro foi cancelado.');
        } else if (err.code === 'auth/unauthorized-domain') {
            setError('Domínio não autorizado. Adicione este domínio no Firebase Console.');
        } else {
            setError('Erro ao conectar com Google. Tente novamente.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = {
        name: validateField('name', formData.name, formData),
        email: validateField('email', formData.email, formData),
        password: validateField('password', formData.password, formData),
        confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData),
    };

    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some(msg => msg !== '');
    if (hasErrors) {
        setError('Por favor, corrija os erros nos campos destacados.');
        return;
    }

    if (!formData.name || !formData.email || !formData.password) {
        setError('Preencha todos os campos obrigatórios.');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setEmailSentStatus(null);

    try {
        if (!auth) throw new Error("Firebase não configurado.");

        // 1. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        if (user) {
            // 2. Save User Profile in Firestore
            const saveProfilePromise = async () => {
                 await setDoc(doc(db, "users", user.uid), {
                    name: formData.name, 
                    email: formData.email,
                    role: 'Colaborador',
                    avatar: "", 
                    points: 0, 
                    completedMissions: [], 
                    createdAt: new Date().toISOString()
                });
            };

            try {
                await Promise.race([
                    saveProfilePromise(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
                ]);
            } catch (profileErr) {
                console.warn("Profile save warning (proceeding anyway):", profileErr);
            }

            // 3. Send Email Verification
            try {
                auth.languageCode = 'pt';
                const actionCodeSettings = {
                    url: window.location.origin, 
                    handleCodeInApp: true,
                };

                await sendEmailVerification(user, actionCodeSettings);
                setEmailSentStatus('sent');

            } catch (emailErr: any) {
                 if (emailErr.code === 'auth/unauthorized-continue-uri') {
                     console.warn("Domínio não autorizado. Enviando email sem link de retorno.");
                     try {
                         await sendEmailVerification(user);
                         setEmailSentStatus('sent');
                     } catch (retryErr) {
                         console.error("Retry failed:", retryErr);
                         setEmailSentStatus('failed');
                     }
                 } else {
                     console.warn("Erro ao enviar email de verificação:", emailErr);
                     setEmailSentStatus('failed');
                 }
            }

            // 4. Sign out immediately
            await signOut(auth);
        }

        if (emailSentStatus === 'failed') {
             setSuccess('Cadastro realizado! (Não foi possível enviar o email de verificação agora, tente mais tarde).');
        } else {
             setSuccess('Verifique seu e-mail');
        }
        
        setIsLoading(false);
        // Removed auto-redirect to allow user to read the message

    } catch (err: any) {
        console.error("Registration error:", err);
        
        if (auth.currentUser) {
            try { await signOut(auth); } catch(e) {}
        }
        
        if (err.code === 'auth/email-already-in-use') {
            setError('Este email já está em uso.');
        } else if (err.code === 'auth/invalid-email') {
            setError('Email inválido.');
        } else if (err.code === 'auth/weak-password') {
             setError('A senha é muito fraca.');
        } else if (err.message?.includes("Firebase não configurado")) {
            setError("Erro de configuração: Verifique suas chaves do Firebase.");
        } else {
            setError('Ocorreu um erro ao criar a conta. Tente novamente.');
        }
        setIsLoading(false);
    }
  };

  const getInputClass = (fieldName: keyof typeof fieldErrors) => `
    w-full border bg-transparent rounded px-4 py-3 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
    ${fieldErrors[fieldName] 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
        : (isDarkMode ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-900 text-white' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100')
    }
  `;

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

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
            
            {success ? (
                // --- SUCCESS STATE UI ---
                <div className={`w-full p-8 rounded-3xl shadow-2xl animate-pop-in text-center ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center relative">
                        <Mail className="w-12 h-12 text-green-600 dark:text-green-400" />
                        <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1.5 border-4 border-white dark:border-slate-900">
                             <CheckCircle size={16} strokeWidth={3} />
                        </div>
                    </div>
                    
                    <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Confirme seu cadastro!
                    </h2>
                    
                    <div className={`p-4 rounded-xl mb-6 text-left text-sm space-y-3 ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-blue-50 text-gray-700'}`}>
                        <p className="flex items-start gap-2">
                            <span className="font-bold bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                            <span>Enviamos um e-mail para:</span>
                        </p>
                        <p className={`font-bold text-center py-2 rounded border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-blue-100 text-blue-800'}`}>
                            {formData.email}
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="font-bold bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                            <span>Clique no link da mensagem para ativar sua conta.</span>
                        </p>
                    </div>

                    <div className={`text-left p-4 rounded-xl mb-8 flex gap-3 ${isDarkMode ? 'bg-yellow-900/20 text-yellow-200 border border-yellow-900/50' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
                        <AlertTriangle className="shrink-0" size={20} />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Não encontrou o e-mail?</p>
                            <p className="opacity-90">Verifique sua caixa de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => onNavigate('LOGIN')}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
                    >
                        Voltar para Login 
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            ) : (
                // --- REGISTRATION FORM UI ---
                <div className="space-y-6">
                    <div className="space-y-4">
                        <button 
                        type="button"
                        onClick={() => handleSocialRegister('apple')}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="Apple" className={`w-5 h-5 ${isDarkMode ? 'invert' : ''}`} />
                            Entrar com a Apple
                        </button>
                        <button 
                        type="button"
                        onClick={() => handleSocialRegister('google')}
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

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Nome</label>
                            <input 
                                name="name" 
                                type="text" 
                                value={formData.name} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                className={getInputClass('name')} 
                                placeholder="Seu nome completo"
                            />
                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-up">{fieldErrors.name}</p>}
                        </div>
                        <div>
                            <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                className={getInputClass('email')} 
                                placeholder="seu@email.com"
                            />
                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-up">{fieldErrors.email}</p>}
                        </div>
                        <div>
                            <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Senha</label>
                            <input 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                className={getInputClass('password')} 
                                placeholder="Mínimo 6 caracteres"
                            />
                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-up">{fieldErrors.password}</p>}
                        </div>
                        <div>
                            <label className={`block text-base font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Confirmar senha</label>
                            <input 
                                name="confirmPassword" 
                                type="password" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                className={getInputClass('confirmPassword')} 
                            />
                            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-up">{fieldErrors.confirmPassword}</p>}
                        </div>

                        {error && <p className="text-red-500 text-sm text-center animate-pulse bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/20 dark:border-red-800">{error}</p>}
                        
                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-all shadow-lg active:scale-95 transform flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Cadastrar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
