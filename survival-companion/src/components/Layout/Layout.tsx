import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <header className="container">
        <h1 className="text-accent">Post-Apocalyptic Survival Companion</h1>
      </header>
      <main className="container">
        {children}
      </main>
      <footer className="container mt-1">
        <p className="text-accent">© 2025 Post-Apocalyptic Survival Companion</p>
      </footer>
    </div>
  );
};

export default Layout;