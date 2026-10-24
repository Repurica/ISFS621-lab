import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/public-sans';
import App from './App';
import './styles/base.css';
import './styles/screens.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container was not found.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
