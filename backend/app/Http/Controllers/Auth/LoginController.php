<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function handleGoogleCallback(Request $request)
    {
        $credential = $request->input('credential');

        if (!$credential) {
            return response()->json(['error' => 'Credencial inválida.'], 400);
        }

        // Verifica a credencial com o Google
        $client = new Client();
        $response = $client->post('https://oauth2.googleapis.com/tokeninfo', [
            'form_params' => [
                'id_token' => $credential,
            ],
        ]);

        $googleUser = json_decode($response->getBody()->getContents());

        if (!$googleUser) {
            return response()->json(['error' => 'Erro ao validar token com o Google.'], 401);
        }

        // Encontre ou crie o usuário no seu sistema
        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'password' => Hash::make(Str::random(24)), // Cria uma senha aleatória
                'role' => 'user', // Define o papel padrão como 'user'
            ]);
        }

        // Cria um token de autenticação
        $token = $user->createToken('auth_token')->plainTextToken;

        // Retorna o token e o papel do usuário
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $user->role, // Retorna o papel do usuário
        ]);
    }
}
