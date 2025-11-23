import React, { useState } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { MessageSquare, Users, Calculator, Gamepad2, Phone, Mail, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden font-sans">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-hero-enter {
          animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0; /* Start hidden to prevent flash */
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full relative z-50">
        <Logo />
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 text-sm font-medium text-gray-500">
          <button className="hover:text-blue-700 transition-colors">Início</button>
          <button className="hover:text-blue-700 transition-colors">Sobre nós</button>
          <button className="hover:text-blue-700 transition-colors">Contato</button>
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4 items-center">
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-700 transition-colors"
          >
            Entrar
          </button>
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="px-8 py-3 text-sm font-bold text-white bg-[#4338ca] rounded-lg hover:bg-indigo-800 transition-all shadow-md"
          >
            Cadastre-se
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gray-700 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-2xl p-6 flex flex-col gap-6 md:hidden border-t border-gray-100 animate-fade-in">
             <nav className="flex flex-col gap-4 text-base font-medium text-gray-600">
                <button className="text-left hover:text-blue-700">Início</button>
                <button className="text-left hover:text-blue-700">Sobre nós</button>
                <button className="text-left hover:text-blue-700">Contato</button>
             </nav>
             <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => onNavigate('LOGIN')}
                  className="w-full py-3 text-center text-gray-700 font-bold border border-gray-200 rounded-lg"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => onNavigate('REGISTER')}
                  className="w-full py-3 text-center text-white bg-[#4338ca] font-bold rounded-lg"
                >
                  Cadastre-se
                </button>
             </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 pt-12 md:pt-20 pb-40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          
          {/* Text Content */}
          <div className="space-y-8 animate-hero-enter z-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark leading-[1.1]">
              “Mais do que um canal interno, uma <span className="text-[#3B82F6]">comunidade</span> de conexões reais”
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Rápido, intuitivo e conectado é a nossa cultura, a ConectaHub é o jeito mais fácil de ficar informado e participar do que acontece dentro de sua empresa.
            </p>
            <button 
                onClick={() => onNavigate('REGISTER')}
                className="px-10 py-3 bg-[#3B82F6] text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition-all transform hover:-translate-y-1"
            >
              Conecte-se
            </button>
          </div>

          {/* Image Content - Purple Circle + Team */}
          <div className="relative flex justify-center md:justify-end animate-hero-enter delay-200 mt-12 md:mt-0">
             {/* Purple Circle Container - Larger and offset to match print */}
             <div className="relative w-[400px] h-[400px] md:w-[650px] md:h-[650px] bg-[#818CF8] rounded-full flex items-center justify-center overflow-hidden shadow-2xl -mr-24 md:-mr-40 border-[6px] border-white">
                <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                    alt="Team collaboration" 
                    className="w-full h-full object-cover opacity-95"
                    style={{ objectPosition: 'center 25%', transform: 'scale(1.1)' }}
                />
             </div>
          </div>
        </div>

        {/* Bottom Geometric Shape - Refined Grey Valley Curve */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 w-full z-20">
             <svg viewBox="0 0 1440 120" className="w-full h-full object-cover" preserveAspectRatio="none">
                {/* 
                    Smoother curve to align with text/image columns:
                    M0,0 - Start Top Left
                    Q720,90 - Control point center, dipping down nicely but not too deep
                    1440,0 - End Top Right
                    L1440,120 L0,120 Z - Close bottom
                */}
                <path fill="#BCC1D1" fillOpacity="1" d="M0,0 Q720,90 1440,0 L1440,120 L0,120 Z" />
            </svg>
        </div>
      </section>

      {/* Section 2: Connection (Dark Blue) */}
      <section className="bg-brand-dark text-white relative pt-24">
        
        {/* Banner Image */}
        <div className="w-full h-[350px] md:h-[450px] relative z-10 overflow-hidden">
             <div className="absolute inset-0 bg-[#000080] opacity-40 mix-blend-multiply z-20" />
             <div className="absolute inset-0 bg-indigo-900/30 z-20" />
             <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000" 
                alt="Meeting Room" 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 40%' }}
             />
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                        Conectar pessoas é fortalecer resultados
                    </h2>
                    <div className="w-full h-64 overflow-hidden rounded shadow-lg">
                        <img 
                            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" 
                            alt="Team Collaboration" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="space-y-8 pt-8 md:pt-0">
                    <div className="w-full h-64 overflow-hidden rounded shadow-lg">
                        <img 
                            src="https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1000" 
                            alt="Hands working on laptops" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-lg leading-relaxed text-gray-200">
                        Acreditamos que uma empresa forte começa pela forma como se comunica. Por isso, criamos um portal feito para você: claro, intuitivo e cheio de conteúdo relevante.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* White Separator Strip */}
      <div className="w-full h-3 bg-white relative z-20"></div>

      {/* Section 3: Quem Somos (Dark Blue + White Wave) */}
      <section className="bg-brand-dark pt-8 pb-0 relative">
          <div className="max-w-7xl mx-auto px-8 relative z-20 pb-12">
            {/* Text Content */}
            <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quem somos?</h2>
                <p className="text-white text-sm md:text-base leading-relaxed max-w-4xl font-medium opacity-90">
                    A Conectahub foi criada para aproximar pessoas, informações e iniciativas, ele funciona como um ponto central onde todos os colaboradores podem se conectar, colaborar e se manter atualizados sobre tudo o que acontece no nosso ambiente de trabalho.
                </p>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">Nossos serviços:</h3>
            
            {/* Cards Container */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full relative h-[350px] items-end">
                
                {/* Calculator - Lowest (Left) */}
                <div className="relative z-10 flex justify-center translate-y-24">
                    <div 
                        onClick={() => onNavigate('DASHBOARD_CALENDAR')}
                        className="w-full max-w-[180px] h-[260px] bg-[#E5E5E5] rounded-[1.5rem] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <Calculator size={48} className="text-[#C4C4C4] group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>

                {/* Chat - Mid (Mid-Left) */}
                <div className="relative z-10 flex justify-center translate-y-4">
                    <div 
                        onClick={() => onNavigate('DASHBOARD_CHAT')}
                        className="w-full max-w-[180px] h-[260px] bg-[#E5E5E5] rounded-[1.5rem] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <MessageSquare size={56} className="text-[#C4C4C4] group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>

                {/* Users - High (Mid-Right) */}
                <div className="relative z-10 flex justify-center -translate-y-8">
                    <div 
                        onClick={() => onNavigate('DASHBOARD_RANKING')}
                        className="w-full max-w-[180px] h-[260px] bg-[#E5E5E5] rounded-[1.5rem] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <Users size={56} className="text-[#C4C4C4] group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>

                {/* Gamepad - Mid/High (Right) */}
                <div className="relative z-10 flex justify-center translate-y-0">
                    <div 
                        onClick={() => onNavigate('DASHBOARD_POINTS')}
                        className="w-full max-w-[180px] h-[260px] bg-[#E5E5E5] rounded-[1.5rem] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <Gamepad2 size={56} className="text-[#C4C4C4] group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>
            </div>
          </div>
          
           {/* White Wave Shape */}
           {/* Rises from left to right with a specific curve to intersect cards */}
           <div className="absolute bottom-0 left-0 right-0 w-full h-[400px] pointer-events-none z-0 flex items-end">
             <svg viewBox="0 0 1440 320" className="w-full h-full object-cover" preserveAspectRatio="none">
                {/* 
                    Adjusted Wave Path:
                    M0,320 - Start bottom left
                    L0,260 - Start height on left (cutting through Calc)
                    Q720,50 - Peak high in the middle (behind Users)
                    1440,120 - End height on right (behind Gamepad)
                    L1440,320 - Close bottom right
                */}
                <path fill="#f3f4f6" fillOpacity="1" d="M0,320 L0,260 Q720,50 1440,120 L1440,320 Z"></path>
            </svg>
        </div>
      </section>

      {/* Section 4: Stats & Footer */}
      <section className="bg-[#f3f4f6] pt-20 pb-0 relative">
         <div className="w-full max-w-7xl mx-auto px-8 relative z-20">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">Nossos números falam por nós</h2>
            
            {/* Stats Card */}
            <div className="relative mb-[-100px] z-30">
                <div className="bg-[#E5E5E5] rounded-[2.5rem] p-10 md:p-16 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        {/* Text Stats */}
                        <div className="text-left space-y-6 lg:col-span-1">
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">+10 milhões</div>
                                <div className="text-gray-500 font-medium text-lg">de acessos</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">+1,500</div>
                                <div className="text-gray-500 font-medium text-lg">empresas</div>
                            </div>
                        </div>

                        {/* Circular Stats */}
                        <div className="lg:col-span-4 flex flex-wrap justify-between gap-8">
                            {[
                                { val: '93%', label: 'de satisfação' },
                                { val: '85%', label: 'dos gestores afirmam que a tomada de decisão ficou mais eficiente' },
                                { val: '68%', label: 'das empresas afirma que o engajamento aumentou em apenas 2 meses' },
                                { val: '98%', label: 'dos usuários aderiram nas primeiras semanas' },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-4 text-center flex-1 min-w-[140px]">
                                    <div className="w-28 h-28 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-transparent text-brand-dark font-bold text-3xl">
                                        {stat.val}
                                    </div>
                                    <p className="text-xs text-gray-500 max-w-[140px] font-medium leading-tight">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Dark Blue Footer with Curve */}
         <div className="bg-brand-dark pt-40 pb-12 relative z-10 w-full">
            {/* Top Curve SVG */}
            <div className="absolute top-0 left-0 right-0 h-32 w-full overflow-hidden">
                 <svg viewBox="0 0 1440 120" className="w-full h-full object-cover" preserveAspectRatio="none">
                    <path fill="#f3f4f6" d="M0,0 L1440,0 L1440,60 Q720,120 0,60 Z" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
                    {/* Form */}
                    <div className="text-white space-y-8 max-w-lg pt-12">
                        <div>
                            <label className="block text-sm mb-2">Seu nome*</label>
                            <input type="text" className="w-full bg-transparent border-b border-white/50 focus:border-white outline-none py-2 transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                             <div>
                                <label className="block text-sm mb-2">Seu e-mail*</label>
                                <input type="text" className="w-full bg-transparent border-b border-white/50 focus:border-white outline-none py-2 transition-colors" />
                            </div>
                             <div>
                                <label className="block text-sm mb-2">Seu telefone*</label>
                                <input type="text" className="w-full bg-transparent border-b border-white/50 focus:border-white outline-none py-2 transition-colors" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm mb-2">Mensagem*</label>
                            <input type="text" className="w-full bg-transparent border-b border-white/50 focus:border-white outline-none py-2 transition-colors" />
                        </div>
                        
                        <button className="bg-[#E5E5E5] text-brand-dark px-8 py-2 rounded-full font-bold text-sm mt-4 hover:bg-white transition-colors">
                            Enviar
                        </button>

                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-2">Fale conosco</h2>
                            <p className="text-xs opacity-80 max-w-xs leading-relaxed">
                                Nos envie uma mensagem preenchendo o formulário, entraremos em contato o mais rápido o possível!
                            </p>
                            <div className="mt-8">
                                <p className="text-xs opacity-80 mb-1">Se preferir, tire suas dúvidas através do telefone:</p>
                                <p className="text-2xl font-bold tracking-wide">(21)3084-5500</p>
                            </div>
                        </div>
                    </div>

                    {/* Image - Woman */}
                    <div className="relative h-full flex items-end justify-end mt-12 lg:mt-0">
                         <img 
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop"
                            alt="Woman looking at phone"
                            className="w-full max-w-md object-cover relative z-20 drop-shadow-2xl rounded-b-lg"
                            style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                         />
                    </div>
                </div>
            </div>
         </div>
      </section>
    </div>
  );
};