
import React, { useState } from 'react';
import { User as UserIcon, AlertTriangle, PartyPopper, Send, X } from 'lucide-react';
import { User } from '../types';

interface Post {
  id: number;
  author: string;
  initial: string;
  time: string;
  content: string;
  color: string;
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: 'Paulo',
    initial: 'P',
    time: 'Há 2 horas',
    content: 'Estamos felizes em anunciar que atingimos nossa meta do trimestre!',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    author: 'Bianca',
    initial: 'B',
    time: 'Ontem',
    content: 'Bem- vindo nossos novos colaboradores!',
    color: 'bg-indigo-500'
  }
];

interface DashboardHomeProps {
    user: User;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePostSubmit = () => {
    if (!newPostText.trim()) return;
    setShowConfirm(true);
  };

  const confirmPost = () => {
    const newPost: Post = {
        id: Date.now(),
        author: user.name,
        initial: user.name.charAt(0),
        time: 'Agora mesmo',
        content: newPostText,
        color: 'bg-blue-600'
    };

    // Add new post to the top of the list
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowConfirm(false);
  };

  return (
    <div className="p-12 text-white max-w-7xl mx-auto animate-fade-in relative">
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
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-gray-800 shadow-2xl animate-pop-in">
                <h3 className="text-xl font-bold mb-4">Confirmar postagem?</h3>
                <p className="text-gray-600 mb-8">Sua mensagem será visível para todos os colaboradores.</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setShowConfirm(false)}
                        className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmPost}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                        Publicar
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Bem-vinda, {user.name}!</h1>
        <p className="text-blue-200 text-lg">Vamos nos manter conectados e informados</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Feed Section - Left Column */}
        <div className="flex-1 space-y-6">
            {/* Input Card */}
            <div className="bg-[#F3F4F6] rounded-2xl p-6 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <UserIcon size={24} />
                </div>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Compartilhe alguma novidade..." 
                        className="w-full bg-white rounded-full py-3 px-6 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                        onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                    />
                    <button 
                        onClick={handlePostSubmit}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div 
                        key={post.id} 
                        className="bg-[#F3F4F6] rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.01] duration-300 animate-slide-up"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className={`w-12 h-12 ${post.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                                <span className="font-bold text-lg">{post.initial}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{post.author}</h3>
                                <p className="text-gray-500 text-sm">{post.time}</p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Widgets - Right Column */}
        <div className="w-full lg:w-96 space-y-6">
            {/* Avisos */}
            <div className="bg-[#EAEBED] rounded-2xl p-6 shadow-lg h-auto min-h-[240px] flex flex-col">
                <h3 className="text-2xl font-medium mb-6 text-center text-gray-800">Avisos</h3>
                <div className="bg-gray-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                     <div className="p-2 bg-white rounded-lg">
                        <AlertTriangle className="text-gray-400 fill-gray-400" size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900 leading-tight mb-1">Comunicação urgente</h4>
                        <p className="text-sm text-gray-600 leading-tight">Nova politica de home office</p>
                     </div>
                </div>
            </div>

            {/* Reconhecimento */}
             <div className="bg-[#EAEBED] rounded-2xl p-6 shadow-lg h-auto min-h-[200px] flex flex-col">
                <h3 className="text-2xl font-medium mb-6 text-center text-gray-800">Reconhecimento</h3>
                 <div className="bg-gray-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                     <div className="p-2 bg-white rounded-lg">
                         <PartyPopper className="text-gray-500" size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900 leading-tight">Parabéns pela conquista!</h4>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
