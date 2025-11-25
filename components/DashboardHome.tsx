
import React, { useState, useEffect } from 'react';
import { AlertTriangle, PartyPopper, Send, AlertCircle, RefreshCw, Bell, Star, Trash2 } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../App';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorId?: string; // Added to link post to user
  content: string;
  createdAt: Timestamp | null;
}

interface DashboardHomeProps {
    user: User;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDarkMode } = useTheme();

  // Função para formatar o tempo relativo (ex: "Há 2 horas")
  const formatTimeAgo = (timestamp: Timestamp | null) => {
      if (!timestamp) return 'Enviando...';
      
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Agora mesmo';
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Ontem';
      if (diffInDays < 7) return `Há ${diffInDays} dias`;

      return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Cria a query para buscar posts ordenados por data (mais recente primeiro)
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    // Listener em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPosts: Post[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Post));
        
        setPosts(fetchedPosts);
        setIsLoading(false);
        setError(null);
    }, (err) => {
        console.error("Erro ao buscar posts:", err);
        setError("Não foi possível carregar o feed. Verifique sua conexão.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePostSubmit = () => {
    if (!newPostText.trim()) return;
    setShowConfirm(true);
  };

  const confirmPost = async () => {
    if (!newPostText.trim()) return;
    
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "posts"), {
            content: newPostText,
            authorName: user.name,
            authorAvatar: user.avatar || "",
            authorId: user.uid, // Important: Link post to user ID for future updates
            createdAt: serverTimestamp()
        });

        setNewPostText('');
        setShowConfirm(false);
    } catch (err) {
        console.error("Erro ao publicar:", err);
        alert("Erro ao publicar mensagem. Tente novamente.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const getGreeting = (fullName: string) => {
    if (!fullName) return 'Bem-vindo(a)';
    const firstName = fullName.split(' ')[0].toLowerCase();
    const isFemale = firstName.endsWith('a');
    return isFemale ? 'Bem-vinda' : 'Bem-vindo';
  };

  const getInitials = (name: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderAvatar = (avatarUrl: string, name: string) => {
      if (avatarUrl && avatarUrl.trim() !== "") {
          return <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />;
      }
      return (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold">
              {getInitials(name)}
          </div>
      );
  };

  const greeting = getGreeting(user.name);
  const isPostButtonDisabled = isLoading || !newPostText.trim();

  return (
    <div className={`p-8 md:p-12 max-w-7xl mx-auto animate-fade-in relative transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-pop-in ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                <h3 className="text-xl font-bold mb-4">Confirmar postagem?</h3>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sua mensagem será visível para todos os colaboradores.</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setShowConfirm(false)}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmPost}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, {user.name}!</h1>
        <p className={`text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>Vamos nos manter conectados e informados</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Feed Section - Left Column */}
        <div id="main-feed" className="flex-1 w-full space-y-6">
            {/* Input Card */}
            <div className={`rounded-2xl p-6 flex items-center gap-4 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'} ${isLoading ? 'opacity-75 pointer-events-none' : ''}`}>
                <div className="w-12 h-12 rounded-full flex-shrink-0 shadow-md overflow-hidden relative border-2 border-transparent">
                    {renderAvatar(user.avatar, user.name)}
                </div>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Compartilhe alguma novidade..." 
                        className={`w-full rounded-full py-3 px-6 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition-all focus:shadow-md ${isDarkMode ? 'bg-slate-900 text-white border border-slate-700' : 'bg-gray-50 text-gray-700 border border-transparent'}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSubmitting && newPostText.trim()) {
                                confirmPost();
                            }
                        }}
                        disabled={isLoading || isSubmitting}
                    />
                    <button 
                        onClick={handlePostSubmit}
                        disabled={isPostButtonDisabled}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                            isPostButtonDisabled 
                                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95'
                        }`}
                        title={!newPostText.trim() ? "Escreva algo para publicar" : "Publicar"}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Posts List or Error State */}
            <div className="space-y-6">
                {error ? (
                  /* Error State UI */
                  <div className={`border rounded-2xl p-8 flex flex-col items-center text-center animate-pop-in ${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'}`}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'}`}>
                        <AlertCircle className="text-red-500 w-8 h-8" />
                     </div>
                     <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>Ops! Algo deu errado.</h3>
                     <p className={`mb-6 max-w-md ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
                     <button 
                        onClick={() => window.location.reload()} 
                        className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                     >
                       <RefreshCw size={20} /> Recarregar
                     </button>
                  </div>
                ) : isLoading ? (
                  /* Skeleton Loaders for Posts */
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`rounded-2xl p-6 shadow-sm animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className="flex gap-4 mb-4">
                           <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                           <div className="flex-1 space-y-2 py-2">
                             <div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                             <div className={`h-3 rounded w-1/6 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                           </div>
                        </div>
                        <div className="space-y-3">
                          <div className={`h-4 rounded w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                          <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : posts.length === 0 ? (
                    <div className={`text-center py-10 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhuma postagem ainda. Seja o primeiro!</p>
                    </div>
                ) : (
                  posts.map((post) => (
                      <div 
                          key={post.id} 
                          className={`rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-slide-up ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}
                      >
                          <div className="flex gap-4 mb-4">
                              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-md overflow-hidden`}>
                                  {renderAvatar(post.authorAvatar, post.authorName)}
                              </div>
                              <div>
                                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{post.authorName}</h3>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {formatTimeAgo(post.createdAt)}
                                  </p>
                              </div>
                          </div>
                          <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.content}</p>
                      </div>
                  ))
                )}
            </div>
        </div>

        {/* Widgets - Right Column */}
        <div id="dashboard-widgets" className="w-full lg:w-96 space-y-6 sticky top-8 h-fit">
            {/* Avisos */}
            <div className={`rounded-2xl p-6 shadow-lg flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-orange-50 text-orange-500'}`}>
                         <Bell size={20} />
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Avisos</h3>
                </div>
                
                {isLoading ? (
                    <div className={`animate-pulse rounded-xl p-4 flex gap-4 items-start ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                         <div className={`w-10 h-10 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                         <div className="flex-1 space-y-2 py-1">
                             <div className={`h-4 rounded w-full ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                             <div className={`h-3 rounded w-2/3 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                         </div>
                    </div>
                ) : (
                   <div className={`group rounded-xl p-4 flex gap-4 items-start transition-all duration-300 cursor-pointer hover:bg-opacity-80 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-blue-50/50'}`}>
                        <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-800 text-yellow-500' : 'bg-white text-orange-500 shadow-sm'}`}>
                           <AlertTriangle size={20} />
                        </div>
                        <div>
                           <h4 className={`font-bold leading-tight mb-1 group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Comunicação urgente</h4>
                           <p className={`text-sm leading-tight mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nova politica de home office</p>
                        </div>
                   </div>
                )}
            </div>

            {/* Reconhecimento */}
             <div className={`rounded-2xl p-6 shadow-lg flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                         <Star size={20} />
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Reconhecimento</h3>
                </div>

                 {isLoading ? (
                    <div className={`animate-pulse rounded-xl p-4 flex gap-4 items-start ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                         <div className={`w-10 h-10 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                         <div className="flex-1 py-2">
                             <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                         </div>
                    </div>
                 ) : (
                     <div className={`group rounded-xl p-4 flex gap-4 items-start transition-all duration-300 cursor-pointer hover:bg-opacity-80 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-blue-50/50'}`}>
                         <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-slate-800 text-purple-400' : 'bg-white text-purple-500 shadow-sm'}`}>
                             <PartyPopper size={20} />
                         </div>
                         <div>
                            <h4 className={`font-bold leading-tight group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Parabéns pela conquista!</h4>
                            <p className={`text-sm leading-tight mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Você bateu a meta de vendas.</p>
                         </div>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};
