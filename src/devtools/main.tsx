import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Extensions from './extension.tsx';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <Extensions />
  </StrictMode>
);
