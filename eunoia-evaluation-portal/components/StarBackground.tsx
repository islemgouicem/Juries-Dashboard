import React from 'react';

const StarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#1a0b2e] to-black">
      {/* Static Stars simulation using multiple box shadows would be heavy, 
          let's use a few SVGs absolutely positioned to simulate the field */}
      
      {/* Large faint gradient orbs for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]" />
      
      {/* Random small stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-60 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      
      {/* Dust/Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default StarBackground;