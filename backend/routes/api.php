<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VacinaController;
use App\Http\Controllers\EsquemaVacinalController;
use App\Http\Controllers\TipoVacinaController;
use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\AplicacaoController;
use App\Http\Controllers\ProfissionalController;
use App\Http\Controllers\AgendamentoVacinaController;
use App\Http\Controllers\RecomendacaoVacinaController;
use App\Http\Controllers\MedicamentosMaisProcuradosController;
use App\Http\Controllers\EstoqueController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\NotificacaoController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\CalendarioVacinalController;
use Illuminate\Support\Facades\Broadcast;


// Rota para obter informações do usuário autenticado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas acessíveis para todos os usuários autenticados (usuários comuns e administradores)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('aplicacoes', AplicacaoController::class);  // Acessível para todos
    Route::apiResource('esquemas-vacinais', EsquemaVacinalController::class);
    Route::apiResource('recomendacoes-vacinas', RecomendacaoVacinaController::class);
    Route::get('/recomendacoes-vacinas/gerar-automaticas/{pacienteId}', [RecomendacaoVacinaController::class, 'gerarAutomaticas']);
    Route::apiResource('agendamentos-vacinas', AgendamentoVacinaController::class);
    Route::apiResource('calendarios-vacinais', CalendarioVacinalController::class);
    // rota para notificação de agendamento de vacina
    Route::post('/agendamentos-vacinas/{pacienteId}/{vacinaId}/enviar-notificacao', [AgendamentoVacinaController::class, 'enviarNotificacao']);

});

// Rotas que apenas administradores podem acessar
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('tipos-vacinas', TipoVacinaController::class);
    Route::apiResource('fornecedores', FornecedorController::class);
    Route::apiResource('vacinas', VacinaController::class);
    Route::apiResource('profissionais', ProfissionalController::class);
    Route::apiResource('estoque', EstoqueController::class);
    Route::apiResource('pacientes', PacienteController::class);
    // 🔔 rota para notificação de paciente
    Route::post('/pacientes/{id}/enviar-notificacao', [PacienteController::class, 'enviarNotificacao']);
});

// Rota de login com Google
Route::get('/auth/google', [LoginController::class, 'redirectToGoogle']);
Route::any('/auth/google/callback', [LoginController::class, 'handleGoogleCallback']);

// Rota para consultar CEP via API
Route::get('/consultar-cep/{cep}', [FornecedorController::class, 'consultarCep']);
Route::get('/pacientes/consultar-cep/{cep}', [PacienteController::class, 'consultarCep']);

Route::get('/pacientes/{id}/historico/exportar', [PacienteController::class, 'exportarHistorico']);


Route::get('/relatorios', [RelatorioController::class, 'index']);
Route::get('/relatorios/exportar', [RelatorioController::class, 'exportar']);


Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    // Revoga o token do usuário autenticado
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logout realizado com sucesso'], 200);
});

// Rotas para usuários comuns verem medicamentos e farmacêuticos para retiradas
Route::middleware('auth:sanctum')->group(function () {
});

// Rotas para notificações
Route::get('/notificacoes', [NotificacaoController::class, 'index']);
Route::get('/notificacoes-nao-lidas', [NotificacaoController::class, 'naoLidas']);
Route::post('/notificacoes/{id}/ler', [NotificacaoController::class, 'marcarComoLida']);
Route::post('/notificacoes/marcar-todas-lidas', [NotificacaoController::class, 'marcarTodasComoLidas']);
Route::delete('/notificacoes/{id}', [NotificacaoController::class, 'destroy']);
Route::delete('/notificacoes', [NotificacaoController::class, 'destroyAll']);

Route::get('/alertas', [EstoqueController::class, 'verificarAlertas']);

//rota braodcast
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');

// Rota para testar o Pusher
Route::post('/teste-pusher', [EstoqueController::class, 'dispararEventoTeste'])
    ->middleware('auth:sanctum');
