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
import EsquemaVacinal from './components/EsquemaVacinal';
import Relatorios from './components/Relatorios';
import CalendarioVacinal from './components/CalendarioVacinal';
import PlanejamentoVacinal from './components/PlanejamentoVacinal';
import CarteiraVacinal from './components/CarteiraVacinal';
import Perfil from './components/Perfil';
import Dashboard from './components/Dashboard';
import './components/Dashboard.css';
import GoogleLoginComponent from './components/GoogleLoginComponent';
import './App.css';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (token && role) {
      setAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (response) => {
    const credential = response.credential;
    if (!credential) {
      return;
    }
    axios.post(
      'http://127.0.0.1:8080/api/auth/google/callback',
      { credential }
    )
    .then((res) => {
      const { access_token, role } = res.data;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_role', role);
      setAuthenticated(true);
      setUserRole(role);
    })
    .catch((error) => {
      console.error(
        'Erro ao autenticar com o backend:',
        error
      );
    });
  };

  const handleLoginFailure = (error) => {
    console.error(
      'Erro ao fazer login:',
      error
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setAuthenticated(false);
    setUserRole(null);
  };

  const isAdmin = userRole === 'admin';
  const isProfessional = userRole === 'profissional';
  const isUser = userRole === 'user';
  const canAccessProfessional = isAdmin || isProfessional;

  return (
    <GoogleOAuthProvider
      clientId="890074811594-v5qqurukhhacp1mjr40vkkm3gsnathsh.apps.googleusercontent.com"
    >
      <Router>
        <div className="App">
          {authenticated ? (
            <>
              <Sidebar
                onLogout={handleLogout}
                userRole={userRole}
              />
              <div className="content">
                <Routes>
                  {/* ==================================================
                      HOME
                  ================================================== */}
                  <Route
                    path="/"
                    element={<Navigate to="/home" />}
                  />
                  <Route
                    path="/home"
                    element={<Home />}
                  />
                  <Route
                    path="/perfil"
                    element={<Perfil />}
                  />

                  {/* ==================================================
                      USUÁRIO COMUM
                      PROFISSIONAL E ADMIN TAMBÉM PODEM
                  ================================================== */}
                  {(isUser || canAccessProfessional) && (
                    <>
                      <Route
                        path="/recomendacao-vacina"
                        element={<RecomendacaoVacina />}
                      />
                      <Route
                        path="/carteira-vacinal/:pacienteId"
                        element={<CarteiraVacinal />}
                      />
                    </>
                  )}

                  {/* ==================================================
                      PROFISSIONAL + ADMIN
                  ================================================== */}
                  {canAccessProfessional && (
                    <>
                      <Route
                        path="/agendamento-vacina"
                        element={<AgendamentoVacina />}
                      />
                      <Route
                        path="/aplicacoes"
                        element={<Aplicacoes />}
                      />
                      <Route
                        path="/pacientes"
                        element={<Pacientes />}
                      />
                      <Route
                        path="/esquemas-vacinais"
                        element={<EsquemaVacinal />}
                      />
                      <Route
                        path="/calendario-vacinal"
                        element={<CalendarioVacinal />}
                      />
                      <Route
                        path="/planejamento-vacinal"
                        element={<PlanejamentoVacinal />}
                      />
                      <Route
                        path="/relatorios"
                        element={<Relatorios />}
                      />
                    </>
                  )}

                  {/* ==================================================
                      ADMINISTRADOR
                  ================================================== */}
                  {isAdmin && (
                    <>
                      <Route
                        path="/Tipo Vacina"
                        element={<TipoVacina />}
                      />
                      <Route
                        path="/fornecedores"
                        element={<Fornecedores />}
                      />
                      <Route
                        path="/profissionais"
                        element={<Profissionais />}
                      />
                      <Route
                        path="/vacinas"
                        element={<Vacinas />}
                      />
                      <Route
                        path="/estoque"
                        element={<Estoque />}
                      />
                      <Route
                        path="/notificacoes"
                        element={<Notificacoes />}
                      />
                      <Route
                        path="/dashboard"
                        element={<Dashboard />}
                      />
                    </>
                  )}

                  {/* ==================================================
                      ROTA PARA CAMINHOS NÃO PERMITIDOS
                  ================================================== */}
                  <Route
                    path="*"
                    element={<Navigate to="/home" replace />}
                  />
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