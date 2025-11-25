
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { Menu, X, Calculator, MessageCircle, Users, Gamepad2, MapPin, Mail, Phone, ArrowRight, Instagram, Linkedin, Facebook, Sun, Moon } from 'lucide-react';
import { useTheme } from '../App';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

type PageState = 'HOME' | 'ABOUT' | 'CONTACT';

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<PageState>('HOME');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme(); 

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: PageState) => {
    setActivePage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const serviceCards = [
    {
      icon: Calculator,
      title: "Ferramentas",
      description: "Acesse calculadoras, holerites e utilitários essenciais para o seu dia a dia.",
      hasMargin: true,
      view: 'DASHBOARD_CALENDAR' as ViewState
    },
    {
      icon: MessageCircle,
      title: "Comunicação",
      description: "Chat integrado e avisos importantes em tempo real para toda a equipe.",
      hasMargin: false,
      view: 'DASHBOARD_CHAT' as ViewState
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Interaja com seus colegas, compartilhe ideias e fortaleça o espírito de equipe.",
      hasMargin: false,
      view: 'DASHBOARD_HOME' as ViewState
    },
    {
      icon: Gamepad2,
      title: "Gamificação",
      description: "Participe de desafios, conquiste pontos e suba no ranking da empresa.",
      hasMargin: true,
      view: 'DASHBOARD_POINTS' as ViewState
    }
  ];

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-800'}`}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-hero-enter {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .delay-200 { animation-delay: 200ms; }

        /* 3D Flip Card Styles */
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto w-full z-50 transition-all duration-300 ${
            isScrolled || isMenuOpen
                ? (isDarkMode ? 'bg-slate-950/95 backdrop-blur-md shadow-lg' : 'bg-white/95 backdrop-blur-md shadow-sm') 
                : 'bg-transparent py-6'
        } ${isScrolled ? 'md:rounded-b-2xl' : ''}`}
      >
        <Logo onClick={() => onNavigate('LANDING')} isDark={isDarkMode} />
        
        {/* Desktop Nav */}
        <nav 
            className={`hidden md:flex gap-10 text-sm font-medium transition-all duration-500 ease-in-out ${
                isScrolled 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-4 pointer-events-none'
            } ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
        >
          <button 
            onClick={() => handleNavClick('HOME')} 
            className={`transition-colors ${activePage === 'HOME' ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-900 font-bold') : 'hover:text-blue-600'}`}
          >
            Início
          </button>
          <button 
            onClick={() => handleNavClick('ABOUT')} 
            className={`transition-colors ${activePage === 'ABOUT' ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-900 font-bold') : 'hover:text-blue-600'}`}
          >
            Sobre nós
          </button>
          <button 
            onClick={() => handleNavClick('CONTACT')} 
            className={`transition-colors ${activePage === 'CONTACT' ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-900 font-bold') : 'hover:text-blue-600'}`}
          >
            Contato
          </button>
        </nav>
        
        {/* Desktop Buttons */}
        <div 
            className={`hidden md:flex gap-6 items-center transition-all duration-500 ease-in-out ${
                isScrolled 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <button 
             onClick={toggleTheme}
             className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={() => onNavigate('LOGIN')}
            className={`text-sm font-medium hover:text-blue-600 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="px-8 py-2.5 text-sm font-bold text-white bg-[#312E81] rounded-lg hover:bg-indigo-900 transition-all shadow-sm"
          >
            Cadastre-se
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
            <button 
             onClick={toggleTheme}
             className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400' : 'text-slate-600'}`}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
                className={isDarkMode ? 'text-white' : 'text-gray-700'}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>

        {/* Mobile Menu Dropdown - Full width below header */}
        {isMenuOpen && (
          <div className={`absolute top-full left-0 right-0 shadow-2xl p-6 flex flex-col gap-6 md:hidden border-b z-50 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
             <nav className={`flex flex-col gap-4 text-base font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                <button onClick={() => handleNavClick('HOME')} className={`text-left py-2 px-4 rounded-lg hover:bg-opacity-10 ${activePage === 'HOME' ? 'bg-blue-500/10 text-blue-500 font-bold' : ''}`}>Início</button>
                <button onClick={() => handleNavClick('ABOUT')} className={`text-left py-2 px-4 rounded-lg hover:bg-opacity-10 ${activePage === 'ABOUT' ? 'bg-blue-500/10 text-blue-500 font-bold' : ''}`}>Sobre nós</button>
                <button onClick={() => handleNavClick('CONTACT')} className={`text-left py-2 px-4 rounded-lg hover:bg-opacity-10 ${activePage === 'CONTACT' ? 'bg-blue-500/10 text-blue-500 font-bold' : ''}`}>Contato</button>
             </nav>
             <div className={`flex flex-col gap-3 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <button 
                  onClick={() => onNavigate('LOGIN')}
                  className={`w-full py-3 text-center font-bold border rounded-lg transition-colors ${isDarkMode ? 'text-slate-200 border-slate-700 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Entrar
                </button>
                <button 
                  onClick={() => onNavigate('REGISTER')}
                  className="w-full py-3 text-center text-white bg-[#312E81] font-bold rounded-lg hover:bg-indigo-900"
                >
                  Cadastre-se
                </button>
             </div>
          </div>
        )}
      </header>

      {/* ================= HOME PAGE CONTENT ================= */}
      {activePage === 'HOME' && (
        <div className="flex-1">
            {/* Hero Section */}
            <section className={`relative transition-colors duration-300 pt-28 md:pt-32 ${isDarkMode ? 'bg-slate-900' : 'bg-[#fcfcfc]'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-8 pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        
                        {/* Left: Text */}
                        <div className="space-y-6 animate-hero-enter max-w-xl text-center md:text-left">
                            <h1 className={`text-4xl md:text-[3.25rem] font-bold leading-[1.15] transition-colors ${isDarkMode ? 'text-blue-100' : 'text-[#0e0e52]'}`}>
                                “Mais do que um canal interno, uma &nbsp;
                                <span className={isDarkMode ? 'text-blue-400' : 'text-[#0e0e52]'}>comunidade</span><br />
                                de conexões reais”
                            </h1>
                            <p className={`text-sm md:text-[0.95rem] leading-relaxed max-w-md mx-auto md:mx-0 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                Rápido, intuitivo e conectado é a nossa cultura, a ConectaHub é o jeito mais fácil de ficar informado e participar do que acontece dentro de sua empresa.
                            </p>
                            <div className="pt-4 flex justify-center md:justify-start">
                                <button 
                                    onClick={() => onNavigate('REGISTER')}
                                    className="px-10 py-3 bg-[#3B82F6] text-white rounded-full text-sm font-bold shadow-md hover:bg-blue-600 transition-transform transform hover:-translate-y-0.5"
                                >
                                    Conecte-se
                                </button>
                            </div>
                        </div>

                        {/* Right: Circle Geometric Image */}
                        <div className="relative animate-hero-enter delay-200 flex justify-center md:justify-end mt-8 md:mt-0">
                             <div className="relative w-[280px] md:w-full max-w-[500px] aspect-square">
                                {/* The Geometric Shape (Purple Background) */}
                                <div className="absolute inset-0 rounded-full bg-[#8c8cf5] shadow-2xl"></div>
                                
                                {/* The Photo Layer (Masked to Circle) */}
                                <div className="absolute inset-0 overflow-hidden rounded-full border-[6px] border-transparent">
                                    <img 
                                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                                        alt="Team collaboration" 
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: 'center 20%' }}
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Curved Separator */}
                <div className="absolute bottom-0 left-0 right-0 w-full translate-y-[98%] z-10">
                   {/* This matches the grey dip in the print */}
                   <svg viewBox="0 0 1440 100" className="w-full h-auto min-h-[40px] md:min-h-[60px]" preserveAspectRatio="none">
                        <path fill={isDarkMode ? '#0f172a' : '#b4b8c5'} d="M0,0 C480,100 960,100 1440,0 L1440,0 L0,0 Z" className="transition-colors duration-300" />
                   </svg>
                </div>
            </section>

            {/* Blue Section */}
            <section className={`pt-24 pb-20 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#0e0e52]'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-16">
                    
                    {/* Top Banner Image */}
                    <div className="w-full h-[200px] md:h-[350px] overflow-hidden relative shadow-2xl rounded-xl md:rounded-none">
                        <img 
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000" 
                            alt="Meeting Room" 
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center 55%' }}
                        />
                         {/* Blue Tint Overlay */}
                         <div className={`absolute inset-0 opacity-20 mix-blend-color ${isDarkMode ? 'bg-slate-950' : 'bg-[#0e0e52]'}`}></div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
                        
                        {/* Left Column */}
                        <div className="space-y-8">
                            <h2 className="text-white text-3xl md:text-[2.5rem] font-bold leading-tight">
                                Conectar pessoas é fortalecer resultados
                            </h2>
                            <div className="w-full h-64 overflow-hidden shadow-lg border-4 border-white/5 rounded-xl md:rounded-none">
                                <img 
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" 
                                    alt="Office environment" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8 md:pt-4">
                            <div className="w-full h-64 overflow-hidden shadow-lg border-4 border-white/5 rounded-xl md:rounded-none">
                                <img 
                                    src="https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1000" 
                                    alt="Working together" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                                Acreditamos que uma empresa forte começa pela forma como se comunica. Por isso, criamos um portal feito para você: claro, intuitivo e cheio de conteúdo relevante.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
      )}

      {/* ================= ABOUT US PAGE ================= */}
      {activePage === 'ABOUT' && (
        <div className="flex-1 animate-hero-enter">
            {/* Blue Header Section */}
            <section className={`pt-28 md:pt-32 pb-32 md:pb-48 relative overflow-visible text-white transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#0e0e52]'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="max-w-3xl animate-fade-in text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-6">Quem somos?</h1>
                        <p className="text-lg leading-relaxed text-blue-100 mb-12">
                            A Conectahub foi criada para aproximar pessoas, informações e iniciativas, ele funciona como
                            um ponto central onde todos os colaboradores podem se conectar, colaborar e se manter
                            atualizados sobre tudo o que acontece no nosso ambiente de trabalho.
                        </p>

                        <h2 className="text-2xl font-semibold mb-8">Nossos serviços:</h2>
                    </div>
                </div>

                {/* Curved Bottom */}
                <div className={`absolute -bottom-1 left-0 right-0 h-24 md:h-32 rounded-t-[50%] scale-x-150 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}></div>
            </section>

            {/* Floating Cards Section (Interactive Flip) */}
            <div className="relative z-10 -mt-32 md:-mt-48 max-w-7xl mx-auto px-6 md:px-8 mb-24">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                    {serviceCards.map((card, index) => (
                        <div 
                            key={index}
                            onClick={() => onNavigate(card.view)}
                            className={`group perspective-1000 w-full aspect-[3/4] ${card.hasMargin ? 'md:mt-24' : ''} cursor-pointer max-w-[300px] mx-auto`}
                        >
                            <div className="relative w-full h-full duration-700 transform-style-3d group-hover:rotate-y-180 shadow-2xl rounded-2xl transition-all">
                                {/* Front Face */}
                                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden shadow-lg border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f2f2f2] border-gray-100'}`}>
                                    <card.icon className={`w-16 h-16 md:w-20 md:h-20 transition-colors duration-500 ${isDarkMode ? 'text-slate-500 group-hover:text-blue-400' : 'text-gray-300 group-hover:text-blue-500'}`} strokeWidth={1.5} />
                                </div>
                                {/* Back Face */}
                                <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-center p-6 backface-hidden rotate-y-180 border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-blue-500' : 'bg-[#0e0e52] border-blue-900'}`}>
                                    <div className="bg-blue-600/20 p-3 rounded-full mb-4">
                                        <card.icon className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-3">{card.title}</h3>
                                    <p className="text-blue-100/80 text-sm leading-relaxed font-light">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Stats Section */}
            <section className="pb-24 px-4 md:px-8 max-w-7xl mx-auto">
                 <h2 className={`text-2xl md:text-4xl font-bold text-center mb-12 transition-colors ${isDarkMode ? 'text-blue-200' : 'text-[#0e0e52]'}`}>
                    Nossos números falam por nós
                 </h2>

                 <div className={`rounded-[2.5rem] p-8 md:p-16 shadow-inner relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#dcdde1]'}`}>
                    <div className="flex flex-col lg:flex-row gap-12 lg:items-center justify-between">
                        
                        {/* Text Stats */}
                        <div className="flex flex-col gap-6 md:gap-10 min-w-max text-center lg:text-left">
                            <div>
                                <span className={`block text-3xl md:text-5xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>+10 milhões</span>
                                <span className={`text-base md:text-lg ml-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>de acessos</span>
                            </div>
                            <div>
                                <span className={`block text-3xl md:text-5xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>+1,500</span>
                                <span className={`text-base md:text-lg ml-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>empresas</span>
                            </div>
                        </div>

                        {/* Circular Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full">
                            {[
                                { val: '93%', label: 'de satisfação' },
                                { val: '85%', label: 'dos gestores afirmam que a tomada de decisão ficou mais eficiente' },
                                { val: '68%', label: 'das empresas afirma que o engajamento aumentou em apenas 2 meses' },
                                { val: '98%', label: 'dos usuários aderiram nas primeiras semanas' }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-3">
                                    <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-[6px] flex items-center justify-center bg-transparent transition-colors ${isDarkMode ? 'border-blue-500' : 'border-[#3B82F6]'}`}>
                                        <span className={`text-lg md:text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>{stat.val}</span>
                                    </div>
                                    <p className={`text-xs md:text-sm font-medium leading-tight max-w-[120px] ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                 </div>
            </section>
        </div>
      )}

      {/* ================= CONTACT PAGE ================= */}
      {activePage === 'CONTACT' && (
        <div className="flex-1 animate-hero-enter flex flex-col items-center justify-center pt-28 md:pt-32 pb-20">
            
            <div className="max-w-7xl w-full mx-auto px-6 md:px-8">
                <div className="text-center mb-12">
                     <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Fale Conosco</h2>
                     <h1 className={`text-4xl md:text-5xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#0e0e52]'}`}>Vamos começar uma conversa</h1>
                     <p className={`mt-4 max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Estamos prontos para ouvir você. Preencha o formulário ou entre em contato pelos nossos canais diretos.
                     </p>
                </div>

                {/* Split Modern Card */}
                <div className={`rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    
                    {/* Left: Brand / Contact Info Side */}
                    <div className={`p-10 md:p-14 md:w-2/5 flex flex-col justify-between relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-[#0e0e52]'}`}>
                        {/* Decorative Circles */}
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-6">Informações de Contato</h3>
                            <p className="text-blue-200 text-sm leading-relaxed mb-10">
                                Preencha o formulário e nossa equipe entrará em contato em até 24 horas.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 text-blue-100 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-3 bg-white/10 rounded-lg group-hover:bg-blue-600 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-300 font-medium">Telefone</p>
                                        <p className="font-semibold text-lg">(21) 3084-5500</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4 text-blue-100 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-3 bg-white/10 rounded-lg group-hover:bg-blue-600 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-300 font-medium">Email</p>
                                        <p className="font-semibold text-lg">contato@conectahub.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 text-blue-100 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-3 bg-white/10 rounded-lg group-hover:bg-blue-600 transition-colors">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-300 font-medium">Localização</p>
                                        <p className="font-semibold text-lg">Rio de Janeiro, Brasil</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12">
                             <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 text-white cursor-pointer transition-colors">
                                    <Instagram size={18} />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 text-white cursor-pointer transition-colors">
                                    <Linkedin size={18} />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 text-white cursor-pointer transition-colors">
                                    <Facebook size={18} />
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right: Modern Form Side */}
                    <div className={`flex-1 p-8 md:p-14 relative transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                         <form className="h-full flex flex-col justify-center space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Seu Nome</label>
                                    <input 
                                        type="text" 
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400 focus:bg-white'}`}
                                        placeholder="João Silva"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Telefone</label>
                                    <input 
                                        type="tel" 
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400 focus:bg-white'}`}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Email Corporativo</label>
                                <input 
                                    type="email" 
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400 focus:bg-white'}`}
                                    placeholder="joao@empresa.com.br"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Como podemos ajudar?</label>
                                <textarea 
                                    rows={4}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400 focus:bg-white'}`}
                                    placeholder="Descreva sua dúvida ou solicitação..."
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button className="group w-full md:w-auto px-8 py-4 bg-[#0e0e52] hover:bg-blue-900 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                    Enviar Mensagem
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                         </form>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
