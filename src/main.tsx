/* ListinoHub — © PezzaliAPP — MIT License */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root non trovato');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
