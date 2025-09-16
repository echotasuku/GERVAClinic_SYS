// src/components/InitialScreen.js

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const InitialScreen = () => {
  const navigate = useNavigate();

  const handleSuccess = (response) => {
    // Enviar o token para o backend para autenticação
    const token = response.credential;

    fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(response => response.json())
      .then(data => {
        // Salvar o token JWT no localStorage ou state
        localStorage.setItem('token', data.token);
        navigate('/main'); // Redirecionar para a tela principal
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="initial-screen">
      <h1>Bem-vindo ao Sistema</h1>
      <GoogleLogin
        onSuccess={handleSuccess}
        onFailure={(error) => console.error('Login Failed:', error)}
      />
    </div>
  );
};

export default InitialScreen;
