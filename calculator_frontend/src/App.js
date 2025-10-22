import React from 'react';
import './index.css';
import './styles/theme.css';
import Calculator from './components/Calculator';

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Minimal entry that centers the Calculator and applies the Ocean Professional theme.
   * The Calculator component implements all UI and logic, including keyboard support.
   */
  return (
    <div className="app-root">
      <main className="page">
        <Calculator />
      </main>
    </div>
  );
}
