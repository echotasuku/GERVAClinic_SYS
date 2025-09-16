import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginComponent = ({ onSuccess, onFailure }) => {
  return (
    <div className="login-screen">
      <h2>Login com o Google</h2>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure}
      />
    </div>
  );
};

export default GoogleLoginComponent;
