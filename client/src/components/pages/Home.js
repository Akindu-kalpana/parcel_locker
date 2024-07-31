import React from 'react';
import "../style/home.css";

export const Home = () => {
     return (
          <div className="home">
      <header className="header">
        <h1>Welcome</h1>
      </header>
      <section className="call-to-action">
        <h2>Ready to get started?</h2>
        <p>Sign up or log</p>
      </section>
      <footer className="footer">
        <p>&copy; 2024 Akindu. All rights reserved.</p>
      </footer>
    </div>
  );
};