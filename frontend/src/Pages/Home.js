import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Capturar o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Armazenar o token no localStorage
      localStorage.setItem('accessToken', token);

      // Opcional: Redirecionar para outra página ou manter na home
      // navigate('/alguma-outra-pagina'); // Se houver necessidade de redirecionar
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <h1>Bem-vindo a Secretaria de Saúde</h1>
      <p>Olá farmacêutico/paciente</p>
    </div>
  );
};

export default Home;
