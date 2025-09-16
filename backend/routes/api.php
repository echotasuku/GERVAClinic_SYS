<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MedicamentoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\RetiradaController;
use App\Http\Controllers\FarmaceuticoController;
use App\Http\Controllers\MedicamentosMaisProcuradosController;
use App\Http\Controllers\EstoqueController;
use App\Http\Controllers\Auth\LoginController;

// Rota para obter informações do usuário autenticado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas acessíveis para todos os usuários autenticados (usuários comuns e administradores)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('retiradas', RetiradaController::class);  // Acessível para todos
});

// Rotas que apenas administradores podem acessar
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('fornecedores', FornecedorController::class);
    Route::apiResource('medicamentos', MedicamentoController::class);
    Route::apiResource('farmaceuticos', FarmaceuticoController::class);
    Route::apiResource('estoque', EstoqueController::class);
});

// Rota de login com Google
Route::get('/auth/google', [LoginController::class, 'redirectToGoogle']);
Route::any('/auth/google/callback', [LoginController::class, 'handleGoogleCallback']);

// Rota para consultar CEP via API
Route::get('/consultar-cep/{cep}', [FornecedorController::class, 'consultarCep']);

// Rota para obter medicamentos mais procurados
Route::get('/medicamentos-mais-procurados', [MedicamentosMaisProcuradosController::class, 'index']);


Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    // Revoga o token do usuário autenticado
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logout realizado com sucesso'], 200);
});

// Rotas para usuários comuns verem medicamentos e farmacêuticos para retiradas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('medicamentos-list', [MedicamentoController::class, 'list']);
    Route::get('farmaceuticos-list', [FarmaceuticoController::class, 'list']);
});
