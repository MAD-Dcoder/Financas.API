import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx' // <-- ADICIONE AQUI
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- ENVOLVA O APP AQUI */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)