import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global font import
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f6f8fc; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #f0f4f8; }
  ::-webkit-scrollbar-thumb { background: #c8d4e0; border-radius: 3px; }
  input:focus, select:focus, textarea:focus { border-color: #2a5bd7 !important; box-shadow: 0 0 0 3px rgba(42,91,215,0.1) !important; outline: none; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
