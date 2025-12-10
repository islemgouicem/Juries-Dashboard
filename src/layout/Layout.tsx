import React from "react";
import MouseSparkles from "../components/effects/MouseSparkles";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#430870] text-white relative overflow-x-hidden font-sans">

      {/* Soft radial gradient glows - top right and bottom left */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, rgba(147, 51, 234, 0.3) 25%, transparent 60%)',
          filter: 'blur(60px)',
        }}>
      </div>

      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(126, 34, 206, 0.5) 0%, rgba(126, 34, 206, 0.25) 25%, transparent 60%)',
          filter: 'blur(60px)',
        }}>
      </div>

      {/* Starry background with visible white dots */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Create random star dots */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.7 ? '2px' : '1px',
              height: Math.random() > 0.7 ? '2px' : '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Corner decorative elements - double nested golden L-shapes */}
      <div className="absolute top-4 left-4 z-0 pointer-events-none">
        <div className="relative">
          {/* Outer L-shape */}
          <div className="absolute top-0 left-0 w-28 h-[1.5px] bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
          <div className="absolute top-0 left-0 w-[1.5px] h-28 bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>

          {/* Inner L-shape - tighter gap */}
          <div className="absolute top-1.5 left-1.5 w-24 h-[1.5px] bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
          <div className="absolute top-1.5 left-1.5 w-[1.5px] h-24 bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-0 pointer-events-none">
        <div className="relative">
          {/* Outer L-shape */}
          <div className="absolute bottom-0 right-0 w-28 h-[1.5px] bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
          <div className="absolute bottom-0 right-0 w-[1.5px] h-28 bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>

          {/* Inner L-shape - tighter gap */}
          <div className="absolute bottom-1.5 right-1.5 w-24 h-[1.5px] bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
          <div className="absolute bottom-1.5 right-1.5 w-[1.5px] h-24 bg-gold-design opacity-70"
            style={{ boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}></div>
        </div>
      </div>

      <MouseSparkles />

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;