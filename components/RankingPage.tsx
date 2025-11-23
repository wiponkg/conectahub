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

  // Calculate position along the diagonal line
  const getPosition = (index: number, total: number) => {
    // Horizontal: Start at 12% and end at 88% to prevent edge clipping
    const startX = 12;
    const endX = 88;
    const step = (endX - startX) / (total - 1);
    const left = startX + index * step;
    
    // Vertical: Linear interpolation
    // Start Y: 60% (Lower on the screen, left side)
    // End Y: 15% (Higher on the screen, right side)
    const startY = 60;
    const endY = 15;
    const progress = index / (total - 1);
    const top = startY - (progress * (startY - endY));
    
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <div className="h-screen w-full relative bg-brand-dark overflow-hidden font-sans">
        
        {/* White Diagonal Stripe */}
        {/* 
            Adjusted clip path to align with the avatar positions
        */}
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
                        className="absolute flex flex-col items-center group"
                        style={{ 
                            left: pos.left, 
                            top: pos.top,
                            transform: 'translate(-50%, -50%)' // Center the avatar on the point
                        }}
                    >
                        {/* Avatar Circle - Responsive sizing to ensure 7 items fit */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-[3px] border-white/50 shadow-2xl relative z-20 transition-transform duration-300 group-hover:scale-110 cursor-pointer bg-gray-200">
                            <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Vertical Pole Line */}
                        {/* Extends downwards from the avatar into the white area */}
                        <div className="w-[1px] md:w-[2px] h-32 md:h-64 bg-gray-300/80 -mt-1 shadow-sm"></div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};