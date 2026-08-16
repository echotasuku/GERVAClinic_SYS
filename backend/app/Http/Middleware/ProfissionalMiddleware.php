<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class ProfissionalMiddleware
{
    public function handle($request, Closure $next)
    {
        // Verifica se o usuário está autenticado
        if (!Auth::check()) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        // PEGA O ROLE DO USUÁRIO
        $role = Auth::user()->role;

        // PERMITE TANTO 'profissional' QUANTO 'admin'
        if ($role === 'profissional' || $role === 'admin') {
            return $next($request);
        }

        // Se não for profissional nem admin, bloqueia
        return response()->json(['error' => 'Acesso não autorizado.'], 403);
    }
}