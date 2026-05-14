
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { isAllowedHost } from './kernel/guard';

const hostname = window.location.hostname;

if (!isAllowedHost(hostname)) {
  // Global Kernel Guard at Boot
  console.error('[KERNEL] FATAL: Unauthorized Host Detected');
  document.body.innerHTML = ' \
    <div style="background: #08090a; color: white; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;"> \
      <div> \
        <h1 style="font-weight: 900; font-style: italic; color: #ff385c; font-size: 3rem;">ACCESS DENIED</h1> \
        <p style="opacity: 0.4; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.2em;">LetsGoFood Kernel Security Enforcement</p> \
      </div> \
    </div> \
  ';
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
