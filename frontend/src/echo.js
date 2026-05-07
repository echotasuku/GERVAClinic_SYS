import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem('auth_token');

const echo = new Echo({
    broadcaster: 'pusher',
    key: '30efc526b0c27ab967b5',
    cluster: 'mt1',
    forceTLS: true,
    authEndpoint: 'http://127.0.0.1:8080/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
});

// Log para debug
echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher conectado com sucesso!');
});

echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Erro no Pusher:', err);
});

export default echo;