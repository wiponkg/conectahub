
import React from 'react';
import { Trophy, Crown, TrendingUp } from 'lucide-react';

export const RankingPage: React.FC = () => {
  // Enhanced mock data with points
  const users = [
    { id: 1, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', name: 'Roberto Almeida', role: 'Diretor Comercial', pos: 1, points: 2450 }, 
    { id: 2, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', name: 'Juliana Costa', role: 'Gerente de Projetos', pos: 2, points: 2100 },
    { id: 3, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', name: 'Marcos Silva', role: 'Tech Lead', pos: 3, points: 1950 },
    { id: 4, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', name: 'André Souza', role: 'Desenvolvedor Senior', pos: 4, points: 1800 },
    { id: 5, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', name: 'Ricardo Oliveira', role: 'Designer UX/UI', pos: 5, points: 1650 },
    { id: 6, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', name: 'Fernanda Lima', role: 'Analista de RH', pos: 6, points: 1540 },
    { id: 7, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', name: 'Carla Dias', role: 'CEO', pos: 7, points: 1420 },
    { id: 8, img: 'https://ui-avatars.com/api/?name=Pedro+S&background=random', name: 'Pedro Santos', role: 'Estagiário', pos: 8, points: 1200 },
    { id: 9, img: 'https://ui-avatars.com/api/?name=Lucas+M&background=random', name: 'Lucas Mendes', role: 'Marketing', pos: 9, points: 1100 },
  ];

  const topThree = users.slice(0, 3);
  const restOfList = users.slice(3);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0e0e52] to-slate-900 text-white font-sans overflow-hidden flex flex-col items-center animate-fade-in pb-4">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        {/* Header */}
        <div className="z-10 pt-8 pb-2 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8 animate-bounce" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Ranking Geral</h1>
            </div>
            <p className="text-blue-200 text-xs md:text-sm font-medium">Reconhecendo os talentos que mais engajam</p>
        </div>

        {/* Podium Section (Top 3) - Compact Version */}
        <div className="z-10 flex items-end justify-center gap-3 md:gap-6 mb-6 mt-12 px-4 w-full max-w-4xl h-auto md:min-h-[260px]">
            
            {/* 2nd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="relative mb-2">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-slate-300 shadow-lg overflow-hidden relative z-10">
                        <img src={topThree[1].img} alt={topThree[1].name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                        2º
                    </div>
                </div>
                <div className="text-center mb-1">
                    <h3 className="font-bold text-xs md:text-sm text-white drop-shadow-md">{topThree[1].name}</h3>
                    <span className="text-[10px] md:text-xs text-blue-200 font-mono font-bold">{topThree[1].points} pts</span>
                </div>
                <div className="w-16 md:w-24 h-20 md:h-28 bg-gradient-to-t from-slate-400/30 to-slate-300/10 rounded-t-lg backdrop-blur-sm border-t border-x border-white/20 flex items-end justify-center pb-2">
                     <span className="text-3xl font-bold text-slate-200 opacity-40">2</span>
                </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center animate-slide-up relative -top-4" style={{ animationDelay: '0ms' }}>
                <div className="relative mb-4">
                    <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 w-6 h-6 animate-pulse" fill="currentColor" />
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] overflow-hidden relative z-10">
                        <img src={topThree[0].img} alt={topThree[0].name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                        1º
                    </div>
                </div>
                <div className="text-center mb-1">
                    <h3 className="font-bold text-sm md:text-base text-white drop-shadow-md">{topThree[0].name}</h3>
                    <span className="text-xs text-yellow-300 font-bold font-mono">{topThree[0].points} pts</span>
                </div>
                <div className="w-20 md:w-28 h-28 md:h-36 bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 rounded-t-lg backdrop-blur-sm border-t border-x border-yellow-400/40 flex items-end justify-center pb-2 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                    <span className="text-4xl font-bold text-yellow-200 opacity-40">1</span>
                </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '400ms' }}>
                 <div className="relative mb-2">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-orange-400 shadow-lg overflow-hidden relative z-10">
                        <img src={topThree[2].img} alt={topThree[2].name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                        3º
                    </div>
                </div>
                <div className="text-center mb-1">
                    <h3 className="font-bold text-xs md:text-sm text-white drop-shadow-md">{topThree[2].name}</h3>
                    <span className="text-[10px] md:text-xs text-blue-200 font-mono font-bold">{topThree[2].points} pts</span>
                </div>
                <div className="w-16 md:w-24 h-16 md:h-20 bg-gradient-to-t from-orange-500/30 to-orange-400/10 rounded-t-lg backdrop-blur-sm border-t border-x border-white/20 flex items-end justify-center pb-2">
                    <span className="text-3xl font-bold text-orange-200 opacity-40">3</span>
                </div>
            </div>

        </div>

        {/* List Section */}
        <div className="w-full max-w-3xl px-4 md:px-0 z-10 flex-1 overflow-y-auto custom-scrollbar pb-4 min-h-0">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* List Header */}
                <div className="grid grid-cols-12 gap-4 p-3 border-b border-white/10 text-xs font-bold text-blue-200 uppercase tracking-wider bg-black/40">
                    <div className="col-span-2 text-center">Posição</div>
                    <div className="col-span-7 md:col-span-8 pl-4">Colaborador</div>
                    <div className="col-span-3 md:col-span-2 text-center">Pontos</div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-white/10">
                    {restOfList.map((user, index) => (
                        <div 
                            key={user.id} 
                            className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-white/10 transition-colors group cursor-default animate-fade-in"
                            style={{ animationDelay: `${500 + (index * 50)}ms` }}
                        >
                            <div className="col-span-2 flex justify-center">
                                <span className="font-bold text-gray-300 group-hover:text-white transition-colors text-sm">{user.pos}º</span>
                            </div>
                            
                            <div className="col-span-7 md:col-span-8 flex items-center gap-3 pl-2">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-blue-400 transition-colors shrink-0">
                                    <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-100 group-hover:text-white truncate">{user.name}</h4>
                                    <p className="text-xs text-gray-400 group-hover:text-blue-300 truncate">{user.role}</p>
                                </div>
                            </div>
                            
                            <div className="col-span-3 md:col-span-2 flex justify-center">
                                <div className="flex items-center gap-1 bg-blue-900/50 px-2 py-1 rounded-full border border-blue-500/30 group-hover:border-blue-400/60 transition-colors shadow-sm">
                                    <TrendingUp size={12} className="text-green-400" />
                                    <span className="font-mono font-bold text-xs md:text-sm text-white">{user.points}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    </div>
  );
};
