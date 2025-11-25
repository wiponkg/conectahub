
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// Helper to get days for grid generation
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  
  // Fill empty slots for previous month days
  for (let i = 0; i < firstDay; i++) days.push(null);
  
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  return days;
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Mock Data for Events
const EVENTS: Record<string, { day: number, time: string, title: string, type: 'admin' | 'hr' }[]> = {
    '2025-11': [ // December (Month 11 in JS Date)
        { day: 10, time: '10:00 - 11:00', title: 'Reunião Administrativa', type: 'admin' },
        { day: 16, time: '10:30 - 11:30', title: 'Reunião RH', type: 'hr' }
    ]
};

const getEventKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

const MiniMonth: React.FC<{ year: number; month: number }> = ({ year, month }) => {
    const days = getCalendarDays(year, month);
    return (
        <div className="p-6 rounded-3xl opacity-60 hover:opacity-100 transition-opacity duration-300 select-none">
             <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
                 {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                     <div key={i} className="text-white/70">{d}</div>
                 ))}
             </div>
             <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-sm">
                 {days.map((day, idx) => (
                     <div key={idx} className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full ${day ? 'text-white' : ''}`}>
                         {day}
                     </div>
                 ))}
             </div>
        </div>
    );
};

export const CalendarPage: React.FC = () => {
  const [date, setDate] = useState(new Date(2025, 11)); // Init: Dec 2025
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const handleMonthChange = (offset: number) => {
    setDirection(offset > 0 ? 'right' : 'left');
    setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setAnimKey(prev => prev + 1);
  };

  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Previous month for Mini Calendar
  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  
  const currentDays = getCalendarDays(year, month);
  
  // Events Logic
  const eventsKey = getEventKey(date);
  const events = EVENTS[eventsKey] || [];
  const highlights = events.map(e => e.day);

  return (
    <div className="bg-brand-dark min-h-screen p-4 md:p-16 text-white relative animate-fade-in overflow-hidden flex flex-col font-sans">
        <style>{`
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(40px) scale(0.98); }
                to { opacity: 1; transform: translateX(0) scale(1); }
            }
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-40px) scale(0.98); }
                to { opacity: 1; transform: translateX(0) scale(1); }
            }
            .anim-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .anim-left { animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <header className="flex flex-col md:flex-row items-center md:items-center justify-between mb-8 md:mb-12 gap-6 w-full">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight">{year}</h1>
            <div className="flex gap-4">
                <button 
                    onClick={() => handleMonthChange(-1)} 
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all active:scale-95"
                    aria-label="Mês anterior"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => handleMonthChange(1)} 
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all active:scale-95"
                    aria-label="Próximo mês"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </header>
        
        <div className="flex flex-col xl:flex-row gap-8 md:gap-24 items-start flex-1 w-full">
            
            {/* Previous Month (Mini) */}
            <div className="mt-8 hidden xl:block animate-fade-in">
                 <h2 className="text-3xl font-bold mb-6 ml-6 text-white/50">{MONTH_NAMES[prevDate.getMonth()]}</h2>
                 <MiniMonth year={prevDate.getFullYear()} month={prevDate.getMonth()} />
            </div>

            {/* Active Month Card */}
            <div 
                key={animKey} 
                className={`relative flex-1 w-full max-w-[500px] mx-auto xl:mx-0 ${direction === 'right' ? 'anim-right' : direction === 'left' ? 'anim-left' : 'animate-pop-in'}`}
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 ml-4 md:ml-6 text-white text-center md:text-left">{MONTH_NAMES[month]}</h2>
                
                <div className="bg-[#F3F4F6] text-slate-800 p-4 md:p-8 rounded-3xl md:rounded-[40px] shadow-2xl w-full transform transition-all duration-300">
                    {/* Week Header */}
                    <div className="grid grid-cols-7 gap-1 md:gap-4 text-center text-sm md:text-lg font-bold mb-4 md:mb-6 text-black border-b pb-4 border-gray-200">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-gray-400">{d}</div>
                        ))}
                    </div>
                    
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 gap-x-1 md:gap-x-2 text-center text-base md:text-xl font-medium text-gray-500">
                         {currentDays.map((day, idx) => {
                             const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                             const hasEvent = day && highlights.includes(day);
                             
                             return (
                                <div key={idx} className="relative w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center">
                                    {day ? (
                                        <div className={`
                                            w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all duration-200
                                            ${isToday ? 'bg-blue-600 text-white shadow-lg scale-110 font-bold' : ''}
                                            ${hasEvent && !isToday ? 'bg-[#8DA8E8] text-brand-dark font-bold shadow-md cursor-pointer hover:bg-blue-300 hover:scale-105' : ''}
                                            ${!hasEvent && !isToday ? 'hover:bg-gray-200 cursor-default' : ''}
                                        `}>
                                            {day}
                                        </div>
                                    ) : (
                                        <span></span>
                                    )}
                                </div>
                             )
                         })}
                    </div>

                    {/* Events List */}
                    <div className="mt-8 md:mt-10 border-t-2 border-gray-200 pt-6 space-y-4 min-h-[120px] md:min-h-[160px]">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eventos do Mês</h3>
                             {events.length > 0 && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{events.length}</span>}
                        </div>
                        
                        {events.length > 0 ? (
                            events.map((evt, i) => (
                                <div key={i} className="flex flex-col group cursor-pointer p-3 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-100">
                                     <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1 group-hover:text-blue-600 transition-colors">
                                         <Clock size={14} />
                                         {evt.time}
                                     </div>
                                     <div className="font-bold text-gray-900 text-sm md:text-lg group-hover:text-blue-700 transition-colors flex items-center gap-2 md:gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0 ${evt.type === 'admin' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                        <span className="truncate"><span className="font-extrabold mr-1">{evt.day} -</span> {evt.title}</span>
                                     </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-24 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-sm font-medium">Nenhum evento agendado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Next Month Preview (Hidden on small screens) */}
             <div className="mt-24 opacity-30 hidden 2xl:block transform scale-90 select-none">
                 <h2 className="text-3xl font-bold mb-6 ml-6">{MONTH_NAMES[nextDate.getMonth()]}</h2>
                 <MiniMonth year={nextDate.getFullYear()} month={nextDate.getMonth()} />
            </div>

        </div>
    </div>
  );
};
