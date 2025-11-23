import React, { useState } from 'react';
import { Check } from 'lucide-react';

type QuizStep = 'INTRO' | 'QUESTION' | 'RESULT';

export const QuizPage: React.FC = () => {
  const [step, setStep] = useState<QuizStep>('INTRO');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 'INTRO') setStep('QUESTION');
    else if (step === 'QUESTION' && selectedOption) setStep('RESULT');
    else if (step === 'RESULT') {
        setStep('INTRO');
        setSelectedOption(null);
    }
  };

  // Geometry configuration for the diagonal line
  // Start Y (Left side): 40%
  // End Y (Right side): 100% (or close to it)
  // Equation: top = 40 + (left / 100) * 60
  const dots = Array.from({ length: 9 }).map((_, i) => {
    const left = 5 + i * 11; // Spread horizontally from 5% to ~93%
    const top = 40 + (left / 100) * 60; // Calculate Y based on the slope
    return { left: `${left}%`, top: `${top}%` };
  });

  return (
    <div className="w-full min-h-screen relative bg-white overflow-hidden font-sans">
       
       {/* INTRO SCREEN */}
       {step === 'INTRO' && (
           <>
               {/* Dark Blue Shape */}
               {/* Polygon: Top-Left, Top-Right, Bottom-Right, Left-Mid */}
               {/* This creates a diagonal that goes DOWN from left to right */}
               <div 
                  className="absolute inset-0 bg-brand-dark z-0 shadow-2xl"
                  style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 40%)' 
                  }}
               />
               
               {/* Dots along the diagonal */}
               {dots.map((pos, i) => (
                  <div 
                    key={i}
                    className="absolute w-14 h-14 bg-[#E5E7EB] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] z-10"
                    style={{ 
                        left: pos.left, 
                        top: pos.top,
                        transform: 'translate(-50%, -50%)'
                    }}
                  />
               ))}

               {/* Content */}
               <div className="relative z-20 w-full h-full min-h-screen flex flex-col items-end justify-center pr-12 md:pr-24 pb-32">
                  <div className="text-right flex flex-col items-end space-y-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        Interaja conosco e <br/>
                        acumule pontos
                    </h1>
                    <button 
                        onClick={handleNext}
                        className="bg-[#3B82F6] hover:bg-blue-500 text-white text-xl font-semibold py-3 px-16 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95"
                    >
                        Inicie
                    </button>
                  </div>
               </div>
           </>
       )}

       {/* QUESTION & RESULT SCREENS */}
       {step !== 'INTRO' && (
         <div className="absolute inset-0 bg-brand-dark flex items-center justify-center p-4 md:p-8">
            <div className="bg-[#F3F4F6] w-full max-w-5xl rounded-[2.5rem] p-8 md:p-16 shadow-2xl relative min-h-[600px] flex flex-col justify-between animate-fade-in">
                
                {step === 'QUESTION' && (
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-400 mb-12 leading-snug">
                            Qual aba concentra o calendário com <br className="hidden md:block"/>
                            reuniões, treinamentos e aniversários da <br className="hidden md:block"/>
                            empresa?
                        </h2>
                        
                        <div className="space-y-6 pl-2">
                            {['A) Feed', 'B) Calendário', 'C) Chat', 'D) Ranking'].map((opt) => {
                                const isSelected = selectedOption === opt;
                                return (
                                    <div 
                                        key={opt}
                                        onClick={() => setSelectedOption(opt)}
                                        className={`text-2xl md:text-3xl font-bold cursor-pointer transition-all duration-200 ${
                                            isSelected ? 'text-gray-900 scale-[1.01] origin-left' : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        {opt}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'RESULT' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pop-in">
                         <div className="w-24 h-24 bg-brand-dark rounded-full flex items-center justify-center shadow-xl mb-4">
                            <Check className="text-white w-12 h-12" strokeWidth={4} />
                         </div>
                         <h2 className="text-4xl md:text-5xl font-bold text-gray-500">Resposta certa</h2>
                         <p className="text-5xl md:text-6xl font-bold text-gray-400 opacity-80">+ 5 pontos</p>
                    </div>
                )}

                {/* Next Button */}
                <div className="flex justify-end pt-8">
                     <button 
                        onClick={handleNext}
                        className="bg-[#3B82F6] hover:bg-blue-600 text-white text-lg font-medium py-3 px-12 rounded-full shadow-md transition-all transform active:scale-95"
                    >
                        Próximo
                    </button>
                </div>

            </div>
         </div>
       )}

    </div>
  );
};