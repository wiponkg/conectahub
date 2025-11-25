
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { useTheme } from '../App';
import { Camera, Save, User as UserIcon, Mail, Phone, Briefcase, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ProfilePageProps {
  user: User;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const { isDarkMode } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form State
    // NOTA: Mapeamos "Cargo" para 'jobTitle' para não sobrescrever a permissão 'role' do sistema.
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

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Avatar Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setImageLoadError(false); // Reseta erro ao carregar nova imagem
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Save Form
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');

        try {
            if (auth.currentUser) {
                // Usamos a coleção 'users' para manter consistência com o Login e App.tsx
                const userRef = doc(db, 'users', auth.currentUser.uid);
                
                // setDoc com merge: true cria o documento se não existir, ou atualiza se existir.
                await setDoc(userRef, {
                    name: formData.name,
                    jobTitle: formData.jobTitle,
                    department: formData.department,
                    phone: formData.phone,
                    bio: formData.bio,
                    avatar: avatarPreview
                }, { merge: true });
                
                setSuccessMsg('Perfil atualizado com sucesso!');
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setSuccessMsg('Erro: Usuário não autenticado.');
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            // Mostra o erro real no console para facilitar debug
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
        <div className={`p-6 md:p-12 max-w-7xl mx-auto min-h-full font-sans animate-fade-in ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
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
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover" 
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

                        <div className="relative z-10 w-full">
                            <h2 className="text-2xl font-bold mb-1 truncate">{formData.name || 'Seu Nome'}</h2>
                            
                            {/* Mostra o Cargo Profissional (jobTitle) se existir, ou o Role do sistema se não */}
                            <p className={`text-sm mb-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formData.jobTitle || user.role || 'Colaborador'}
                            </p>
                            
                            <div className={`flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-full mb-2 ${isDarkMode ? 'bg-slate-900/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <Mail size={14} />
                                <span className="truncate max-w-[200px]">{user.email || 'email@exemplo.com'}</span>
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
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio / Sobre Você</label>
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
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargo</label>
                                <input 
                                    type="text" 
                                    name="jobTitle" 
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    placeholder="Ex: Desenvolvedor Senior"
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Departamento / Setor</label>
                                <div className="relative">
                                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <input 
                                        type="text" 
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="Ex: Tecnologia"
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                             {successMsg && (
                                <div className={`flex items-center gap-2 text-sm font-bold animate-pulse ${successMsg.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>
                                    {successMsg.includes('Erro') ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
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
