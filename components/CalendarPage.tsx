import React from 'react';

const MiniMonth: React.FC<{ name: string; year: string; days: (number|null)[]; highlight?: number; active?: boolean }> = ({ name, year, days, highlight, active }) => {
    return (
        <div className={`p-6 rounded-3xl transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
             <div className="grid grid-cols-7 gap-4 text-center text-lg font-medium mb-4">
                 {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                     <div key={i} className="text-white font-bold">{d}</div>
                 ))}
             </div>
             <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-xl">
                 {days.map((day, idx) => (
                     <div key={idx} className={`
                        w-10 h-10 flex items-center justify-center mx-auto rounded-full
                        ${day === null ? '' : ''}
                        ${!active ? 'text-gray-400' : 'text-white'}
                     `}>
                         {day}
                     </div>
                 ))}
             </div>
        </div>
    );
};

export const CalendarPage: React.FC = () => {
  // Mock data for November
  const novDays = [
    null, null, null, null, null, 1, 2, 
    3, 4, 5, 6, 7, 8, 9, 
    10, 11, 12, 13, 14, 15, 16, 
    17, 18, 19, 20, 21, 22, 23, 
    24, 25, 26, 27, 28, 29, 30
  ]

  return (
    <div className="bg-brand-dark min-h-screen p-16 text-white relative animate-fade-in overflow-hidden">
        <h1 className="text-6xl font-bold mb-8">2025</h1>
        
        <div className="flex flex-col md:flex-row gap-24 items-start">
            {/* November (Inactive/Mini) */}
            <div className="mt-8">
                 <h2 className="text-4xl font-bold mb-6 ml-6">Novembro</h2>
                 <MiniMonth name="Novembro" year="2025" days={novDays} active={true} />
            </div>

            {/* December (Active Card) */}
            <div className="relative">
                <h2 className="text-4xl font-bold mb-6 ml-6">Dezembro</h2>
                <div className="bg-[#F3F4F6] text-slate-800 p-8 rounded-[40px] shadow-2xl w-[450px] transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="grid grid-cols-7 gap-4 text-center text-xl font-bold mb-6 text-black border-b pb-4 border-gray-200">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-5 gap-x-1 text-center text-xl font-medium text-gray-500">
                         {/* Static mapping matching the screenshot exactly for Dec 2025 */}
                         {[null, 1, 2, 3, 4, 5, 6].map((d,i) => <div key={`r1-${i}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         
                         {[7, 8, 9].map((d) => <div key={`r2-${d}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         <div className="bg-[#8DA8E8] text-brand-dark font-bold rounded-full w-10 h-10 flex items-center justify-center mx-auto shadow-md cursor-pointer hover:bg-blue-300">10</div>
                         {[11, 12].map((d) => <div key={`r2b-${d}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         
                         {[13, 14, 15].map((d) => <div key={`r3-${d}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         <div className="bg-[#8DA8E8] text-brand-dark font-bold rounded-full w-10 h-10 flex items-center justify-center mx-auto shadow-md cursor-pointer hover:bg-blue-300">16</div>
                         {[17, 18].map((d) => <div key={`r3b-${d}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         
                         {[19, 20, 21, 22, 23, 24].map((d,i) => <div key={`r4-${i}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                         {[25, 26, 27, 28, 29, 30, 31].map((d,i) => <div key={`r5-${i}`} className="w-10 h-10 flex items-center justify-center mx-auto">{d}</div>)}
                    </div>

                    <div className="mt-10 border-t-2 border-gray-200 pt-6 space-y-6">
                        <div className="flex flex-col group cursor-pointer">
                             <div className="text-xs font-bold text-gray-400 mb-1 group-hover:text-blue-600 transition-colors">10:00 - 11:00</div>
                             <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">10 - Reunião Administrativa</div>
                        </div>
                        <div className="flex flex-col group cursor-pointer">
                             <div className="text-xs font-bold text-gray-400 mb-1 group-hover:text-blue-600 transition-colors">10:30 - 11:30</div>
                             <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">16 - Reunião RH</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2026 Preview */}
        <div className="mt-24 opacity-40">
            <h1 className="text-6xl font-bold mb-8">2026</h1>
            <div className="flex gap-24">
                 <div>
                    <h2 className="text-3xl font-bold mb-4 ml-6">Janeiro</h2>
                    <div className="p-6">
                        <div className="grid grid-cols-7 gap-4 text-center mb-4">
                            {['D', 'S', 'T', 'Q', 'Q', 'S'].map((d, i) => <div key={i} className="font-bold">{d}</div>)}
                        </div>
                         <div className="grid grid-cols-7 gap-4 text-center text-xl">
                            <div></div><div></div><div></div><div></div><div>1</div><div>2</div><div>3</div>
                        </div>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold mb-4 ml-6">Fevereiro</h2>
                     <div className="p-6">
                        <div className="grid grid-cols-7 gap-4 text-center mb-4">
                            {['D', 'S', 'T', 'Q', 'Q', 'S'].map((d, i) => <div key={i} className="font-bold">{d}</div>)}
                        </div>
                         <div className="grid grid-cols-7 gap-4 text-center text-xl">
                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};