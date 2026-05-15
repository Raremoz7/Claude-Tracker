import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import App from './App'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
