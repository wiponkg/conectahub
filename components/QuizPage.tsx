
import React, { useState, useEffect } from 'react';
import { Trophy, Star, ArrowRight, CheckCircle2, XCircle, BrainCircuit, Medal, ChevronRight, Loader2, RefreshCcw, Play } from 'lucide-react';
import { useTheme } from '../App';
import { User, ViewState } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

// --- Types & Mock Data ---

type GameState = 'HUB' | 'PLAYING' | 'VICTORY';
type QuestionState = 'QUESTION' | 'FEEDBACK';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  points: number;
}

const DAILY_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Na tela inicial, há uma área para 'Compartilhe alguma novidade...'. Qual é o principal propósito desse recurso na comunicação interna?",
    options: [
      "A) Entretenimento", 
      "B) Incentivar o compartilhamento de informações e atualizações", 
      "C) Registrar ponto eletrônico", 
      "D) Acessar documentos antigos"
    ],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 2,
    text: "A seção 'Avisos', visível no painel principal, é usada para:",
    options: [
      "A) Publicar notícias externas", 
      "B) Comunicar informações urgentes e relevantes aos colaboradores", 
      "C) Divulgar vagas de emprego", 
      "D) Registrar processos administrativos"
    ],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 3,
    text: "No feed da plataforma, as mensagens publicadas com horários (como 'há 2 horas' e 'ontem') são importantes para a comunicação interna porque:",
    options: [
      "A) Ajudam os colaboradores a acompanhar a atualidade das informações", 
      "B) Servem apenas para controle de ponto", 
      "C) Indicam o nível de autoridade de quem publicou", 
      "D) Funcionam como lembretes automáticos de tarefas pessoais"
    ],
    correctAnswer: 0,
    points: 5
  },
  {
    id: 4,
    text: "O módulo 'Reconhecimento' no site funciona como uma ferramenta estratégica para:",
    options: [
      "A) Evitar que colaboradores publiquem conteúdo", 
      "B) Corrigir erros de comunicação", 
      "C) Controlar horas trabalhadas", 
      "D) Aumentar engajamento e reforçar comportamentos desejados"
    ],
    correctAnswer: 3,
    points: 5
  },
  {
    id: 5,
    text: "O 'Ranking' exibido na plataforma pode ser interpretado como um mecanismo de gamificação interna que:",
    options: [
      "A) Serve apenas para jogos corporativos", 
      "B) Tem como único objetivo medir produtividade individual", 
      "C) Prioriza a transparência e incentiva o alinhamento de metas por meio de métricas visíveis", 
      "D) Reduz a cooperação entre equipes"
    ],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 6,
    text: "Um dos principais benefícios da comunicação interna eficiente é:",
    options: [
        "A) Aumentar rumores",
        "B) Fortalecer alinhamento e cultura organizacional",
        "C) Reduzir colaboração entre equipes",
        "D) Restringir acesso à informação"
    ],
    correctAnswer: 1,
    points: 5
  }
];

interface QuizPageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ user, onNavigate }) => {
  const { isDarkMode } = useTheme();
  
  // Game Flow States
  const [gameState, setGameState] = useState<GameState>('HUB');
  const [questionState, setQuestionState] = useState<QuestionState>('QUESTION');
  
  // Logic States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = DAILY_QUESTIONS[currentQuestionIdx];

  const handleStartQuiz = () => {
    setCurrentQuestionIdx(0);
    setScore(0);
    setGameState('PLAYING');
    setQuestionState('QUESTION');
  };

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
    
    // Immediate Feedback Logic as seen in video
    const correct = idx === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + currentQuestion.points);
    }
    
    // Switch to Feedback View
    setQuestionState('FEEDBACK');
  };

  const handleNext = async () => {
    if (currentQuestionIdx < DAILY_QUESTIONS.length - 1) {
      // Go to next question
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setQuestionState('QUESTION');
    } else {
      // Finish Quiz
      setIsLoading(true);
      try {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                points: increment(score),
                completedMissions: arrayUnion('daily_' + new Date().toISOString().split('T')[0]) 
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

  // --- RENDER HELPERS ---

  const renderHub = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-fade-in px-4">
        <div className={`max-w-4xl w-full rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                    <BrainCircuit className="text-blue-600 w-12 h-12" />
                </div>
            </div>

            <h1 className={`text-3xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Quiz da Cultura
            </h1>
            <p className={`text-lg mb-10 max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Teste seus conhecimentos sobre a plataforma e a cultura da nossa empresa.
                São {DAILY_QUESTIONS.length} perguntas rápidas para você acumular pontos!
            </p>

            <button 
                onClick={handleStartQuiz}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-700 hover:shadow-lg active:scale-95 hover:w-64 w-56"
            >
                <span className="mr-2">Jogar Agora</span>
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" />
            </button>
        </div>
    </div>
  );

  const renderPlaying = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 animate-fade-in">
         {/* Main Card Container */}
         <div className={`w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-[#fcfcfc]'}`}>
            
            {/* Header / Progress Text (Only visible in Question State) */}
            {questionState === 'QUESTION' && (
                <div className="pt-10 pb-4 px-8 text-center">
                    <h2 className={`text-xl md:text-2xl font-bold leading-relaxed mb-6 ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>
                        {currentQuestionIdx + 1}. {currentQuestion.text}
                    </h2>
                    <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Pergunta {currentQuestionIdx + 1} de {DAILY_QUESTIONS.length}
                    </p>
                </div>
            )}

            {/* --- STATE: QUESTION --- */}
            {questionState === 'QUESTION' && (
                <div className="flex-1 px-6 md:px-12 pb-10 flex flex-col justify-center gap-3 animate-slide-up">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base hover:scale-[1.01] active:scale-95 ${
                                isDarkMode 
                                    ? 'bg-slate-700 border-slate-600 text-gray-200 hover:border-blue-500 hover:bg-slate-600' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {/* --- STATE: FEEDBACK (RESULT) --- */}
            {questionState === 'FEEDBACK' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 animate-pop-in bg-inherit">
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        
                        {isCorrect ? (
                            // CORRECT
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-[popIn_0.5s_ease-out]">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={3} />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>
                                    Resposta Certa
                                </h2>
                                <p className="text-2xl font-bold text-green-500">
                                    + {currentQuestion.points} Pontos
                                </p>
                            </div>
                        ) : (
                            // WRONG
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6 animate-[shake_0.5s_ease-in-out]">
                                    <XCircle className="w-12 h-12 text-red-500" strokeWidth={3} />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>
                                    Resposta Errada
                                </h2>
                                <p className="text-2xl font-bold text-gray-400">
                                    + 0 Pontos
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Next Button */}
                    <div className="w-full mt-auto pt-8">
                        <button
                            onClick={handleNext}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                                isCorrect ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'
                            }`}
                        >
                            Próximo <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Bar (Always visible at bottom or top, user requested specific layout but in video bar is not always clear, adding subtle bar at top) */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-slate-700">
                <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${((currentQuestionIdx + 1) / DAILY_QUESTIONS.length) * 100}%` }}
                ></div>
            </div>

         </div>
      </div>
    );
  };

  const renderVictory = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full animate-fade-in px-4">
        <div className={`max-w-md w-full rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
             {/* Confetti Effect (CSS only for simplicity) */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
             
             <div className="mb-6 relative inline-block">
                 <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
                 <Trophy className="w-20 h-20 text-yellow-500 relative z-10 mx-auto" fill="currentColor" />
             </div>

             <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 Quiz Finalizado!
             </h2>
             <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                 Você completou o desafio de hoje.
             </p>

             <div className={`p-6 rounded-2xl mb-8 border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-gray-100'}`}>
                 <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Pontuação Total</p>
                 <div className="text-5xl font-black text-blue-600">
                     {score} <span className="text-xl text-gray-400 font-medium">pts</span>
                 </div>
             </div>

             <div className="space-y-3">
                 <button 
                    onClick={() => onNavigate('DASHBOARD_RANKING')}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                 >
                    Ver Ranking
                 </button>
                 <button 
                    onClick={() => setGameState('HUB')}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                 >
                    Voltar ao Início
                 </button>
             </div>
        </div>
    </div>
  );

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#000033]'}`}>
        {/* Using a very dark blue background for the whole page as shown in video */}
        
        {gameState === 'HUB' && renderHub()}
        {gameState === 'PLAYING' && renderPlaying()}
        {gameState === 'VICTORY' && renderVictory()}

    </div>
  );
};
