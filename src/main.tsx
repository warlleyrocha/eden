import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import './assets/styles/print.css';
import { App } from './App.tsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <App />
  </StrictMode>
);
