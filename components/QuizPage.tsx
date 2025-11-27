
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, ArrowRight, CheckCircle, XCircle, BrainCircuit, Medal, ChevronRight, Loader2, User as UserIcon, RefreshCcw } from 'lucide-react';
import { useTheme } from '../App';
import { User, ViewState } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

// --- Types & Mock Data ---

type GameState = 'HUB' | 'PLAYING' | 'VICTORY';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index
  points: number;
}

const DAILY_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Qual é o pilar principal da nossa cultura de feedback?",
    options: ["Crítica anônima", "Comunicação Não-Violenta", "Apenas elogios", "Relatórios mensais"],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 2,
    text: "Onde você pode consultar o holerite mensal?",
    options: ["No e-mail pessoal", "No mural físico", "Na aba Calendário", "No Portal do Colaborador"],
    correctAnswer: 3,
    points: 10
  },
  {
    id: 3,
    text: "Qual a meta de satisfação do cliente para este trimestre?",
    options: ["NPS 50", "NPS 75", "NPS 90", "NPS 100"],
    correctAnswer: 2,
    points: 20
  }
];

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
  color: string;
}

const STATIC_MISSIONS: Mission[] = [
  {
    id: 'daily',
    title: 'Quiz Diário',
    description: 'Responda 3 perguntas sobre a cultura da empresa.',
    points: 50,
    icon: BrainCircuit,
    color: 'bg-blue-500',
  },
  {
    id: 'profile',
    title: 'Completar Perfil',
    description: 'Adicione uma foto e preencha sua bio.',
    points: 100,
    icon: Star,
    color: 'bg-yellow-500',
  },
  {
    id: 'feedback',
    title: 'Feedback 360',
    description: 'Envie um elogio para um colega de equipe.',
    points: 30,
    icon: Zap,
    color: 'bg-purple-500',
  }
];

interface QuizPageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ user, onNavigate }) => {
  const { isDarkMode } = useTheme();
  const [gameState, setGameState] = useState<GameState>('HUB');
  
  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // To trigger animations

  const currentQuestion = DAILY_QUESTIONS[currentQuestionIdx];

  // Reset state when entering HUB
  useEffect(() => {
    if (gameState === 'HUB') {
        setIsCorrect(null);
    }
  }, [gameState]);

  const handleStartQuiz = () => {
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setGameState('PLAYING');
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + currentQuestion.points);
    }
  };

  const handleNextQuestion = async () => {
    // Reset animation states
    setIsCorrect(null);
    
    if (currentQuestionIdx < DAILY_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Finish Quiz
      setIsLoading(true);
      try {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                points: increment(score),
                completedMissions: arrayUnion('daily_' + new Date().toISOString().split('T')[0]) // Simple daily tracking
            });
        }
      } catch (error) {
        console.error("Error updating score:", error);
      } finally {
        setIsLoading(false);
        setGameState('VICTORY');
      }
    }
  };

  const isMissionCompleted = (missionId: string) => {
      // Check if mission ID is in user's completed missions
      // For static demo purposes, checking if 'profile' is complete if name exists, etc.
      if (missionId === 'profile') return !!user.avatar && !!user.bio;
      return false; 
  };

  // Helper component for Confetti
  const ConfettiRain = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}%`,
                        backgroundColor: ['#FCD34D', '#F87171', '#60A5FA', '#34D399', '#A78BFA'][Math.floor(Math.random() * 5)],
                        width: `${Math.random() * 10 + 5}px`,
                        height: `${Math.random() * 10 + 5}px`,
                        animationDuration: `${Math.random() * 3 + 2}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
  };

  return (
    <div className={`min-h-full p-6 md:p-12 max-w-7xl mx-auto font-sans animate-fade-in relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        
        {/* CSS for Custom Quiz Animations */}
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-5px); }
                40%, 80% { transform: translateX(5px); }
            }
            .animate-shake {
                animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes successPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .animate-success-pop {
                animation: successPop 0.3s ease-out forwards;
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in-right {
                animation: slideInRight 0.4s ease-out forwards;
            }
            @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .animate-confetti {
                animation-name: confetti;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }
        `}</style>

        {/* Header - Hidden in Victory to reduce noise */}
        {gameState !== 'VICTORY' && (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Central de Conquistas
                    </h1>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete missões e suba no ranking!</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm ${isDarkMode ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-yellow-600 border border-gray-100'}`}>
                    <Medal size={20} />
                    <span>{user.points || 0} pts</span>
                </div>
            </div>
        )}

        {/* --- HUB VIEW --- */}
        {gameState === 'HUB' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Main Feature: Quiz */}
                <div className={`lg:col-span-2 rounded-3xl p-8 relative overflow-hidden shadow-xl transition-all hover:scale-[1.005] group cursor-pointer flex flex-col justify-between min-h-[300px] ${isDarkMode ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`} onClick={handleStartQuiz}>
                     <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
                     
                     <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-6 border border-white/20">
                            <BrainCircuit size={14} />
                            <span>DESTAQUE DO DIA</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Quiz da Cultura:<br/>Edição Semanal</h2>
                        <p className="text-blue-100 mb-8 max-w-lg text-base md:text-lg leading-relaxed">
                            Teste seus conhecimentos sobre os novos processos de RH e ganhe pontos extras para o ranking mensal.
                        </p>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                        <button className="bg-white text-blue-700 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-95 w-fit">
                            Começar Agora <ArrowRight size={18} />
                        </button>
                     </div>
                </div>

                {/* Missions List (Cards) */}
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg">Missões Disponíveis</h3>
                    </div>
                    
                    {STATIC_MISSIONS.map((mission) => {
                        const isCompleted = isMissionCompleted(mission.id);
                        return (
                            <div 
                                key={mission.id} 
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col gap-4 ${
                                    isCompleted 
                                        ? (isDarkMode ? 'bg-slate-800/50 border-green-900/50' : 'bg-green-50/50 border-green-100') 
                                        : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-gray-100 hover:border-blue-200')
                                }`}
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${mission.color} text-white shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                                        <mission.icon size={22} />
                                    </div>
                                    {isCompleted ? (
                                        <div className="flex items-center gap-1 text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                            <CheckCircle size={14} /> <span>Completa</span>
                                        </div>
                                    ) : (
                                        <div className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${isDarkMode ? 'bg-slate-700 text-yellow-400 border border-slate-600' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                            <Star size={12} fill="currentColor" />
                                            <span>+{mission.points}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div>
                                    <h4 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{mission.title}</h4>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{mission.description}</p>
                                </div>

                                {/* Card Footer / Action */}
                                <div className="mt-auto pt-2">
                                    <button 
                                        className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                            isCompleted 
                                            ? 'bg-transparent border border-green-200 text-green-600 cursor-default opacity-80' 
                                            : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-100 hover:border-blue-100')
                                        }`}
                                        disabled={isCompleted}
                                        onClick={() => {
                                            if (!isCompleted) {
                                                if (mission.id === 'profile') onNavigate('DASHBOARD_PROFILE');
                                                if (mission.id === 'daily') handleStartQuiz();
                                            }
                                        }}
                                    >
                                        {isCompleted ? 'Concluído' : 'Ver Detalhes'}
                                        {!isCompleted && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- PLAYING VIEW --- */}
        {gameState === 'PLAYING' && (
            <div className="max-w-3xl mx-auto mt-4 md:mt-8">
                {/* Progress Header */}
                <div className="mb-8 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                         <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            Questão {currentQuestionIdx + 1} / {DAILY_QUESTIONS.length}
                         </div>
                         <div className={`flex items-center gap-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                             <Zap size={18} fill="currentColor" />
                             <span className="font-bold">{score} pts</span>
                         </div>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out relative"
                            style={{ width: `${((currentQuestionIdx + 1) / DAILY_QUESTIONS.length) * 100}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Question Card - Key helps React create a new instance for animation */}
                <div key={currentQuestionIdx} className="animate-slide-in-right">
                    <div className={`p-8 md:p-10 rounded-[2rem] shadow-2xl mb-8 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                        {/* Decorative background element */}
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[4rem] ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-snug relative z-10">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-4 relative z-10">
                            {currentQuestion.options.map((option, idx) => {
                                // Determine styling based on state
                                const isSelected = selectedOption === idx;
                                const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                                
                                let containerClasses = isDarkMode 
                                    ? 'bg-slate-900 border-slate-700 hover:bg-slate-700/80' 
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100';
                                
                                let textClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
                                let icon = <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${isDarkMode ? 'border-slate-600 text-slate-500' : 'border-gray-300 text-gray-400'}`}>{String.fromCharCode(65 + idx)}</div>;

                                if (isAnswerChecked) {
                                    if (isCorrectAnswer) {
                                        containerClasses = 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)] ring-1 ring-green-500 animate-success-pop';
                                        textClass = 'text-green-600 dark:text-green-400 font-bold';
                                        icon = <CheckCircle className="text-green-500" size={24} fill={isDarkMode ? "rgba(34,197,94,0.2)" : "white"} />;
                                    } else if (isSelected && !isCorrectAnswer) {
                                        containerClasses = 'bg-red-500/10 border-red-500 ring-1 ring-red-500 animate-shake';
                                        textClass = 'text-red-600 dark:text-red-400 font-medium';
                                        icon = <XCircle className="text-red-500" size={24} fill={isDarkMode ? "rgba(239,68,68,0.2)" : "white"} />;
                                    } else {
                                        containerClasses += ' opacity-50 grayscale';
                                    }
                                } else if (isSelected) {
                                    containerClasses = `bg-blue-600 border-blue-600 shadow-lg scale-[1.02] transform`;
                                    textClass = 'text-white font-bold';
                                    icon = <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-bold shadow-sm">{String.fromCharCode(65 + idx)}</div>;
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={isAnswerChecked}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden ${containerClasses}`}
                                    >
                                        <div className="shrink-0 relative z-10">{icon}</div>
                                        <span className={`text-lg relative z-10 ${textClass}`}>{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-between items-center h-16">
                    <div className="text-sm font-medium italic opacity-60">
                         {isAnswerChecked 
                            ? (isCorrect ? "Mandou bem!" : "Não foi dessa vez...") 
                            : "Selecione uma opção"}
                    </div>

                    {!isAnswerChecked ? (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={selectedOption === null}
                            className={`px-8 py-3.5 rounded-full font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 ${selectedOption === null ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                        >
                            Confirmar Resposta
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3.5 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 hover:shadow-green-500/30 animate-success-pop"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (currentQuestionIdx < DAILY_QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado')}
                            {!isLoading && <ChevronRight size={20} />}
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* --- VICTORY VIEW --- */}
        {gameState === 'VICTORY' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
                {/* Background Effects */}
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                <ConfettiRain />

                <div className="relative z-10 flex flex-col items-center animate-pop-in max-w-lg w-full text-center">
                    
                    <div className="relative mb-8 group">
                         <div className="absolute inset-0 bg-yellow-400/30 blur-[40px] rounded-full animate-pulse group-hover:bg-yellow-400/50 transition-colors"></div>
                         <Trophy size={100} className="text-yellow-400 relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" />
                         <div className="absolute -top-4 -right-4 animate-bounce delay-700">
                             <Star className="text-yellow-300 fill-yellow-300 drop-shadow-lg" size={40} />
                         </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 tracking-tight">
                        Quiz Concluído!
                    </h2>
                    <p className={`text-lg md:text-xl mb-10 font-medium ${isDarkMode ? 'text-blue-200' : 'text-gray-600'}`}>
                        Você dominou o conhecimento de hoje.
                    </p>

                    <div className={`p-8 rounded-[2.5rem] w-full mb-10 text-center border shadow-2xl relative overflow-hidden group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity"></div>
                        
                        <span className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Pontuação Final</span>
                        <div className="flex items-center justify-center gap-1 mb-4">
                            <span className="text-7xl md:text-8xl font-black text-blue-600 tracking-tighter drop-shadow-sm">{score}</span>
                            <span className="text-2xl text-gray-400 font-bold self-end mb-4">/ {DAILY_QUESTIONS.reduce((acc, q) => acc + q.points, 0)}</span>
                        </div>
                        
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800/50">
                            <Medal size={16} />
                            <span>Ranking atualizado</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full px-4">
                        <button 
                            onClick={() => setGameState('HUB')}
                            className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                           <RefreshCcw size={20} /> Início
                        </button>
                        <button 
                            onClick={() => onNavigate('DASHBOARD_RANKING')}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Trophy size={20} /> Ver Ranking
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// Simple Icon component for the victory screen
const TrendingUpIcon = ({ size = 24, className = "" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
);
