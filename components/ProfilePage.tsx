
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { useTheme } from '../App';
import { Camera, Save, User as UserIcon, Mail, Phone, Briefcase, MapPin, Loader2, CheckCircle, Trophy, ChevronDown, Sparkles, Building2, AlignLeft } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, collection, query, where, getDocs, writeBatch, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

interface ProfilePageProps {
  user: User;
}

// Opções padronizadas
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
    const [imageLoadError, setImageLoadError] = useState(false);

    // Sync state with props
    useEffect(() => {
        setFormData({
            name: user.name || '',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            phone: user.phone || '',
            bio: user.bio || ''
        });
        setAvatarPreview(user.avatar);
        setImageLoadError(false);
    }, [user]);

    // Timer effects
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (showCelebration) {
            const timer = setTimeout(() => setShowCelebration(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showCelebration]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                setSuccessMsg('Erro: A imagem deve ter no máximo 2MB.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setImageLoadError(false);
                setSuccessMsg('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');
        setShowCelebration(false);

        try {
            if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                const userRef = doc(db, 'users', uid);

                // 1. Update Profile
                await setDoc(userRef, {
                    name: formData.name,
                    jobTitle: formData.jobTitle,
                    department: formData.department,
                    phone: formData.phone,
                    bio: formData.bio,
                    avatar: avatarPreview
                }, { merge: true });

                // Gamification Logic
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                const currentCompletedMissions = userData?.completedMissions || [];
                const missionId = 'profile';
                const alreadyCompleted = currentCompletedMissions.includes(missionId);

                const hasAvatar = avatarPreview && avatarPreview.trim().length > 0;
                const hasBio = formData.bio && formData.bio.trim().length >= 5; 

                let pointsAwarded = false;
                let feedbackMsg = 'Perfil atualizado com sucesso!';

                if (!alreadyCompleted) {
                    if (hasAvatar && hasBio) {
                        await updateDoc(userRef, {
                            points: increment(100), 
                            completedMissions: arrayUnion(missionId)
                        });
                        pointsAwarded = true;
                    } else {
                        const missing = [];
                        if (!hasAvatar) missing.push("uma foto de perfil");
                        if (!hasBio) missing.push("uma bio (min. 5 letras)");
                        if (missing.length > 0) {
                            feedbackMsg = `Salvo! Adicione ${missing.join(' e ')} para ganhar 100 pontos.`;
                        }
                    }
                }

                // 2. Batched Update for Posts
                try {
                    const postsRef = collection(db, "posts");
                    const q = query(postsRef, where("authorId", "==", uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const batches = [];
                        let batch = writeBatch(db);
                        let operationCounter = 0;

                        querySnapshot.forEach((docSnap) => {
                            batch.update(docSnap.ref, {
                                authorName: formData.name,
                                authorAvatar: avatarPreview
                            });
                            operationCounter++;

                            if (operationCounter === 500) {
                                batches.push(batch.commit());
                                batch = writeBatch(db);
                                operationCounter = 0;
                            }
                        });

                        if (operationCounter > 0) {
                            batches.push(batch.commit());
                        }

                        await Promise.all(batches);
                    }
                } catch (batchError) {
                    console.error("Error updating past posts:", batchError);
                }
                
                if (pointsAwarded) {
                    setShowCelebration(true);
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
                setSuccessMsg('Erro de permissão.');
            } else {
                setSuccessMsg('Erro ao salvar. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const isValidAvatar = avatarPreview && 
                          avatarPreview.trim() !== "" && 
                          avatarPreview !== "undefined" && 
                          !avatarPreview.includes("ui-avatars.com") && 
                          !imageLoadError;

    return (
        <div className={`w-full min-h-full font-sans animate-fade-in pb-12 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            
            {/* --- CELEBRATION OVERLAY --- */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCelebration(false)}></div>
                    <div className="relative z-10 animate-pop-in">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-1 rounded-[2rem] shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                            <div className={`bg-white dark:bg-slate-900 rounded-[1.8rem] p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent animate-pulse"></div>
                                <div className="relative mb-6">
                                    <Sparkles className="absolute -top-4 -right-8 text-yellow-400 w-8 h-8 animate-spin-slow" />
                                    <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 mx-auto ring-4 ring-yellow-400 ring-opacity-50">
                                        <Trophy size={48} className="text-yellow-500 animate-bounce" fill="currentColor" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-2 uppercase tracking-tight">Missão Completa!</h2>
                                <p className={`text-lg font-medium mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Seu perfil agora está completo.</p>
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-black text-xl shadow-lg transform scale-110 mb-2">+100 PONTOS</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PROFILE COVER --- */}
            <div className={`h-48 md:h-64 w-full relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative -mt-20">
                <form onSubmit={handleSave}>
                    
                    {/* --- IDENTITY HEADER --- */}
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-10">
                        {/* Avatar Wrapper */}
                        <div className="relative group">
                            <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] shadow-2xl overflow-hidden relative z-10 ${isDarkMode ? 'border-slate-950 bg-slate-900' : 'border-white bg-white'}`}>
                                {isValidAvatar ? (
                                    <img 
                                        key={avatarPreview}
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover" 
                                        onError={() => setImageLoadError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold tracking-wider">
                                        {getInitials(formData.name)}
                                    </div>
                                )}
                                {/* Overlay Upload */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer z-20"
                                >
                                    <Camera className="text-white w-10 h-10" />
                                </div>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`absolute bottom-2 right-2 z-30 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 border-4 ${isDarkMode ? 'bg-blue-600 text-white border-slate-950' : 'bg-blue-600 text-white border-white'}`}
                            >
                                <Camera size={18} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>

                        {/* Name & Quick Info */}
                        <div className="flex-1 pb-4 md:pb-0 pt-2 md:pt-20">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <div className="space-y-1">
                                    <label className={`block text-xs font-bold uppercase tracking-wider opacity-70 ${isDarkMode ? 'text-blue-300' : 'text-blue-100'}`}>Nome de Exibição</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`text-3xl md:text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-white/30 focus:border-blue-400 focus:outline-none transition-colors w-full md:w-auto ${isDarkMode ? 'text-white' : 'text-gray-900 md:text-white'}`}
                                        placeholder="Seu Nome"
                                    />
                                </div>
                                
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm ml-0 md:ml-auto self-start ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50' : 'bg-yellow-400 text-yellow-900 border border-yellow-300'}`}>
                                    <Trophy size={16} fill="currentColor" />
                                    <span>{user.points || 0} pts</span>
                                </div>
                            </div>
                            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600 md:text-blue-100'}`}>
                                {formData.jobTitle || user.role || 'Colaborador'} 
                                {formData.department && <span className="opacity-70"> • {formData.department}</span>}
                            </p>
                        </div>
                    </div>

                    {/* --- CONTENT GRID --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT: Personal/Bio */}
                        <div className={`lg:col-span-2 rounded-3xl p-8 shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                    <AlignLeft size={24} />
                                </div>
                                <h3 className="text-xl font-bold">Minha História</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bio / Sobre mim</label>
                                    <textarea 
                                        name="bio"
                                        rows={5}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Compartilhe um pouco sobre sua trajetória, hobbies e o que você faz na empresa..."
                                        className={`w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none leading-relaxed ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white text-gray-700'}`}
                                    ></textarea>
                                    <p className="text-xs text-right mt-2 opacity-60">Mínimo de 5 caracteres para completar a missão.</p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Telefone / WhatsApp</label>
                                    <div className="relative">
                                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="(00) 00000-0000"
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Professional Data */}
                        <div className={`rounded-3xl p-8 shadow-sm border h-fit transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <Building2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold">Carreira</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departamento</label>
                                    <div className="relative">
                                        <select 
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d} className={isDarkMode ? 'bg-slate-900' : ''}>{d}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargo</label>
                                    <div className="relative">
                                        <select 
                                            name="jobTitle" 
                                            value={formData.jobTitle}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {JOB_TITLES.map(t => <option key={t} value={t} className={isDarkMode ? 'bg-slate-900' : ''}>{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className={`text-xs font-bold uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>E-mail Corporativo</label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border opacity-70 cursor-not-allowed ${isDarkMode ? 'bg-slate-800 border-slate-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                        <Mail size={16} />
                                        <span className="truncate text-sm">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- ACTION BAR --- */}
                    <div className={`sticky bottom-6 mt-8 p-4 rounded-2xl border shadow-2xl flex items-center justify-between transition-all transform animate-slide-up z-40 ${isDarkMode ? 'bg-slate-800/90 backdrop-blur-md border-slate-700' : 'bg-white/90 backdrop-blur-md border-gray-100'}`}>
                        <div className="pl-2">
                            {successMsg && (
                                <span className={`text-sm font-bold flex items-center gap-2 ${successMsg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>
                                    {successMsg.includes('Erro') ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    {successMsg}
                                </span>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
