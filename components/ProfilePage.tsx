
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { useTheme } from '../App';
import { Camera, Save, User as UserIcon, Mail, Phone, Briefcase, MapPin, Loader2, CheckCircle, Trophy, ChevronDown, Sparkles } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, collection, query, where, getDocs, writeBatch, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

interface ProfilePageProps {
  user: User;
}

// Opções padronizadas para garantir consistência no Ranking
const DEPARTMENTS = [
  "Administrativo",
  "Comercial / Vendas",
  "Diretoria",
  "Engenharia",
  "Financeiro",
  "Jurídico",
  "Logística",
  "Marketing",
  "Operações",
  "Produto",
  "Recursos Humanos (RH)",
  "Sucesso do Cliente (CS)",
  "Tecnologia (TI)"
];

const JOB_TITLES = [
  "CEO / Presidente",
  "VP / Diretor",
  "Gerente",
  "Coordenador / Líder",
  "Product Manager",
  "Product Owner",
  "Tech Lead",
  "Desenvolvedor Sênior",
  "Desenvolvedor Pleno",
  "Desenvolvedor Júnior",
  "Designer / UX/UI",
  "Analista Sênior",
  "Analista Pleno",
  "Analista Júnior",
  "Assistente",
  "Estagiário",
  "Trainee"
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const { isDarkMode } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: user.name || '',
        jobTitle: user.jobTitle || '', 
        department: user.department || '',
        phone: user.phone || '',
        bio: user.bio || ''
    });

    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    
    // Estado para controlar se a imagem falhou ao carregar (link quebrado)
    const [imageLoadError, setImageLoadError] = useState(false);

    // Sync state with props (Sync real-time com Firestore via App.tsx)
    useEffect(() => {
        setFormData({
            name: user.name || '',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            phone: user.phone || '',
            bio: user.bio || ''
        });
        setAvatarPreview(user.avatar);
        setImageLoadError(false); // Reseta o erro ao trocar de usuário
    }, [user]);

    // Effect to handle success message timer
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => {
                setSuccessMsg('');
            }, 6000); // Increased time for longer messages
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Effect to handle celebration timer
    useEffect(() => {
        if (showCelebration) {
            const timer = setTimeout(() => {
                setShowCelebration(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showCelebration]);

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Avatar Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation: Max 2MB
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > maxSize) {
                setSuccessMsg('Erro: A imagem deve ter no máximo 2MB.');
                // Reset input to allow retrying
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setImageLoadError(false); // Reseta erro ao carregar nova imagem
                setSuccessMsg(''); // Clear previous errors
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Save Form
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');
        setShowCelebration(false);

        try {
            if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                const userRef = doc(db, 'users', uid);

                // 1. Update User Profile in 'users' collection
                await setDoc(userRef, {
                    name: formData.name,
                    jobTitle: formData.jobTitle,
                    department: formData.department,
                    phone: formData.phone,
                    bio: formData.bio,
                    avatar: avatarPreview
                }, { merge: true });

                // GAMIFICATION CHECK: Completar Perfil
                // Fetch fresh data to ensure we are checking the latest state of 'completedMissions'
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                const currentCompletedMissions = userData?.completedMissions || [];
                const missionId = 'profile';
                const alreadyCompleted = currentCompletedMissions.includes(missionId);

                // Critérios: Ter Avatar E Bio preenchida (min 5 chars)
                const hasAvatar = avatarPreview && avatarPreview.trim().length > 0;
                const hasBio = formData.bio && formData.bio.trim().length >= 5; 

                let pointsAwarded = false;
                let feedbackMsg = 'Perfil atualizado com sucesso!';

                if (!alreadyCompleted) {
                    if (hasAvatar && hasBio) {
                        // Adiciona pontos e marca missão como completa
                        await updateDoc(userRef, {
                            points: increment(100), 
                            completedMissions: arrayUnion(missionId)
                        });
                        pointsAwarded = true;
                    } else {
                         // Determine what is missing for feedback
                        const missing = [];
                        if (!hasAvatar) missing.push("uma foto de perfil");
                        if (!hasBio) missing.push("uma bio (min. 5 letras)");
                        
                        if (missing.length > 0) {
                            feedbackMsg = `Salvo! Adicione ${missing.join(' e ')} para ganhar 100 pontos.`;
                        }
                    }
                }

                // 2. Cascade Update: Find all posts by this user and update avatar/name
                // This ensures the feed reflects the new profile picture immediately.
                try {
                    const postsRef = collection(db, "posts");
                    const q = query(postsRef, where("authorId", "==", uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const batch = writeBatch(db);
                        
                        querySnapshot.forEach((docSnap) => {
                            batch.update(docSnap.ref, {
                                authorName: formData.name,
                                authorAvatar: avatarPreview
                            });
                        });

                        await batch.commit();
                        console.log(`Updated ${querySnapshot.size} posts with new profile info.`);
                    }
                } catch (batchError) {
                    console.error("Error updating past posts:", batchError);
                }
                
                if (pointsAwarded) {
                    setShowCelebration(true); // Ativa o Overlay
                    setSuccessMsg('Missão Completa! +100 Pontos'); 
                } else {
                    setSuccessMsg(feedbackMsg);
                }
            } else {
                setSuccessMsg('Erro: Usuário não autenticado.');
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            if (error.code === 'permission-denied') {
                setSuccessMsg('Erro de permissão. Verifique as Regras do Firestore.');
            } else {
                setSuccessMsg('Erro ao salvar. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for initials
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Check valid avatar specifically for this component
    const isValidAvatar = avatarPreview && 
                          avatarPreview.trim() !== "" && 
                          avatarPreview !== "undefined" && 
                          !avatarPreview.includes("ui-avatars.com") && 
                          !imageLoadError;

    return (
        <div className={`p-6 md:p-12 max-w-7xl mx-auto min-h-full font-sans animate-fade-in relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            
            {/* --- CELEBRATION OVERLAY --- */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCelebration(false)}></div>
                    <div className="relative z-10 animate-pop-in">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-1 rounded-[2rem] shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                            <div className={`bg-white dark:bg-slate-900 rounded-[1.8rem] p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden`}>
                                {/* Background Rays */}
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent animate-pulse"></div>
                                
                                <div className="relative mb-6">
                                    <Sparkles className="absolute -top-4 -right-8 text-yellow-400 w-8 h-8 animate-spin-slow" />
                                    <Sparkles className="absolute bottom-0 -left-8 text-yellow-400 w-6 h-6 animate-pulse" />
                                    <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 mx-auto ring-4 ring-yellow-400 ring-opacity-50">
                                        <Trophy size={48} className="text-yellow-500 animate-bounce" fill="currentColor" />
                                    </div>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-2 uppercase tracking-tight">
                                    Missão Completa!
                                </h2>
                                <p className={`text-lg md:text-xl font-medium mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Seu perfil agora está completo.
                                </p>

                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-black text-xl md:text-2xl shadow-lg transform scale-110 mb-2">
                                    +100 PONTOS
                                </div>
                                <p className="text-xs text-gray-400 mt-4 uppercase tracking-wider font-bold">Ranking Atualizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-8">Editar Perfil</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Identity Card */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className={`rounded-3xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-visible transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                        {/* Background Decoration */}
                        <div className={`absolute top-0 left-0 w-full h-32 rounded-t-3xl ${isDarkMode ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}></div>

                        <div className="relative mb-6 mt-4">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden bg-white relative z-10 group">
                                {isValidAvatar ? (
                                    <img 
                                        key={avatarPreview} // Forces re-mount to trigger animation on change
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover animate-pop-in" 
                                        onError={() => setImageLoadError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold tracking-wider">
                                        {getInitials(formData.name)}
                                    </div>
                                )}
                                
                                {/* Hover Overlay for Photo Change */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                >
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </div>
                            
                            {/* Camera Button - Adjusted position to be fully visible */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`absolute -bottom-1 -right-1 z-20 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 ${isDarkMode ? 'bg-blue-600 text-white border-slate-800' : 'bg-blue-600 text-white border-white'}`}
                                aria-label="Alterar foto"
                                type="button"
                            >
                                <Camera size={18} />
                            </button>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-1 truncate max-w-full">{formData.name || 'Seu Nome'}</h2>
                            
                            {/* Mostra o Cargo Profissional (jobTitle) se existir, ou o Role do sistema se não */}
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formData.jobTitle || user.role || 'Colaborador'}
                            </p>

                            {/* Points Display */}
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-default ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-yellow-400' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                <Trophy size={16} fill="currentColor" className="text-yellow-500" />
                                <span>{user.points || 0} pts</span>
                            </div>
                            
                            <div className={`flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-full w-full ${isDarkMode ? 'bg-slate-900/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <Mail size={14} className="shrink-0" />
                                <span className="truncate">{user.email || 'email@exemplo.com'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="flex-1">
                    <form onSubmit={handleSave} className={`rounded-3xl p-8 shadow-xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <UserIcon size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Informações Pessoais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome Completo</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Telefone / WhatsApp</label>
                                <div className="relative">
                                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio / Sobre Você (Mín. 5 caracteres)</label>
                            <textarea 
                                name="bio"
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Conte um pouco sobre você..."
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                <Briefcase size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Informações Profissionais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            
                            {/* Dropdown de Cargo */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargo</label>
                                <div className="relative">
                                    <select 
                                        name="jobTitle" 
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                    >
                                        <option value="" disabled>Selecione seu cargo</option>
                                        {JOB_TITLES.map((title) => (
                                            <option key={title} value={title} className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
                                                {title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                </div>
                            </div>

                            {/* Dropdown de Departamento */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Departamento / Setor</label>
                                <div className="relative">
                                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <select 
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className={`w-full pl-11 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                    >
                                        <option value="" disabled>Selecione seu departamento</option>
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept} className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                             {successMsg && (
                                <div className={`flex items-center gap-2 text-sm font-bold animate-pulse ${successMsg.includes('Salvo!') ? 'text-yellow-600 dark:text-yellow-400' : (successMsg.includes('Erro') ? 'text-red-500' : 'text-green-500')}`}>
                                    {successMsg.includes('Erro') ? <Loader2 className="animate-spin" size={18} /> : (successMsg.includes('Salvo!') ? <CheckCircle size={18} /> : <CheckCircle size={18} />)}
                                    {successMsg}
                                </div>
                             )}
                             <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                             >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                             </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
