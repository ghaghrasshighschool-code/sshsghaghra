import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter is required for GitHub Pages so direct links/refreshes don't break */}
    <HashRouter basename="/sshsghaghra">
      <App />
    </HashRouter>
  </StrictMode>,
)
