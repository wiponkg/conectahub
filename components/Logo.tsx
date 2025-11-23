import React from 'react';

export const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div 
    className="flex items-center gap-1 cursor-pointer select-none" 
    onClick={onClick}
  >
    <span className="text-2xl font-bold text-blue-700 tracking-tight">con<span className="text-blue-500">e</span>cta<span className="text-brand-dark">hub</span></span>
    {/* Simple decorative arc to mimic the logo line */}
    <div className="h-2 w-2 rounded-full bg-blue-500 mb-4 ml-[-2px]"></div>
  </div>
);