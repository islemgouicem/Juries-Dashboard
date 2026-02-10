import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="mobai-app">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/background.svg')] bg-cover bg-center opacity-60" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/sections.webp')] bg-cover bg-center opacity-15 mix-blend-screen" />
        {/* Background effects removed for a clean full-screen background */}

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;