import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/error-boundary.tsx';
import Extensions from './extension.tsx';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Extensions />
    </ErrorBoundary>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
