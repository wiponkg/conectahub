
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../App';

interface Step {
  target: string | null; // ID of the element to highlight. null means centered modal.
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Step[] = [
  {
    target: null,
    title: "Bem-vindo ao ConectaHub!",
    content: "Sua nova plataforma de comunicação e comunidade corporativa. Vamos fazer um tour rápido?",
    position: 'bottom'
  },
  {
    target: 'sidebar-nav',
    title: "Navegação Principal",
    content: "Aqui você acessa todas as ferramentas: Calendário, Ranking, Chat e seus Pontos.",
    position: 'right'
  },
  {
    target: 'main-feed',
    title: "Feed de Notícias",
    content: "Fique por dentro das novidades da empresa e interaja com seus colegas em tempo real.",
    position: 'bottom'
  },
  {
    target: 'dashboard-widgets',
    title: "Avisos e Conquistas",
    content: "Confira comunicados urgentes e reconhecimentos especiais nesta área lateral.",
    position: 'left'
  },
  {
    target: 'user-profile-btn',
    title: "Seu Perfil",
    content: "Clique aqui para atualizar sua foto, editar dados ou sair da conta.",
    position: 'bottom'
  }
];

export const OnboardingTour: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const { isDarkMode } = useTheme();

  // Reset step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Calculate position of the target element
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      if (step.target) {
        const element = document.getElementById(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
          // Scroll to element if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Fallback if element not found (e.g. mobile view might hide sidebar)
            setCoords(null);
        }
      } else {
        setCoords(null); // Center modal
      }
    };

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Calculate Popover Position based on coords and preferred position
  const getPopoverStyle = () => {
    if (!coords) return {}; // Centered via CSS class

    const gap = 12;
    // Default styles for absolute positioning
    let style: React.CSSProperties = { position: 'absolute' };

    // Simple positioning logic (can be expanded)
    switch(step.position) {
        case 'right':
            style.top = coords.top + (coords.height / 2) - 100; // rough vertical center offset
            style.left = coords.left + coords.width + gap;
            break;
        case 'left':
            style.top = coords.top;
            style.right = window.innerWidth - coords.left + gap;
            style.left = 'auto'; // Override
            break;
        case 'bottom':
        default:
             style.top = coords.top + coords.height + gap;
             style.left = coords.left;
             // Prevent overflow right
             if (coords.left > window.innerWidth / 2) {
                 style.left = 'auto';
                 style.right = window.innerWidth - (coords.left + coords.width);
             }
             break;
    }
    return style;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300" onClick={onClose} />

      {/* Spotlight Effect (Optional - purely visual overlay cutouts are complex, using high z-index relative container instead) */}
      {coords && (
        <div 
            className="absolute z-[61] rounded-xl border-4 border-yellow-400 transition-all duration-300 ease-in-out pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            style={{
                top: coords.top - 4,
                left: coords.left - 4,
                width: coords.width + 8,
                height: coords.height + 8,
            }}
        />
      )}

      {/* Tooltip Card */}
      <div 
        className={`fixed z-[62] w-80 md:w-96 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
        style={coords ? getPopoverStyle() : { 
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)' 
        }}
      >
        <div className="flex justify-between items-start">
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1 block">
                    Passo {currentStep + 1} de {TOUR_STEPS.length}
                </span>
                <h3 className="text-xl font-bold leading-tight">{step.title}</h3>
            </div>
            <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-slate-700' : ''}`}>
                <X size={20} className="opacity-50" />
            </button>
        </div>
        
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            {step.content}
        </p>

        <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
                {TOUR_STEPS.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                ))}
            </div>
            <div className="flex gap-2">
                {currentStep > 0 && (
                    <button 
                        onClick={handlePrev}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    {isLastStep ? 'Concluir' : 'Próximo'}
                    {!isLastStep && <ChevronRight size={16} />}
                </button>
            </div>
        </div>
      </div>
    </>
  );
};
