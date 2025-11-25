
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
  