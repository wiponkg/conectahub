
import React, { useState } from 'react';
import { Trophy, Star, Zap, ArrowRight, CheckCircle, XCircle, BrainCircuit, Medal, ChevronRight, Loader2, User as UserIcon } from 'lucide-react';
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

  const currentQuestion = DAILY_QUESTIONS[currentQuestionIdx];

  const handleStartQuiz = () => {
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setGameState('PLAYING');
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + currentQuestion.points);
    }
  };

  const handleNextQuestion = async () => {
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

  return (
    <div className={`min-h-full p-6 md:p-12 max-w-7xl mx-auto font-sans animate-fade-in ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        
        {/* Header */}
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

        {/* --- HUB VIEW --- */}
        {gameState === 'HUB' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feature: Quiz */}
                <div className={`lg:col-span-2 rounded-3xl p-8 relative overflow-hidden shadow-xl transition-all hover:scale-[1.01] group cursor-pointer ${isDarkMode ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`} onClick={handleStartQuiz}>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
                     
                     <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/20">
                            <BrainCircuit size={14} />
                            <span>DESTAQUE DO DIA</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Quiz da Cultura:<br/>Edição Semanal</h2>
                        <p className="text-blue-100 mb-8 max-w-md text-sm md:text-base">
                            Teste seus conhecimentos sobre os novos processos de RH e ganhe pontos extras para o ranking mensal.
                        </p>
                        <button className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2">
                            Começar Agora <ArrowRight size={18} />
                        </button>
                     </div>
                </div>

                {/* Missions List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-2">Missões Disponíveis</h3>
                    {STATIC_MISSIONS.map((mission) => {
                        const isCompleted = isMissionCompleted(mission.id);
                        return (
                            <div key={mission.id} className={`p-4 rounded-2xl flex items-center gap-4 transition-all border ${isCompleted ? (isDarkMode ? 'bg-slate-800/50 border-green-900/50 opacity-60' : 'bg-green-50 border-green-100 opacity-60') : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md')}`}>
                                <div className={`p-3 rounded-xl ${mission.color} text-white shadow-md`}>
                                    <mission.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{mission.title}</h4>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{mission.description}</p>
                                </div>
                                <div className="text-right">
                                    {isCompleted ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>+{mission.points}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- PLAYING VIEW --- */}
        {gameState === 'PLAYING' && (
            <div className="max-w-2xl mx-auto mt-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider opacity-60">
                        <span>Questão {currentQuestionIdx + 1} de {DAILY_QUESTIONS.length}</span>
                        <span>Pontos: {score}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestionIdx + 1) / DAILY_QUESTIONS.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className={`p-8 rounded-3xl shadow-2xl mb-8 animate-slide-up ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                    <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.text}</h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            let optionClass = isDarkMode 
                                ? 'bg-slate-900 border-slate-700 hover:bg-slate-700 text-gray-300' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
                            
                            if (isAnswerChecked) {
                                if (idx === currentQuestion.correctAnswer) {
                                    optionClass = 'bg-green-500 text-white border-green-600 shadow-md ring-2 ring-green-300 dark:ring-green-900';
                                } else if (idx === selectedOption) {
                                    optionClass = 'bg-red-500 text-white border-red-600 opacity-80';
                                } else {
                                    optionClass = 'opacity-50 grayscale';
                                }
                            } else if (selectedOption === idx) {
                                optionClass = 'bg-blue-600 text-white border-blue-700 shadow-lg scale-[1.02]';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isAnswerChecked}
                                    className={`w-full text-left p-4 rounded-xl border font-medium transition-all duration-200 flex items-center justify-between group ${optionClass}`}
                                >
                                    <span>{option}</span>
                                    {isAnswerChecked && idx === currentQuestion.correctAnswer && <CheckCircle size={20} />}
                                    {isAnswerChecked && idx === selectedOption && idx !== currentQuestion.correctAnswer && <XCircle size={20} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    {!isAnswerChecked ? (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={selectedOption === null}
                            className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg active:scale-95 ${selectedOption === null ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                        >
                            Confirmar Resposta
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 hover:shadow-green-500/30 animate-pop-in"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (currentQuestionIdx < DAILY_QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz')}
                            {!isLoading && <ChevronRight size={20} />}
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* --- VICTORY VIEW --- */}
        {gameState === 'VICTORY' && (
            <div className="flex flex-col items-center justify-center py-12 animate-pop-in">
                <div className="relative mb-8">
                     <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                     <Trophy size={80} className="text-yellow-400 relative z-10 drop-shadow-lg" />
                </div>
                
                <h2 className="text-4xl font-bold mb-2 text-center">Quiz Concluído!</h2>
                <p className={`text-lg mb-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Você demonstrou ótimo conhecimento sobre nossa cultura.</p>

                <div className={`p-8 rounded-3xl w-full max-w-sm mb-8 text-center border shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <span className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Pontuação Total</span>
                    <span className="block text-6xl font-black text-blue-600 mb-4">{score}</span>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                        <TrendingUpIcon size={14} />
                        <span>+ Ranking atualizado</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setGameState('HUB')}
                        className={`px-6 py-3 rounded-full font-bold transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                        Voltar ao Início
                    </button>
                    <button 
                        onClick={() => onNavigate('DASHBOARD_RANKING')}
                        className="px-6 py-3 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105"
                    >
                        Ver Ranking
                    </button>
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
