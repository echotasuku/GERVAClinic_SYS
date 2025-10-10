import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleLoginComponent.css';

const GoogleLoginComponent = ({ onSuccess, onFailure }) => {
  return (
    <div className="login-screen">
      <h2>Bem vindo(a)!</h2>
      <p>Utilize sua conta google para continuar</p>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure}
          shape="pill"
      />
    </div>
  );
};

export default GoogleLoginComponent;
