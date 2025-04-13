import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <header className="container text-center">
        <div
          className="title-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "1rem 0",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
          }}
        >
          <h1
            className="text-accent"
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "2.5rem",
              letterSpacing: "0.2rem",
            }}
          >
            H.A.L.O
          </h1>
          <h2
            className="text-muted"
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: "normal",
              textAlign: "center",
              letterSpacing: "0.1rem",
            }}
          >
            Human Assistance Logistics Operator
          </h2>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="container mt-1 text-center">
        <p
          className="text-accent"
          style={{
            fontSize: "0.9rem",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
          }}
        >
          © 2025 H.A.L.O - Human Assistance Logistics Operator
        </p>
      </footer>
    </div>
  );
};

export default Layout;
