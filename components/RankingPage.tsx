import React from 'react';

export const RankingPage: React.FC = () => {
  const users = [
    { id: 1, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', name: 'Director', pos: 1 }, 
    { id: 2, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', name: 'Manager', pos: 2 },
    { id: 3, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', name: 'Lead', pos: 3 },
    { id: 4, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', name: 'Dev', pos: 4 },
    { id: 5, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', name: 'Designer', pos: 5 },
    { id: 6, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', name: 'HR', pos: 6 },
    { id: 7, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', name: 'CEO', pos: 7 },
  ];

  // Calculate position along the diagonal line matching the background clip-path
  // Background diagonal goes from (0, 65%) to (100, 20%)
  // Equation: y = 65 - 0.45 * x
  const getPosition = (index: number, total: number) => {
    // Spread evenly from 10% to 90% of the screen width
    const startX = 10;
    const endX = 90;
    
    // Calculate X percentage
    const progress = index / (total - 1);
    const left = startX + progress * (endX - startX);
    
    // Calculate Y based on the background slope to keep them aligned
    // The line is y = 65 - 0.45x. We want avatars slightly above this line.
    // Let's offset by -8% to place the center of the avatar above the line.
    const groundY = 65 - (0.45 * left);
    const top = groundY - 6; 
    
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <div className="h-screen w-full relative bg-brand-dark overflow-hidden font-sans animate-fade-in">
        
        {/* White Diagonal Stripe */}
        <div 
            className="absolute inset-0 bg-white z-0 shadow-2xl"
            style={{ 
                clipPath: 'polygon(0 65%, 100% 20%, 100% 60%, 0 100%)' 
            }}
        />

        {/* Title */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-md">Ranking</h1>
        </div>

        {/* Avatars Container */}
        <div className="absolute inset-0 z-10 pointer-events-none">
            {users.map((user, index) => {
                const pos = getPosition(index, users.length);
                return (
                    <div 
                        key={user.id}
                        className="absolute flex flex-col items-center group pointer-events-auto"
                        style={{ 
                            left: pos.left, 
                            top: pos.top,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Avatar Circle */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-[3px] border-white/50 shadow-2xl relative z-20 transition-transform duration-300 group-hover:scale-110 cursor-pointer bg-gray-200">
                            <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Vertical Pole Line */}
                        <div className="w-[1px] md:w-[2px] h-48 md:h-80 bg-gray-300/80 -mt-1 shadow-sm opacity-60"></div>

                        {/* Rank Badge (Optional enhancement) */}
                        <div className="absolute -top-3 -right-3 w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white shadow-md z-30">
                            {user.pos}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};