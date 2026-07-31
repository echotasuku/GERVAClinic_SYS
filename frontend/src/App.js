import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import Sidebar from './Pages/Sidebar';
import Home from './Pages/Home';
import TipoVacina from './components/TipoVacina';
import Fornecedores from './components/Fornecedores';
import Profissionais from './components/Profissionais';
import Vacinas from './components/Vacinas';
import Estoque from './components/Estoque';
import Notificacoes from './components/Notificacoes';
import Pacientes from './components/Pacientes';
import Aplicacoes from './components/Aplicacoes';
import AgendamentoVacina from './components/AgendamentoVacina';
import RecomendacaoVacina from './components/RecomendacaoVacina';

import GoogleLoginComponent from './components/GoogleLoginComponent';
import './App.css';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthenticated(true);
      const role = localStorage.getItem('user_role');
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (response) => {
    const credential = response.credential;
    if (credential) {
      axios.post('http://127.0.0.1:8080/api/auth/google/callback', { credential })
        .then((res) => {
          const { access_token, role } = res.data;
          localStorage.setItem('auth_token', access_token);
          localStorage.setItem('user_role', role);
          setAuthenticated(true);
          setUserRole(role);
        })
        .catch((error) => {
          console.error('Erro ao autenticar com o backend:', error);
        });
    }
  };

  const handleLoginFailure = (error) => {
    console.error('Erro ao fazer login:', error);
  };

  const handleLogout = () => {
    // Remover o token e papel de usuário do localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setAuthenticated(false);
    setUserRole(null);
  };

  return (
    <GoogleOAuthProvider clientId="890074811594-v5qqurukhhacp1mjr40vkkm3gsnathsh.apps.googleusercontent.com">
      <Router>
        <div className="App">
          {authenticated ? (
            <>
              
              <Sidebar onLogout={handleLogout} userRole={userRole} />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Navigate to="/home" />} />
                  <Route path="/home" element={<Home />} />

                  {/* Rotas acessíveis para todos os usuários */}
                  <Route path="/agendamento-vacina" element={<AgendamentoVacina />} />
                  <Route path="/recomendacao-vacina" element={<RecomendacaoVacina />} />
                  

                  {/* Rotas acessíveis para administradores */}
                  {userRole === 'admin' && (
                    <>
                      <Route path="/Tipo Vacina" element={<TipoVacina />} />
                      <Route path="/fornecedores" element={<Fornecedores />} />
                      <Route path="/aplicacoes" element={<Aplicacoes />} />
                      <Route path="/profissionais" element={<Profissionais />} />
                      <Route path="/vacinas" element={<Vacinas />} />
                      <Route path="/estoque" element={<Estoque />} />
                      <Route path="/notificacoes" element={<Notificacoes />} />
                        <Route path="/pacientes" element={<Pacientes />} />
                    </>
                  )}
                </Routes>
              </div>
            </>
          ) : (
            <GoogleLoginComponent
              onSuccess={handleLoginSuccess}
              onFailure={handleLoginFailure}
            />
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
