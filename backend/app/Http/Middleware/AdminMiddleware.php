<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle($request, Closure $next)
    {
        // Verifica se o usuário está autenticado e se é admin
        if (Auth::check() && Auth::user()->role === 'admin') {
            return $next($request);
        }

        // Se não for admin, retorna uma resposta de não autorizado
        return response()->json(['error' => 'Acesso não autorizado.'], 403);
    }
}
