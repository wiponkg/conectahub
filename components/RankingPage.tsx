
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Crown, TrendingUp, Loader2, User as UserIcon, Filter, MapPin, Briefcase, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  jobTitle?: string;
  department?: string;
  points: number;
  pos: number;
}

export const RankingPage: React.FC = () => {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    // Busca os top 100 usuários para ter uma boa amostragem para filtros
    // Nota: Em uma aplicação real com milhares de usuários, a filtragem idealmente seria feita no backend (Firestore queries compostas)
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: RankingUser[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Usuário Sem Nome',
          avatar: data.avatar || '',
          role: data.role || 'Colaborador', // Permissão do sistema
          jobTitle: data.jobTitle || '', // Cargo profissional (ex: Dev)
          department: data.department || '', // Departamento (ex: TI)
          points: data.points || 0,
          pos: index + 1 // Posição original global
        };
      });
      setUsers(fetchedUsers);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar ranking:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Extract Unique Departments and Roles for Filter Dropdowns
  const departments = useMemo(() => {
    const depts = users.map(u => u.department).filter(d => d && d.trim() !== '');
    return Array.from(new Set(depts)).sort();
  }, [users]);

  const roles = useMemo(() => {
    const jobs = users.map(u => u.jobTitle).filter(j => j && j.trim() !== '');
    return Array.from(new Set(jobs)).sort();
  }, [users]);

  // Apply Filters and Recalculate Positions
  const filteredUsers = useMemo(() => {
    let result = users;

    if (selectedDept) {
      result = result.filter(u => u.department === selectedDept);
    }
    
    if (selectedRole) {
      result = result.filter(u => u.jobTitle === selectedRole);
    }

    // Re-assign positions based on filtered list (1st, 2nd, 3rd relative to filter)
    return result.map((user, index) => ({
      ...user,
      pos: index + 1
    }));
  }, [users, selectedDept, selectedRole]);

  // Limit visual output to Top 10
  const displayedUsers = filteredUsers.slice(0, 10);
  const topThree = displayedUsers.slice(0, 3);
  const restOfList = displayedUsers.slice(3);

  // Helper para renderizar avatar ou iniciais
  const renderAvatar = (avatarUrl: string | undefined, name: string) => {
    if (avatarUrl && avatarUrl.trim() !== "" && !avatarUrl.includes("ui-avatars.com")) {
      return <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />;
    }
    // Fallback: Iniciais
    const initials = name
      ? name.split(' ').map((n, i, a) => (i === 0 || i === a.length - 1 ? n[0] : '')).join('').toUpperCase().substring(0, 2)
      : 'U';
      
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg md:text-2xl">
        {initials}
      </div>
    );
  };

  if (isLoading) {
      return (
          <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0e0e52] to-slate-900 flex items-center justify-center text-white">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                  <p className="animate-pulse">Calculando pontuações...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0e0e52] to-slate-900 text-white font-sans overflow-hidden flex flex-col items-center animate-fade-in pb-20 md:pb-4">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px]"></div>
        </div>

        {/* Header */}
        <div className="z-10 pt-8 pb-4 text-center space-y-1 px-4 w-full max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8 animate-bounce" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Ranking Geral</h1>
            </div>
            <p className="text-blue-200 text-xs md:text-sm font-medium mb-6">Reconhecendo os talentos que mais engajam</p>
            
            {/* Filter Bar */}
            <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center justify-center animate-slide-up">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-300 uppercase tracking-wider md:mr-2">
                    <Filter size={16} /> Filtros:
                </div>
                
                <div className="flex w-full md:w-auto gap-3 flex-col md:flex-row">
                    {/* Department Filter */}
                    <div className="relative group min-w-[200px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 group-hover:text-white transition-colors">
                            <MapPin size={16} />
                        </div>
                        <select 
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full bg-black/20 hover:bg-black/40 text-white pl-10 pr-8 py-2.5 rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all text-sm font-medium"
                        >
                            <option value="" className="bg-slate-800 text-gray-400">Todos os Departamentos</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept} className="bg-slate-800 text-white">{dept}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/10 pl-2">
                             <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-white opacity-50"></div>
                        </div>
                    </div>

                    {/* Job Title Filter */}
                    <div className="relative group min-w-[200px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 group-hover:text-white transition-colors">
                            <Briefcase size={16} />
                        </div>
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-black/20 hover:bg-black/40 text-white pl-10 pr-8 py-2.5 rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-all text-sm font-medium"
                        >
                            <option value="" className="bg-slate-800 text-gray-400">Todos os Cargos</option>
                            {roles.map(role => (
                                <option key={role} value={role} className="bg-slate-800 text-white">{role}</option>
                            ))}
                        </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/10 pl-2">
                             <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-white opacity-50"></div>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(selectedDept || selectedRole) && (
                        <button 
                            onClick={() => { setSelectedDept(''); setSelectedRole(''); }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl border border-red-500/20 transition-all text-sm font-medium"
                        >
                            <X size={16} /> Limpar
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Podium Section (Top 3) - Responsive */}
        <div className="z-10 flex items-end justify-center gap-2 md:gap-6 mb-6 mt-4 md:mt-8 px-2 w-full max-w-4xl h-auto min-h-[220px] md:min-h-[260px]">
            
            {/* 2nd Place */}
            <div className="flex flex-col items-center animate-slide-up w-1/3 max-w-[120px] md:max-w-none transition-all duration-500" style={{ animationDelay: '200ms' }}>
                {topThree[1] ? (
                    <>
                        <div className="relative mb-2">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-slate-300 shadow-lg overflow-hidden relative z-10 bg-slate-800">
                                {renderAvatar(topThree[1].avatar, topThree[1].name)}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-bold text-[8px] md:text-[10px] px-2 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                                2º
                            </div>
                        </div>
                        <div className="text-center mb-1 w-full overflow-hidden px-1">
                            <h3 className="font-bold text-[10px] md:text-sm text-white drop-shadow-md truncate">{topThree[1].name}</h3>
                            <span className="text-[9px] md:text-xs text-blue-200 font-mono font-bold">{topThree[1].points} pts</span>
                            <div className="hidden md:block text-[9px] text-gray-400 truncate max-w-[100px] mx-auto">{topThree[1].department || ''}</div>
                        </div>
                    </>
                ) : (
                    <div className="h-20 md:h-32"></div> /* Spacer if no user */
                )}
                <div className="w-full md:w-24 h-16 md:h-28 bg-gradient-to-t from-slate-400/30 to-slate-300/10 rounded-t-lg backdrop-blur-sm border-t border-x border-white/20 flex items-end justify-center pb-2">
                     <span className="text-xl md:text-3xl font-bold text-slate-200 opacity-40">2</span>
                </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center animate-slide-up relative -top-3 md:-top-4 w-1/3 max-w-[140px] md:max-w-none transition-all duration-500" style={{ animationDelay: '0ms' }}>
                {topThree[0] ? (
                    <>
                        <div className="relative mb-3 md:mb-4">
                            <Crown className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-yellow-400 w-5 h-5 md:w-6 md:h-6 animate-pulse" fill="currentColor" />
                            <div className="w-14 h-14 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] overflow-hidden relative z-10 bg-slate-800">
                                {renderAvatar(topThree[0].avatar, topThree[0].name)}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold text-[8px] md:text-[10px] px-2 md:px-3 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                                1º
                            </div>
                        </div>
                        <div className="text-center mb-1 w-full overflow-hidden px-1">
                            <h3 className="font-bold text-xs md:text-base text-white drop-shadow-md truncate">{topThree[0].name}</h3>
                            <span className="text-[10px] md:text-xs text-yellow-300 font-bold font-mono">{topThree[0].points} pts</span>
                            <div className="hidden md:block text-[9px] text-gray-400 truncate max-w-[100px] mx-auto">{topThree[0].department || ''}</div>
                        </div>
                    </>
                ) : (
                    <div className="h-24 md:h-40 flex items-center justify-center text-xs text-white/50 text-center px-2">
                         {filteredUsers.length === 0 ? "Nenhum resultado" : "Sem dados"}
                    </div>
                )}
                <div className="w-full md:w-28 h-24 md:h-36 bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 rounded-t-lg backdrop-blur-sm border-t border-x border-yellow-400/40 flex items-end justify-center pb-2 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                    <span className="text-2xl md:text-4xl font-bold text-yellow-200 opacity-40">1</span>
                </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center animate-slide-up w-1/3 max-w-[120px] md:max-w-none transition-all duration-500" style={{ animationDelay: '400ms' }}>
                 {topThree[2] ? (
                    <>
                        <div className="relative mb-2">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-orange-400 shadow-lg overflow-hidden relative z-10 bg-slate-800">
                                {renderAvatar(topThree[2].avatar, topThree[2].name)}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-900 font-bold text-[8px] md:text-[10px] px-2 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                                3º
                            </div>
                        </div>
                        <div className="text-center mb-1 w-full overflow-hidden px-1">
                            <h3 className="font-bold text-[10px] md:text-sm text-white drop-shadow-md truncate">{topThree[2].name}</h3>
                            <span className="text-[9px] md:text-xs text-blue-200 font-mono font-bold">{topThree[2].points} pts</span>
                            <div className="hidden md:block text-[9px] text-gray-400 truncate max-w-[100px] mx-auto">{topThree[2].department || ''}</div>
                        </div>
                    </>
                 ) : (
                    <div className="h-20 md:h-32"></div>
                 )}
                <div className="w-full md:w-24 h-12 md:h-20 bg-gradient-to-t from-orange-500/30 to-orange-400/10 rounded-t-lg backdrop-blur-sm border-t border-x border-white/20 flex items-end justify-center pb-2">
                    <span className="text-xl md:text-3xl font-bold text-orange-200 opacity-40">3</span>
                </div>
            </div>

        </div>

        {/* List Section (Ranks 4-10) */}
        <div className="w-full max-w-3xl px-4 md:px-0 z-10 flex-1 overflow-y-auto custom-scrollbar pb-4 min-h-0">
            {restOfList.length > 0 ? (
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    
                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-2 md:gap-4 p-3 border-b border-white/10 text-xs font-bold text-blue-200 uppercase tracking-wider bg-black/40">
                        <div className="col-span-2 text-center">Pos</div>
                        <div className="col-span-7 md:col-span-8 pl-2 md:pl-4">Colaborador</div>
                        <div className="col-span-3 md:col-span-2 text-center">Pts</div>
                    </div>

                    {/* List Items */}
                    <div className="divide-y divide-white/10">
                        {restOfList.map((user, index) => (
                            <div 
                                key={user.id} 
                                className="grid grid-cols-12 gap-2 md:gap-4 p-3 items-center hover:bg-white/10 transition-colors group cursor-default animate-fade-in"
                                style={{ animationDelay: `${100 + (index * 50)}ms` }}
                            >
                                <div className="col-span-2 flex justify-center">
                                    <span className="font-bold text-gray-300 group-hover:text-white transition-colors text-xs md:text-sm">{user.pos}º</span>
                                </div>
                                
                                <div className="col-span-7 md:col-span-8 flex items-center gap-2 md:gap-3 pl-2">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-blue-400 transition-colors shrink-0 bg-slate-800">
                                        {/* Simplified render for list items */}
                                        {user.avatar && user.avatar !== "" ? (
                                             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-xs md:text-sm text-gray-100 group-hover:text-white truncate">{user.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 group-hover:text-blue-300">
                                            <span className="truncate max-w-[80px] md:max-w-none">{user.jobTitle || user.role}</span>
                                            {user.department && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                                    <span className="truncate max-w-[60px] md:max-w-none">{user.department}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-3 md:col-span-2 flex justify-center">
                                    <div className="flex items-center gap-1 bg-blue-900/50 px-2 py-1 rounded-full border border-blue-500/30 group-hover:border-blue-400/60 transition-colors shadow-sm">
                                        <TrendingUp size={10} className="text-green-400 md:w-3 md:h-3" />
                                        <span className="font-mono font-bold text-xs md:text-sm text-white">{user.points}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-blue-200/50 italic text-sm">
                   {filteredUsers.length === 0 && (selectedDept || selectedRole)
                     ? "Nenhum colaborador encontrado com estes filtros."
                     : users.length <= 3 && users.length > 0 
                        ? "Convide mais colegas para competir!" 
                        : "Nenhum ranking disponível."
                   }
                </div>
            )}
        </div>

    </div>
  );
};
