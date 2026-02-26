
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, X, Loader2, Trash2, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useTheme } from '../App';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';

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

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string;
    type: 'admin' | 'hr' | 'general';
    userId?: string;
}

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
  // Init with CURRENT DATE
  const [date, setDate] = useState(new Date()); 
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animKey, setAnimKey] = useState(0);
  
  // Event State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null); // State for delete confirmation

  const [newEvent, setNewEvent] = useState({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'general'
  });

  const { isDarkMode } = useTheme();

  // Load Events from Firestore
  useEffect(() => {
      const q = query(collection(db, 'events'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedEvents = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as CalendarEvent[];
          setEvents(loadedEvents);
      });
      return () => unsubscribe();
  }, []);

  const handleMonthChange = (offset: number) => {
    setDirection(offset > 0 ? 'right' : 'left');
    setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setAnimKey(prev => prev + 1);
  };

  const requestDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setEventToDelete(id);
  };

  const confirmDelete = async () => {
      if (!eventToDelete) return;
      
      try {
          await deleteDoc(doc(db, 'events', eventToDelete));
          setEventToDelete(null);
      } catch (error) {
          console.error("Error deleting:", error);
          alert("Erro ao excluir evento. Tente novamente.");
      }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEvent.title || !newEvent.date) return;

      setIsSubmitting(true);
      try {
          await addDoc(collection(db, 'events'), {
              title: newEvent.title,
              date: newEvent.date,
              time: newEvent.time,
              type: newEvent.type,
              userId: auth.currentUser?.uid || 'anonymous',
              createdAt: new Date().toISOString()
          });
          setIsModalOpen(false);
          setNewEvent({
              title: '',
              date: new Date().toISOString().split('T')[0],
              time: '09:00',
              type: 'general'
          });
      } catch (error) {
          console.error("Error adding event:", error);
          alert("Não foi possível salvar o evento.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const year = date.getFullYear();
  const month = date.getMonth();
  
  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  
  const currentDays = getCalendarDays(year, month);
  
  // Filter events for current view
  const currentMonthEvents = events.filter(e => {
      const [eYear, eMonth] = e.date.split('-').map(Number);
      return eYear === year && eMonth === month + 1;
  }).map(e => ({
      ...e,
      day: parseInt(e.date.split('-')[2])
  })).sort((a, b) => a.day - b.day);

  const highlights = currentMonthEvents.map(e => e.day);

  return (
    <div className={`min-h-screen p-4 md:p-16 relative animate-fade-in overflow-hidden flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-brand-dark text-white'}`}>
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

        {/* --- DELETE CONFIRMATION MODAL --- */}
        {eventToDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-pop-in ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Excluir Evento?</h3>
                        <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setEventToDelete(null)} 
                                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="flex-1 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADD EVENT MODAL --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-pop-in ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon size={20} className="text-blue-500" />
                            Novo Evento
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleAddEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Título do Evento</label>
                            <input 
                                type="text" 
                                required
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                                placeholder="Ex: Reunião de Equipe"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-70">Data</label>
                                <input 
                                    type="date" 
                                    required
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-70">Horário</label>
                                <input 
                                    type="time" 
                                    required
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Tipo</label>
                            <select 
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <option value="general">Geral / Pessoal</option>
                                <option value="admin">Administrativo</option>
                                <option value="hr">RH / Importante</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className={`flex-1 py-2 rounded-xl font-bold transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Adicionar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 w-full">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white">{year}</h1>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => {
                        setNewEvent(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                >
                    <Plus size={20} /> <span className="hidden md:inline">Adicionar Evento</span>
                </button>

                <div className="flex gap-2 bg-white/10 rounded-full p-1">
                    <button 
                        onClick={() => handleMonthChange(-1)} 
                        className="p-3 rounded-full hover:bg-white/20 transition-all active:scale-95"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => handleMonthChange(1)} 
                        className="p-3 rounded-full hover:bg-white/20 transition-all active:scale-95"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </header>
        
        <div className="flex flex-col xl:flex-row gap-8 md:gap-24 items-start flex-1 w-full">
            
            {/* Previous Month (Mini) */}
            <div className="mt-8 hidden xl:block animate-fade-in opacity-50 hover:opacity-100 transition-opacity">
                 <h2 className="text-3xl font-bold mb-6 ml-6 text-white/50">{MONTH_NAMES[prevDate.getMonth()]}</h2>
                 <MiniMonth year={prevDate.getFullYear()} month={prevDate.getMonth()} />
            </div>

            {/* Active Month Card */}
            <div 
                key={animKey} 
                className={`relative flex-1 w-full max-w-[500px] mx-auto xl:mx-0 ${direction === 'right' ? 'anim-right' : direction === 'left' ? 'anim-left' : 'animate-pop-in'}`}
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 ml-4 md:ml-6 text-white text-center md:text-left">{MONTH_NAMES[month]}</h2>
                
                <div className={`p-4 md:p-8 rounded-3xl md:rounded-[40px] shadow-2xl w-full transform transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F3F4F6] text-slate-800'}`}>
                    {/* Week Header */}
                    <div className={`grid grid-cols-7 gap-1 md:gap-4 text-center text-sm md:text-lg font-bold mb-4 md:mb-6 border-b pb-4 ${isDarkMode ? 'text-gray-200 border-slate-700' : 'text-black border-gray-200'}`}>
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i} className="opacity-50">{d}</div>
                        ))}
                    </div>
                    
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 gap-x-1 md:gap-x-2 text-center text-base md:text-xl font-medium">
                         {currentDays.map((day, idx) => {
                             const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                             const hasEvent = day && highlights.includes(day);
                             
                             return (
                                <div key={idx} className="relative w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center">
                                    {day ? (
                                        <div className={`
                                            w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all duration-200
                                            ${isToday ? 'bg-blue-600 text-white shadow-lg scale-110 font-bold' : ''}
                                            ${hasEvent && !isToday ? (isDarkMode ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30' : 'bg-[#8DA8E8] text-brand-dark') + ' font-bold shadow-md cursor-pointer hover:scale-105' : ''}
                                            ${!hasEvent && !isToday ? (isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500') + ' cursor-default' : ''}
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
                    <div className={`mt-8 md:mt-10 border-t-2 pt-6 space-y-3 min-h-[120px] md:min-h-[160px] ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xs font-bold opacity-50 uppercase tracking-wider">Eventos do Mês</h3>
                             {currentMonthEvents.length > 0 && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{currentMonthEvents.length}</span>}
                        </div>
                        
                        {currentMonthEvents.length > 0 ? (
                            currentMonthEvents.map((evt) => (
                                <div key={evt.id} className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border border-transparent ${isDarkMode ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-white hover:shadow-md hover:border-gray-100'}`}>
                                     <div className="flex flex-col">
                                        <div className={`flex items-center gap-2 text-xs font-bold mb-1 transition-colors ${isDarkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`}>
                                            <Clock size={14} />
                                            {evt.time}
                                        </div>
                                        <div className={`font-bold text-sm md:text-base flex items-center gap-2 md:gap-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0 ${
                                                evt.type === 'admin' ? 'bg-blue-500' : 
                                                evt.type === 'hr' ? 'bg-purple-500' : 'bg-green-500'
                                            }`}></span>
                                            <span className="truncate"><span className="font-extrabold mr-1">{evt.day} -</span> {evt.title}</span>
                                        </div>
                                     </div>
                                     
                                     {/* Delete Button */}
                                     <button 
                                        onClick={(e) => requestDelete(e, evt.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Excluir evento"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                </div>
                            ))
                        ) : (
                            <div className={`flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-gray-500 bg-slate-800/50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
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
