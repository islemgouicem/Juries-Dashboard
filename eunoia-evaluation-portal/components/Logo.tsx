import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <h1 className="text-3xl font-serif tracking-widest text-[#d4af37] uppercase" style={{ fontFamily: 'serif' }}>Eunoia</h1>
    <span className="text-[0.6rem] tracking-[0.3em] text-gray-400 uppercase">By Skill & Tell</span>
  </div>
);