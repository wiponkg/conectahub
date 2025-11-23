import React from 'react';

export const Logo: React.FC<{ onClick?: () => void; isDark?: boolean }> = ({ onClick, isDark }) => (
  <div 
    className="flex items-center gap-1 cursor-pointer select-none" 
    onClick={onClick}
  >
    <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
      con<span className={isDark ? 'text-blue-300' : 'text-blue-500'}>e</span>cta
      <span className={isDark ? 'text-white' : 'text-brand-dark'}>hub</span>
    </span>
    {/* Simple decorative arc to mimic the logo line */}
    <div className={`h-2 w-2 rounded-full mb-4 ml-[-2px] ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
  </div>
);