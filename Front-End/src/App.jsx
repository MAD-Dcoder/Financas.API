import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { isLoggedIn, handleLoginSuccess } = useContext(AuthContext);

  return isLoggedIn ? <Dashboard /> : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;