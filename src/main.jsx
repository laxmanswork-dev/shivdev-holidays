import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './styles/fonts.js'
import './index.css'
import App from './App.jsx'

// A lazy page chunk that 404s or fails to download — typically a tab left
// open across a redeploy, whose old hashed files no longer exist. One
// automatic reload fetches the fresh index.html and its current files; the
// session flag stops a genuine outage from looping. If it still fails, the
// page-level ErrorBoundary (components/common/ErrorBoundary.jsx) takes over.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('preload-reloaded')) return;
    sessionStorage.setItem('preload-reloaded', '1');
  } catch {
    return; // storage unavailable: don't risk a reload loop
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
