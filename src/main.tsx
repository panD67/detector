import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { ErrorBoundary } from './app/ErrorBoundary'
import { ToastProvider } from './components/ui'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Elemen root tidak ditemukan.')
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
